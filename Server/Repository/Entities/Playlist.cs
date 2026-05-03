using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Entities
{
    public class Playlist
    {
        public int Id { get; set; }
        public string PlaylistName { get; set; }
        [ForeignKey("User")]
        public int UserId { get; set; }
        public string? PlaylistCoverPath { get; set; }
        public virtual ICollection<Song>? Songs { get; set; }
        public bool Status { get; set; }
        public virtual User? User { get; set; }//כדי שיכיר אחר כך 
    }
}
