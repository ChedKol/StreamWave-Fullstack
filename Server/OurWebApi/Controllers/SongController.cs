using Microsoft.AspNetCore.Mvc;
using Repository.Entities;
using Service.Dto;
using Service.Dto.Service.Dto;
using Service.Interfaces;

namespace OurWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SongController : ControllerBase
    {
        private readonly ISongService _service;

        public SongController(ISongService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<SongDTO>>> Get()
        {
            var songs = await _service.GetAll();
            return Ok(songs);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SongDetailsDTO>> Get(int id)
        {
            var song = await _service.GetById(id);
            if (song == null) return NotFound();
            return Ok(song);
        }

        [HttpPost]
        public async Task<ActionResult<SongDTO>> Post([FromForm] SongCreateDTO value)
        {
            if (value == null) return BadRequest();
            var newSong = await _service.AddItem(value);
            return Ok(newSong);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromForm] SongCreateDTO value)
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

        // --- פעולות חדשות לדף הבית (User Context) ---

        [HttpGet("recommended/{userId}")]
        public async Task<ActionResult<List<SongDTO>>> GetRecommended(int userId)
        {
            // מחזיר שירים מומלצים או להיטים אם המשתמש חדש
            var recommended = await _service.GetRecommendedSongs(userId);
            return Ok(recommended);
        }

        [HttpGet("favorite-artists/{userId}")]
        public async Task<ActionResult<List<ArtistDTO>>> GetFavoriteArtists(int userId)
        {
            // מחזיר אמנים אהובים (מעל 5 שירים) או אמנים מובילים במערכת
            var artists = await _service.GetFavoriteArtists(userId);
            return Ok(artists);
        }

        [HttpGet("genre/{genre}")]
        public async Task<ActionResult<List<SongDTO>>> GetByGenre(eGenere genre)
        {
            var songs = await _service.GetByGenre(genre);
            if (songs == null || !songs.Any())
            {
                return Ok(new List<SongDTO>()); // עדיף להחזיר רשימה ריקה מאשר 404 אם פשוט אין שירים בז'אנר
            }
            return Ok(songs);
        }
    }
}