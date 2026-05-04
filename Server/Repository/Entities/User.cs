using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public virtual ICollection<Playlist> Playlists { get; set; }
        public string? ProfilePath { get; set; }
        public string UserEmail { get; set; }
        public string Password { get; set; }
        public bool IsAdmin { get; set; }
        public bool Status { get; set; }
        public bool IsVerified { get; set; } 
        public string? VerificationCode { get; set; }
    }
}
