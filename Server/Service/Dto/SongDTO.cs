using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    public class SongDTO
    {
        public int Id { get; set; }
        public string SongName { get; set; }
        public string Genere { get; set; }
        public string ArtistName { get; set; }
        public int ArtistId { get; set; }
        public string CoverSongPath { get; set; }
        public byte[] ArrImage { get; set; }
    }
}
