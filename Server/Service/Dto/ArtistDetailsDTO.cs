using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    namespace Service.Dto
    {
        public class ArtistDetailsDTO : ArtistDTO
        {
            public string About { get; set; }
            public ICollection<SongDTO>? Songs { get; set; }
        }
    }
}
