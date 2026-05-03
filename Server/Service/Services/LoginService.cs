using AutoMapper;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Interfaces;

namespace Service.Services
{
    public class LoginService : ILogin
    {
        private readonly IRepository<User> _repository;
        private readonly IMapper _mapper;

        public LoginService(IRepository<User> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<UserDTO> Authenticate(UserLoginDTO user)
        {
            var users = await _repository.GetAll();
            var found = users.FirstOrDefault(u =>
                u.UserEmail == user.Email && u.Password == user.Password);

            return found == null ? null : _mapper.Map<User, UserDTO>(found);
        }
    }
}