using AutoMapper;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Interfaces;

namespace Service.Services
{
    public class PlaylistService : IPlaylistService
    {
        private readonly IRepository<Playlist> _repository;
        private readonly IRepository<Song> _songRepository;
        private readonly IMapper _mapper;
        private readonly string _imagePath = Path.Combine(Directory.GetCurrentDirectory(), "Images");

        public PlaylistService(IRepository<Playlist> repository, IRepository<Song> songRepository, IMapper mapper)
        {
            _repository = repository;
            _songRepository = songRepository;
            _mapper = mapper;
        }

        // שיניתי מעט את הלוגיקה של המיפוי כדי לוודא שגם התמונה של השיר הראשון עוברת
        public async Task<List<PlaylistDTO>> GetAll()
        {
            var playlists = await _repository.GetAll();
            var dtos = _mapper.Map<List<Playlist>, List<PlaylistDTO>>(playlists);

            // לוגיקה לתמונה מהשיר הראשון (מעודכן)
            foreach (var dto in dtos)
            {
                var playlistEntity = playlists.First(p => p.Id == dto.Id);
                UpdateCoverFromFirstSong(dto, playlistEntity);
            }

            return dtos;
        }

        // פונקציה חדשה - מחזירה פלייליסטים רק של משתמש ספציפי
        public async Task<List<PlaylistDTO>> GetPlaylistsByUserId(int userId)
        {
            var allPlaylists = await _repository.GetAll();
            var userPlaylists = allPlaylists.Where(p => p.UserId == userId).ToList();
            var dtos = _mapper.Map<List<Playlist>, List<PlaylistDTO>>(userPlaylists);

            // לוגיקה לתמונה מהשיר הראשון
            foreach (var dto in dtos)
            {
                var playlistEntity = userPlaylists.First(p => p.Id == dto.Id);
                UpdateCoverFromFirstSong(dto, playlistEntity);
            }

            return dtos;
        }

        public async Task<PlaylistDetailsDTO> GetById(int id)
        {
            var playlist = await _repository.GetById(id);
            if (playlist == null) return null;

            var dto = _mapper.Map<Playlist, PlaylistDetailsDTO>(playlist);

            // לוגיקה לתמונה מהשיר הראשון (מעודכן)
            UpdateCoverFromFirstSong(dto, playlist);

            return dto;
        }

        // פונקציית עזר פרטית כדי לא לחזור על קוד (חדש)
        private void UpdateCoverFromFirstSong(PlaylistDTO dto, Playlist entity)
        {
            // 1. אם יש לפלייליסט תמונה משלו (שהועלתה ביצירה)
            if (!string.IsNullOrEmpty(dto.PlaylistCoverPath))
            {
                string fullPath = Path.Combine(_imagePath, dto.PlaylistCoverPath);
                if (File.Exists(fullPath))
                {
                    dto.ArrCover = File.ReadAllBytes(fullPath);
                    return; // סיימנו, יש תמונה לפלייליסט
                }
            }

            // 2. אם הגענו לכאן, אין תמונה לפלייליסט - ננסה לקחת מהשיר הראשון (מעודכן)
            if (entity.Songs != null && entity.Songs.Any())
            {
                var firstSong = entity.Songs.OrderBy(s => s.Id).First();

                // נניח שגם תמונות השירים נמצאות באותה תיקיית Images
                // אם הן בתיקייה אחרת, שנה את הנתיב כאן
                if (!string.IsNullOrEmpty(firstSong.CoverSongPath))
                {
                    string songCoverPath = Path.Combine(_imagePath, firstSong.CoverSongPath);
                    if (File.Exists(songCoverPath))
                    {
                        dto.ArrCover = File.ReadAllBytes(songCoverPath);
                    }
                }
            }
        }

        public async Task<PlaylistDTO> AddItem(PlaylistCreateDTO item)
        {
            // וידוא שתיקיית התמונות קיימת (מעודכן - חשוב!)
            if (!Directory.Exists(_imagePath)) Directory.CreateDirectory(_imagePath);

            string coverName = null;

            if (item.FileCover != null)
            {
                coverName = Guid.NewGuid() + Path.GetExtension(item.FileCover.FileName);
                using (var stream = File.Create(Path.Combine(_imagePath, coverName)))
                {
                    await item.FileCover.CopyToAsync(stream);
                }
            }

            var playlist = _mapper.Map<PlaylistCreateDTO, Playlist>(item);
            playlist.PlaylistCoverPath = coverName;
            playlist.Status = true;

            var added = await _repository.AddItem(playlist);
            return _mapper.Map<Playlist, PlaylistDTO>(added);
        }

        public async Task UpdateItem(int id, PlaylistCreateDTO item)
        {
            var existing = await _repository.GetById(id);
            if (existing == null) return;

            if (item.FileCover != null)
            {
                // מחיקת התמונה הישנה (מעודכן - ניקיון השרת)
                if (!string.IsNullOrEmpty(existing.PlaylistCoverPath))
                {
                    string oldCover = Path.Combine(_imagePath, existing.PlaylistCoverPath);
                    if (File.Exists(oldCover)) File.Delete(oldCover);
                }

                string coverName = Guid.NewGuid() + Path.GetExtension(item.FileCover.FileName);
                using (var stream = File.Create(Path.Combine(_imagePath, coverName)))
                {
                    await item.FileCover.CopyToAsync(stream);
                }
                existing.PlaylistCoverPath = coverName;
            }

            existing.PlaylistName = item.PlaylistName;
            await _repository.UpdateItem(id, existing);
        }

        public async Task AddSongToPlaylist(int playlistId, int songId)
        {
            var playlist = await _repository.GetById(playlistId);
            if (playlist == null) throw new InvalidOperationException("פלייליסט לא נמצא");

            var song = await _songRepository.GetById(songId);
            if (song == null) throw new InvalidOperationException("שיר לא נמצא");

            if (playlist.Songs.Any(s => s.Id == songId))
                throw new InvalidOperationException("השיר כבר קיים בפלייליסט");

            playlist.Songs.Add(song);
            await _repository.UpdateItem(playlistId, playlist);
        }

        public async Task RemoveSongFromPlaylist(int playlistId, int songId)
        {
            var playlist = await _repository.GetById(playlistId);
            if (playlist == null) throw new InvalidOperationException("פלייליסט לא נמצא");

            var song = playlist.Songs.FirstOrDefault(s => s.Id == songId);
            if (song == null) throw new InvalidOperationException("השיר לא נמצא בפלייליסט");

            playlist.Songs.Remove(song);
            await _repository.UpdateItem(playlistId, playlist);
        }

        public async Task DeleteItem(int id) => await _repository.DeleteItem(id);
    }
}