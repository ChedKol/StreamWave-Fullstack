using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Dto
{
    public class UserRegisterDTO 
    {
        public string UserName { get; set; }
        [Required(ErrorMessage = "Email is a required field")]
        [EmailAddress(ErrorMessage = "The email address is invalid")]
        public string Email { get; set; }
        [Required(ErrorMessage = "Password is a required field")]
        [MinLength(8, ErrorMessage = "The password must contain at least 8 characters")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "The password must include an uppercase letter, a lowercase letter, a number, and a special character")]
        public string Password { get; set; }
        public IFormFile? FileProfile { get; set; } // תוספת להעלאת תמונה
    }
}
