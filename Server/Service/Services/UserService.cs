using AutoMapper;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Interfaces;
using System.Net;
using System.Net.Mail;

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
            var allUsers = await _repository.GetAll();
            if (allUsers.Any(u => u.UserEmail == item.Email))
                throw new InvalidOperationException("The email address is already registered in the system");
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
            user.IsVerified = false;

            user.VerificationCode = new Random().Next(100000, 999999).ToString();
            var savedUser = await _repository.AddItem(user);
            try
            {
                await SendEmailAsync(savedUser.UserEmail, savedUser.VerificationCode);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email sending failed: {ex.Message}");
            }
            return _mapper.Map<User, UserDTO>(savedUser);
        }

        public async Task<bool> Verify(string email, string code)
        {
            var allUsers = await _repository.GetAll();
            var user = allUsers.FirstOrDefault(u => u.UserEmail == email && u.VerificationCode == code);

            if (user == null) return false;

            user.IsVerified = true;
            user.VerificationCode = null;

            await _repository.UpdateItem(user.Id, user);
            return true;
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
        private async Task SendEmailAsync(string email, string code)
        {
            // הגדרות השרת של גוגל
            var smtpClient = new System.Net.Mail.SmtpClient("smtp.gmail.com")
            {
                Port = 587, // פורמט סטנדרטי לשליחה מאובטחת
                            // כאן את שמה את המייל שלך ואת ה-App Password שהוצאת מגוגל
                Credentials = new System.Net.NetworkCredential("chedvakolitz1@gmail.com", "njgc xegd onok adru"),
                EnableSsl = true, // חובה להפעיל אבטחה
            };

            // בניית תוכן המייל
            var mailMessage = new System.Net.Mail.MailMessage
            {
                From = new System.Net.Mail.MailAddress("chedvakolitz1@gmail.com", "StreamWave"),
                Subject = "Verification Code for Your Account",
                // בנינו תוכן HTML פשוט כדי שזה ייראה מקצועי
                Body = $@"
            <div style='font-family: Arial, sans-serif; direction: rtl; text-align: center;'>
                <h2>ברוך הבא לאפליקציית המוזיקה שלנו!</h2>
                <p>כדי להשלים את ההרשמה, אנא הזן את קוד האימות הבא:</p>
                <h1 style='color: #1DB954; letter-spacing: 5px;'>{code}</h1>
                <p>הקוד תקף ל-10 דקות הקרובות.</p>
            </div>",
                IsBodyHtml = true,
            };

            mailMessage.To.Add(email);

            // השליחה בפועל
            await smtpClient.SendMailAsync(mailMessage);
        }

    }

}