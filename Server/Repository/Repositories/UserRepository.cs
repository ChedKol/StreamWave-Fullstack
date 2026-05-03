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
    public class UserRepository:IRepository<User>
    {
        private readonly IContext _context;
        public UserRepository(IContext context)
        {
            _context = context;
        }
        public async Task<User> AddItem(User item)
        {
            await _context.Users.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }
        public async Task<List<User>> GetAll()
        {
            //return await _context.Users.Where(u => u.Status == true).ToListAsync();
                 return await _context.Users
            .Where(u => u.Status == true)
            .Include(u => u.Playlists.Where(p => p.Status == true))
            .ToListAsync();
        }
        public async Task<User> GetById(int id)
        {
            //return await _context.Users.FirstOrDefaultAsync(x => x.Id == id && x.Status == true);
            //תלוי אם רוצים להחזיר את הפלייליסטים של המשתמש
                 return await _context.Users
            .Include(u => u.Playlists.Where(p => p.Status == true))
            .FirstOrDefaultAsync(x => x.Id == id && x.Status == true);
        }
        public async Task DeleteItem(int id)
        {
            var user = await GetById(id);
            if (user != null)
            {
                user.Status = false;
                await _context.SaveChangesAsync();
            }
        }
        public async Task UpdateItem(int id, User item)
        {
            var user = await GetById(id);
            if (user != null)
            {
                user.UserName = item.UserName;
                user.UserEmail = item.UserEmail;
                user.ProfilePath = item.ProfilePath;
                user.Password = item.Password;
                await _context.SaveChangesAsync();
            }
        }
    }
}
