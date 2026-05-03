using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    public class PlaylistDetailsDTO : PlaylistDTO
    {
        // Id, PlaylistName, PlaylistCoverPath, UserName עוברים בירושה
        public virtual ICollection<SongDTO> Songs { get; set; }
    }
}
