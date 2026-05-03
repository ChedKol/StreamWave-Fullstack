using AutoMapper;
using Repository.Entities;
using Repository.Interfaces;
using Service.Dto;
using Service.Dto.Service.Dto;
using Service.Interfaces;

namespace Service.Services
{
    public class ArtistService : IArtistService
    {
        private readonly IRepository<Artist> _repository;
        private readonly IMapper _mapper;
        private readonly string _imagePath = Path.Combine(Directory.GetCurrentDirectory(), "Images");

        public ArtistService(IRepository<Artist> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<ArtistDTO>> GetAll() =>
            _mapper.Map<List<Artist>, List<ArtistDTO>>(await _repository.GetAll());

        public async Task<ArtistDetailsDTO> GetById(int id) =>
            _mapper.Map<Artist, ArtistDetailsDTO>(await _repository.GetById(id));

        public async Task<ArtistDTO> AddItem(ArtistCreateDTO item)
        {
            // בדיקת שם כפול
            var allArtists = await _repository.GetAll();
            if (allArtists.Any(a => a.ArtistName.ToLower() == item.ArtistName.ToLower()))
                throw new InvalidOperationException("אמן עם שם זה כבר קיים במערכת");
            string imageName = null;

            if (item.FileImage != null)
            {
                imageName = Guid.NewGuid() + Path.GetExtension(item.FileImage.FileName);
                using (var stream = File.Create(Path.Combine(_imagePath, imageName)))
                {
                    await item.FileImage.CopyToAsync(stream);
                }
            }

            var artist = _mapper.Map<ArtistCreateDTO, Artist>(item);
            artist.CoverArtistPath = imageName;
            artist.Status = true;

            return _mapper.Map<Artist, ArtistDTO>(await _repository.AddItem(artist));
        }

        public async Task UpdateItem(int id, ArtistCreateDTO item)
        {
            var existing = await _repository.GetById(id);
            if (existing == null) return;

            if (item.FileImage != null)
            {
                string oldImage = Path.Combine(_imagePath, existing.CoverArtistPath ?? "");
                if (File.Exists(oldImage)) File.Delete(oldImage);

                string imageName = Guid.NewGuid() + Path.GetExtension(item.FileImage.FileName);
                using (var stream = File.Create(Path.Combine(_imagePath, imageName)))
                {
                    await item.FileImage.CopyToAsync(stream);
                }
                existing.CoverArtistPath = imageName;
            }

            existing.ArtistName = item.ArtistName;
            existing.About = item.About;

            await _repository.UpdateItem(id, existing);
        }

        public async Task DeleteItem(int id) =>
            await _repository.DeleteItem(id);
    }
}