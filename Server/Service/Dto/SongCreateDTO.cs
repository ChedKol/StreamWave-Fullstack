using Microsoft.AspNetCore.Http;
using Repository.Entities;

namespace Service.Dto
{
    public class SongCreateDTO
    {
        public string SongName { get; set; }
        public int ArtistId { get; set; }
        public eGenere Genere { get; set; }
        public IFormFile? FileSong { get; set; }
        public IFormFile? FileImage { get; set; }
    }
}
