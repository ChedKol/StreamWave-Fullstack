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
    public class ArtistRepository : IRepository<Artist>
    {
        private readonly IContext _context;
        public ArtistRepository(IContext context)
        {
            _context = context;
        }
        public async Task<Artist> AddItem(Artist item)
        {
            await _context.Artists.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }
        public async Task<List<Artist>> GetAll()
        {
            //return await _context.Artists.Where(a => a.Status == true).ToListAsync();
            return await _context.Artists
                .Where(a => a.Status == true)
                .Include(a => a.Songs.Where(s => s.Status == true))
                .ToListAsync();
        }
        public async Task<Artist> GetById(int id)
        {
            return await _context.Artists
                .Include(a => a.Songs.Where(s => s.Status == true))
                .FirstOrDefaultAsync(x => x.Id == id && x.Status == true);
        }
        public async Task DeleteItem(int id)
        {
            // ה-Include דואג שהדלי (Songs) יתמלא בשירים מה-DB
            var artist = await _context.Artists
                .Include(a => a.Songs)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (artist != null)
            {
                artist.Status = false; // מכבה את האמן

                // עכשיו עוברים על ה"דלי" שהתמלא ומכבים את כל השירים שבו
                foreach (var song in artist.Songs)
                {
                    song.Status = false;
                }
                await _context.SaveChangesAsync();
            }
        }
        public async Task UpdateItem(int id, Artist item)
        {
            var artist = await GetById(id);
            if (artist != null)
            {
                artist.ArtistName = item.ArtistName;
                artist.CoverArtistPath = item.CoverArtistPath;
                artist.About = item.About;
                await _context.SaveChangesAsync();
            }
        }
    }
}
