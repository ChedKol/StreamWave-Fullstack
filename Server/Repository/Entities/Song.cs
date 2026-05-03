using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Entities
{
    public enum eGenere { POP, ROCK, FOLK, COUNTRY, JEWISH }
    public class Song
    {
        public int Id { get; set; }
        public string SongName { get; set; }
        [ForeignKey("Artist")]
        public int ArtistId { get; set; }
        public int CountStream { get; set; }
        public eGenere Genere { get; set; }
        public string? CoverSongPath { get; set; }
        public string? SongPath { get; set; }
        public bool Status { get; set; }
        public virtual Artist? Artist { get; set; }//כדי שיכיר את האומן
    }
}
