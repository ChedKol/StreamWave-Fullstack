using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Service.Dto;
using Service.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace OurWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly ILogin loginService;
        private readonly IConfiguration config;
        public LoginController(ILogin loginService, IConfiguration config)
        {
            this.loginService = loginService;
            this.config = config;
        }



        // POST api/<LoginController>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] UserLoginDTO user) // 1. הוספנו async ו-Task
        {
            // 2. הוספנו await כאן
            var validatedUser = await loginService.Authenticate(user);

            if (validatedUser != null)
            {
                string token = GenerateToken(validatedUser);
                return Ok(token);
            }

            return Unauthorized("שם משתמש או סיסמה שגויים");
        }

        private string GenerateToken(UserDTO user)
        {
            // יצירת מפתח הצפנה מהמחרוזת ששמנו ב-appsettings
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // הגדרת הנתונים שיוצמדו לטוקן (Claims)
            var claims = new[] {
                new Claim("userName", user.UserName),
                new Claim("email", user.Email),
                new Claim("role", user.IsAdmin ? "Admin" : "User"),
                new Claim("userId", user.Id.ToString())
            };

            // יצירת ה-Token עצמו
            var token = new JwtSecurityToken(
                issuer: config["Jwt:Issuer"],
                audience: config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(15), // תוקף ל-15 דקות
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
