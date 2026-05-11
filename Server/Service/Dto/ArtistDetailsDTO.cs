using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Service.Dto
{
    public class ArtistDetailsDTO : ArtistDTO
    {
        public ICollection<SongDTO>? Songs { get; set; }
    }
}

