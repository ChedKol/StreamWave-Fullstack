using Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    public class SearchResultsDTO
    {
        public List<SongDTO> Songs { get; set; } = new();
        public List<ArtistDTO> Artists { get; set; } = new();
        public List<PlaylistDTO> Playlists { get; set; } = new();
    }
}
