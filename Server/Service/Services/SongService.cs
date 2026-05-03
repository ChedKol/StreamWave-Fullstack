using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Dto.Service.Dto;
using Service.Interfaces;

namespace Service.Services
{
    public class SongService : ISongService
    {
        private readonly IRepository<Song> _repository;
        private readonly IRepository<Playlist> _playlistRepository;//גישה לפלייליסט
        private readonly IMapper _mapper;
        private readonly string _imagePath = Path.Combine(Directory.GetCurrentDirectory(), "Images");
        private readonly string _musicPath = Path.Combine(Directory.GetCurrentDirectory(), "Music");

        // הזרקנו כאן גם את רפוזיטורי הפלייליסטים כדי שנוכל לבדוק מה המשתמש אוהב
        public SongService(IRepository<Song> repository, IRepository<Playlist> playlistRepository, IMapper mapper)
        {
            _repository = repository;
            _playlistRepository = playlistRepository;
            _mapper = mapper;
        }
        //public SongService(IRepository<Song> repository, IMapper mapper)
        //{
        //    _repository = repository;
        //    _mapper = mapper;
        //}

        public async Task<List<SongDTO>> GetAll() =>
            _mapper.Map<List<Song>, List<SongDTO>>(await _repository.GetAll());

        public async Task<SongDetailsDTO> GetById(int id)
        {
            var song = await _repository.GetById(id);
            if (song == null) return null;

            //  הגדלת מונה האזנות
            song.CountStream++;
            await _repository.UpdateItem(id, song);
            return _mapper.Map<Song, SongDetailsDTO>(song);
        }


        public async Task<SongDTO> AddItem(SongCreateDTO item)
        {
            string imageName = null;
            string songName = null;

            if (item.FileImage != null)
            {
                imageName = Guid.NewGuid() + Path.GetExtension(item.FileImage.FileName);
                using (var stream = File.Create(Path.Combine(_imagePath, imageName)))
                {
                    await item.FileImage.CopyToAsync(stream);
                }
            }

            if (item.FileSong != null)
            {
                songName = Guid.NewGuid() + Path.GetExtension(item.FileSong.FileName);
                using (var stream = File.Create(Path.Combine(_musicPath, songName)))
                {
                    await item.FileSong.CopyToAsync(stream);
                }
            }

            var song = _mapper.Map<SongCreateDTO, Song>(item);
            song.CoverSongPath = imageName;
            song.SongPath = songName;
            song.Status = true;

            return _mapper.Map<Song, SongDTO>(await _repository.AddItem(song));
        }

        public async Task UpdateItem(int id, SongCreateDTO item)
        {
            var existing = await _repository.GetById(id);
            if (existing == null) return;

            if (item.FileImage != null)
            {
                string oldImage = Path.Combine(_imagePath, existing.CoverSongPath ?? "");
                if (File.Exists(oldImage)) File.Delete(oldImage);

                string imageName = Guid.NewGuid() + Path.GetExtension(item.FileImage.FileName);
                using (var stream = File.Create(Path.Combine(_imagePath, imageName)))
                {
                    await item.FileImage.CopyToAsync(stream);
                }
                existing.CoverSongPath = imageName;
            }

            if (item.FileSong != null)
            {
                string oldSong = Path.Combine(_musicPath, existing.SongPath ?? "");
                if (File.Exists(oldSong)) File.Delete(oldSong);

                string songName = Guid.NewGuid() + Path.GetExtension(item.FileSong.FileName);
                using (var stream = File.Create(Path.Combine(_musicPath, songName)))
                {
                    await item.FileSong.CopyToAsync(stream);
                }
                existing.SongPath = songName;
            }

            existing.SongName = item.SongName;
            existing.Genere = item.Genere;
            existing.ArtistId = item.ArtistId;
            await _repository.UpdateItem(id, existing);
        }

        public async Task DeleteItem(int id) =>
            await _repository.DeleteItem(id);


        // --- פונקציית ההמלצות המתוקנת ---
        public async Task<List<SongDTO>> GetRecommendedSongs(int userId)
        {
            // שליפת כל הפלייליסטים של המשתמש כולל השירים שבהם
            var userPlaylists = (await _playlistRepository.GetAll())
                .Where(p => p.UserId == userId && p.Status)
                .ToList();

            // 1. רשימת ה-IDs של שירים שכבר קיימים אצל המשתמש
            var userSongIds = userPlaylists
                .SelectMany(p => p.Songs ?? new List<Song>())
                .Select(s => s.Id)
                .ToList();

            // 2. מציאת הז'אנרים המועדפים
            var favoriteGenres = userPlaylists
                .SelectMany(p => p.Songs ?? new List<Song>())
                .Select(s => s.Genere)
                .Distinct()
                .ToList();

            // 3. שליפת כל השירים מהמאגר וסינון לפי ההעדפות
            var allSongs = await _repository.GetAll();

            var recommended = allSongs
                .Where(s => s.Status)
                .Where(s => favoriteGenres.Contains(s.Genere)) // ז'אנר דומה
                .Where(s => !userSongIds.Contains(s.Id))       // עוד לא קיים אצלו
                .OrderByDescending(s => s.CountStream)         // עדיפות לשירים פופולריים
                .Take(10)
                .ToList();

            // אם המשתמש חדש ואין לו המלצות, נחזיר פשוט את 10 השירים הכי מושמעים במערכת
            if (!recommended.Any())
            {
                recommended = allSongs
                    .Where(s => s.Status)
                    .OrderByDescending(s => s.CountStream)
                    .Take(10)
                    .ToList();
            }

            return _mapper.Map<List<Song>, List<SongDTO>>(recommended);
        }
        public async Task<List<ArtistDTO>> GetFavoriteArtists(int userId)
        {
            // 1. שליפת כל השירים מהפלייליסטים של המשתמש
            var allUserSongs = (await _playlistRepository.GetAll())
                .Where(p => p.UserId == userId && p.Status)
                .SelectMany(p => p.Songs ?? new List<Song>())
                .ToList();

            // 2. ניסיון למצוא אמנים "אהובים" (לפחות 5 שירים)
            var favoriteArtists = allUserSongs
                .GroupBy(s => s.ArtistId)
                .Where(g => g.Count() >= 5)
                .Select(g => g.First().Artist)
                .Where(a => a != null)
                .ToList();

            // 3. טיפול במשתמש חדש: אם אין מספיק אמנים אהובים (פחות מ-3)
            if (favoriteArtists.Count < 3)
            {
                // נשלוף את האמנים הכי פופולריים במערכת כולה
                var topArtists = (await _repository.GetAll()) // ניגשים לכל השירים
                    .Where(s => s.Status && s.Artist != null)
                    .GroupBy(s => s.ArtistId)
                    .OrderByDescending(g => g.Sum(s => s.CountStream)) // מיון לפי סך השמעות של האמן
                    .Select(g => g.First().Artist)
                    .Take(5) // נציע לו את ה-5 הכי חזקים
                    .ToList();

                // נאחד את הרשימות (בלי כפילויות)
                favoriteArtists = favoriteArtists.Union(topArtists).Take(5).ToList();
            }

            return _mapper.Map<List<Artist>, List<ArtistDTO>>(favoriteArtists);
        }
        public async Task<List<SongDTO>> GetByGenre(eGenere genre)
        {
            var allSongs = await _repository.GetAll();

            var filteredSongs = allSongs
                .Where(s => s.Status && s.Genere == genre)
                .OrderByDescending(s => s.CountStream) // נחזיר את הפופולריים קודם
                .ToList();

            return _mapper.Map<List<Song>, List<SongDTO>>(filteredSongs);
        }
    }

}