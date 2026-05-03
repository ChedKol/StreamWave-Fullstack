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
    public class SongRepository: IRepository<Song>
    {
        private readonly IContext _context;
        public SongRepository(IContext context)
        {
            _context = context;
        }
        public async Task<Song> AddItem(Song item)
        {
            await _context.Songs.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }
        public async Task<List<Song>> GetAll()
        {
            return await _context.Songs
                // 1. טעינת נתוני האמן כדי שנוכל לבדוק את הסטטוס שלו
                .Include(s => s.Artist)

                // 2. הסינון הכפול: גם השיר פעיל וגם האמן שלו פעיל
                .Where(s => s.Status == true && s.Artist.Status == true)

                .ToListAsync();
        }
        public async Task<Song> GetById(int id)
        {
            return await _context.Songs
                .Include(s => s.Artist)
                .FirstOrDefaultAsync(s => s.Id == id && s.Status == true && s.Artist.Status == true);
        }
        public async Task DeleteItem(int id)
        {
            var song = await GetById(id);
            if (song != null)
            {
                song.Status = false;
                await _context.SaveChangesAsync();
            }
        }
        public async Task UpdateItem(int id, Song item)
        {
            var song = await GetById(id);
            if (song != null)
            {
                song.SongName = item.SongName;
                song.CoverSongPath = item.CoverSongPath;
                song.Genere = item.Genere;
                song.CountStream = item.CountStream;
                await _context.SaveChangesAsync();
            }
        }
    }
}
