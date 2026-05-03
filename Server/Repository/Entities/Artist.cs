using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Entities
{
    public class Artist
    {
        public int Id { get; set; }
        public string ArtistName { get; set; }
        public virtual ICollection<Song>? Songs { get; set; }
        public string? CoverArtistPath { get; set; }
        public string? About {  get; set; }
        public bool Status { get; set; }
    }
}
