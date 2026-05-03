using Repository.Entities;
using Service.Dto;
using Service.Dto.Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface ISongService
    {
        Task<List<SongDTO>> GetAll();
        Task<SongDetailsDTO> GetById(int id);
        Task<SongDTO> AddItem(SongCreateDTO item);
        Task UpdateItem(int id, SongCreateDTO item);
        Task DeleteItem(int id);
        Task<List<SongDTO>> GetRecommendedSongs(int userId);//שירים מומלצים
                                                          
        Task<List<ArtistDTO>> GetFavoriteArtists(int userId);//אמנים אהובים

        Task<List<SongDTO>> GetByGenre(eGenere genre);
    }
}
