using AutoMapper;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Dto.Service.Dto;
using Service.Interfaces;

namespace Service.Services
{
    public class SearchService : ISearchService
    {
        private readonly IRepository<Song> _songRepo;
        private readonly IRepository<Artist> _artistRepo;
        private readonly IRepository<Playlist> _playlistRepo;
        private readonly IMapper _mapper;

        public SearchService(
            IRepository<Song> songRepo,
            IRepository<Artist> artistRepo,
            IRepository<Playlist> playlistRepo,
            IMapper mapper)
        {
            _songRepo = songRepo;
            _artistRepo = artistRepo;
            _playlistRepo = playlistRepo;
            _mapper = mapper;
        }

        public async Task<SearchResultsDTO> SearchAll(string query)
        {
            var q = query.ToLower();
            var results = new SearchResultsDTO();
            //חיפוש שירים- מעודכן (כולל חיפוש לפי שם אמן)
            var allSongs = await _songRepo.GetAll();
            var filteredSongs = allSongs.Where(s =>
                s.Status &&
                (s.SongName.ToLower().Contains(q) || (s.Artist != null && s.Artist.ArtistName.ToLower().Contains(q))) // מעודכן: חיפוש גם בשם האמן
            ).ToList();
            results.Songs = _mapper.Map<List<Song>, List<SongDTO>>(filteredSongs);

            // חיפוש אמנים
            var allArtists = await _artistRepo.GetAll();
            var filteredArtists = allArtists.Where(a => a.Status && a.ArtistName.ToLower().Contains(q)).ToList();
            results.Artists = _mapper.Map<List<Artist>, List<ArtistDTO>>(filteredArtists);

            // חיפוש פלייליסטים (כולם ציבוריים לפי הגדרתך)
            var allPlaylists = await _playlistRepo.GetAll();
            var filteredPlaylists = allPlaylists.Where(p => p.Status && p.PlaylistName.ToLower().Contains(q)).ToList();
            results.Playlists = _mapper.Map<List<Playlist>, List<PlaylistDTO>>(filteredPlaylists);

            return results;
        }
    }
}