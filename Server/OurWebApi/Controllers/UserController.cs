using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Dto;
using Service.Interfaces;

using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Service.Services;
namespace OurWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;

        public UserController(IUserService service)
        {
            _service = service;
        }

        // GET api/User
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<UserDTO>>> Get()
        {
            var result = await _service.GetAll();
            return Ok(result);
        }

        // GET api/User/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> Get(int id)
        {
            var result = await _service.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // POST api/User
        [HttpPost]
        public async Task<ActionResult<UserDTO>> Post([FromForm] UserRegisterDTO value)
        {
            if (value == null) return BadRequest();
            var newUser = await _service.AddItem(value);
            return Ok(newUser);
        }

        // PUT api/User/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromForm] UserUpdateDTO value)
        {
            if (value == null) return BadRequest();

            await _service.UpdateItem(id, value);

            // מחזירים רק תשובת "הצלחתי", בלי טוקן
            return Ok(new { message = "Profile updated successfully" });
        }

      

        // DELETE api/User/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _service.DeleteItem(id);
            return Ok();
        }

        [HttpPost("verify")]
        public async Task<IActionResult> Verify([FromBody] VerifyDto verifyDto)
        {
            // קריאה ל-Service שבודק מול ה-DB ומעדכן את IsVerified ל-true
            var isSuccess = await _service.Verify(verifyDto.Email, verifyDto.Code);

            if (isSuccess)
            {
                return Ok(new { message = "החשבון אומת בהצלחה!" });
            }

            return BadRequest("קוד אימות שגוי או פג תוקף");
        }
    }
}