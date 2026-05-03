using Microsoft.AspNetCore.Mvc;
using Service.Dto;
using Service.Interfaces;

namespace OurWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlaylistController : ControllerBase
    {
        private readonly IPlaylistService _service;

        public PlaylistController(IPlaylistService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<PlaylistDTO>>> Get()
        {
            var playlists = await _service.GetAll();
            return Ok(playlists);
        }

        // פונקציה חדשה - מחזירה פלייליסטים רק של משתמש ספציפי
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<PlaylistDTO>>> GetPlaylistsByUserId(int userId)
        {
            var playlists = await _service.GetPlaylistsByUserId(userId);
            return Ok(playlists);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PlaylistDetailsDTO>> Get(int id)
        {
            var playlist = await _service.GetById(id);
            if (playlist == null) return NotFound();
            return Ok(playlist);
        }

        [HttpPost]
        public async Task<ActionResult<PlaylistDTO>> Post([FromForm] PlaylistCreateDTO value)
        {
            if (value == null) return BadRequest();
            var newPlaylist = await _service.AddItem(value);
            return Ok(newPlaylist);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromForm] PlaylistCreateDTO value)
        {
            if (value == null) return BadRequest();
            await _service.UpdateItem(id, value);
            return NoContent();
        }
        //  POST api/Playlist/5/songs/3
        [HttpPost("{playlistId}/songs/{songId}")]
        public async Task<ActionResult> AddSong(int playlistId, int songId)
        {
            await _service.AddSongToPlaylist(playlistId, songId);
            return Ok();
        }
        //  DELETE api/Playlist/5/songs/3
        [HttpDelete("{playlistId}/songs/{songId}")]
        public async Task<ActionResult> RemoveSong(int playlistId, int songId)
        {
            await _service.RemoveSongFromPlaylist(playlistId, songId);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _service.DeleteItem(id);
            return Ok();
        }

    }
}