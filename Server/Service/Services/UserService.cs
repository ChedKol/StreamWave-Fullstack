using AutoMapper;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Interfaces;

namespace Service.Services
{
    public class UserService : IUserService
    {
        private readonly IRepository<User> _repository;
        private readonly IMapper _mapper;
        private readonly string _imagePath = Path.Combine(Directory.GetCurrentDirectory(), "Images");

        public UserService(IRepository<User> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<UserDTO>> GetAll() =>
            _mapper.Map<List<User>, List<UserDTO>>(await _repository.GetAll());

        public async Task<UserDTO> GetById(int id) =>
            _mapper.Map<User, UserDTO>(await _repository.GetById(id));

        public async Task<UserDTO> AddItem(UserRegisterDTO item)
        {
            //  בדיקת Email ייחודי
            var allUsers = await _repository.GetAll();
            if (allUsers.Any(u => u.UserEmail == item.Email))
                throw new InvalidOperationException("כתובת האימייל כבר רשומה במערכת");
            string fileName = null;

            if (item.FileProfile != null)
            {
                fileName = Guid.NewGuid() + Path.GetExtension(item.FileProfile.FileName);
                string fullPath = Path.Combine(_imagePath, fileName);
                using (var stream = File.Create(fullPath))
                {
                    await item.FileProfile.CopyToAsync(stream);
                }
            }

            var user = _mapper.Map<UserRegisterDTO, User>(item);
            user.ProfilePath = fileName;
            user.Status = true;

            return _mapper.Map<User, UserDTO>(await _repository.AddItem(user));
        }

        public async Task UpdateItem(int id, UserUpdateDTO item)
        {
            var existing = await _repository.GetById(id);
            if (existing == null) return;

            // אם הועלתה תמונה חדשה
            if (item.FileProfile != null)
            {
                // מחיקת ישנה רק אם קיימת
                if (!string.IsNullOrEmpty(existing.ProfilePath))
                {
                    string oldPath = Path.Combine(_imagePath, existing.ProfilePath);
                    if (File.Exists(oldPath)) File.Delete(oldPath);
                }

                // שמירת החדשה
                string fileName = Guid.NewGuid() + Path.GetExtension(item.FileProfile.FileName);
                string fullPath = Path.Combine(_imagePath, fileName);
                using (var stream = File.Create(fullPath))
                {
                    await item.FileProfile.CopyToAsync(stream);
                }
                existing.ProfilePath = fileName;
            }

            // 2. עדכון שדות טקסט - שימי לב לבדיקת null/ריק
            if (!string.IsNullOrEmpty(item.UserName)) existing.UserName = item.UserName;
            if (!string.IsNullOrEmpty(item.Email)) existing.UserEmail = item.Email;
            if (!string.IsNullOrEmpty(item.Password))
            {
                existing.Password = item.Password;
            }

            await _repository.UpdateItem(id, existing);
        }

        public async Task DeleteItem(int id) =>
            await _repository.DeleteItem(id);
    }
}