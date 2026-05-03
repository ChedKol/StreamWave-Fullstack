using Microsoft.AspNetCore.Http;

namespace Service.Dto
{
    public class ArtistCreateDTO
    {
        public string ArtistName { get; set; }
        public string About { get; set; }
        public IFormFile? FileImage { get; set; }
    }
}