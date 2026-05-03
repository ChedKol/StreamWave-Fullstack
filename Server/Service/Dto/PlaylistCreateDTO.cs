using Microsoft.AspNetCore.Http;

namespace Service.Dto
{
    public class PlaylistCreateDTO
    {
        public string PlaylistName { get; set; }
        public int UserId { get; set; }
        public IFormFile? FileCover { get; set; }
    }
}
