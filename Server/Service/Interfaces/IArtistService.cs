using Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IArtistService
    {
        Task<List<ArtistDTO>> GetAll();
        Task<ArtistDetailsDTO> GetById(int id);
        Task<ArtistDTO> AddItem(ArtistCreateDTO item);
        Task UpdateItem(int id, ArtistCreateDTO item);
        Task DeleteItem(int id);
    }
}
