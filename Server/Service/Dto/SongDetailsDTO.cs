using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    public class SongDetailsDTO : SongDTO
    {
        public byte[] ArrSong { get; set; }
        public int CountStream { get; set; }
    }
}
