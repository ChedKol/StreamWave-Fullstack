using Microsoft.AspNetCore.Mvc;
using Service.Dto;
using Service.Interfaces;

namespace OurWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtistController : ControllerBase
    {
        private readonly IArtistService _service;

        public ArtistController(IArtistService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<ArtistDTO>>> Get()
        {
            var artists = await _service.GetAll();
            return Ok(artists);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ArtistDetailsDTO>> Get(int id)
        {
            var artist = await _service.GetById(id);
            if (artist == null) return NotFound();
            return Ok(artist);
        }

        [HttpPost]
        public async Task<ActionResult<ArtistDTO>> Post([FromForm] ArtistCreateDTO value)
        {
            if (value == null) return BadRequest();
            var newArtist = await _service.AddItem(value);
            return Ok(newArtist);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromForm] ArtistCreateDTO value)
        {
            if (value == null) return BadRequest();
            await _service.UpdateItem(id, value);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _service.DeleteItem(id);
            return Ok();
        }
    }
}