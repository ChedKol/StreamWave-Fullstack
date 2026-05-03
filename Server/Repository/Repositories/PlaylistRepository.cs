using Microsoft.EntityFrameworkCore;
using Repository.Entities;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Repositories
{
    public class PlaylistRepository:IRepository<Playlist>
    {
        private readonly IContext _context;
        public PlaylistRepository(IContext context)
        {
            _context = context;
        }
        public async Task<Playlist> AddItem(Playlist item)
        {
            await _context.Playlists.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }
        public async Task<List<Playlist>> GetAll()
        {
            return await _context.Playlists
                .Where(p => p.Status == true)
                .Include(p => p.Songs.Where(s => s.Status == true && s.Artist.Status == true))
                    .ThenInclude(s => s.Artist)
                .Include(p => p.User) // 👈 הוסיפי את זה
                .ToListAsync();
        }
        public async Task<Playlist> GetById(int id)
        {
            return await _context.Playlists
                .Where(p => p.Id == id && p.Status == true)
                .Include(p => p.Songs.Where(s => s.Status == true && s.Artist.Status == true))
                    .ThenInclude(s => s.Artist)
                .Include(p => p.User) // 👈 הוסיפי את זה
                .FirstOrDefaultAsync();
        }
        public async Task DeleteItem(int id)
        {
            var playlist = await GetById(id);
            if (playlist != null)
            {
                playlist.Status = false;
                await _context.SaveChangesAsync();
            }
        }
        public async Task UpdateItem(int id, Playlist item)
        {
            var playlist = await GetById(id);
            if (playlist != null)
            {
                playlist.PlaylistName = item.PlaylistName;
                playlist.PlaylistCoverPath = item.PlaylistCoverPath;
                await _context.SaveChangesAsync();
            }
        }
    }
}
