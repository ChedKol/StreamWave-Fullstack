using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    public class UserUpdateDTO
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string? Password { get; set; }
        //test connection
        public IFormFile? FileProfile { get; set; }
    }
}
