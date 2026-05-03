using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    public class PlaylistDTO
    {
        public int Id { get; set; }
        public string PlaylistName { get; set; }
        public string? PlaylistCoverPath { get; set; } // שם הקובץ מה-DB
        public string UserName { get; set; }
        public int UserId { get; set; }
        public int SongsCount { get; set; }
        public byte[] ArrCover { get; set; } // תוספת: להצגת תמונת הפלייליסט
    }
}
