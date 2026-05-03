using Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IPlaylistService
    {
        Task<List<PlaylistDTO>> GetAll();
        Task<List<PlaylistDTO>> GetPlaylistsByUserId(int userId);
        Task<PlaylistDetailsDTO> GetById(int id);
        Task<PlaylistDTO> AddItem(PlaylistCreateDTO item);
        Task UpdateItem(int id, PlaylistCreateDTO item);
        Task DeleteItem(int id);
        Task AddSongToPlaylist(int playlistId, int songId);    //חדש
        Task RemoveSongFromPlaylist(int playlistId, int songId); //חדש
    }
}
