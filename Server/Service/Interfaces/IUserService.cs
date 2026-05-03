using Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Interfaces
{
    public interface IUserService
    {
        Task<List<UserDTO>> GetAll();
        Task<UserDTO> GetById(int id);
        Task<UserDTO> AddItem(UserRegisterDTO item);
        Task UpdateItem(int id, UserUpdateDTO item);
        Task DeleteItem(int id);
    }
}
