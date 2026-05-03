using AutoMapper;
using Repository.Entities;
using Service.Dto;
using Service.Dto.Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.Services
{
    public class MyMapper : Profile
    {
        string path = Directory.GetCurrentDirectory() + "//Images//";
        string musicPath = Directory.GetCurrentDirectory() + "//Music//";

        public MyMapper()
        {
            // User -> UserDTO (GET - החזרת נתונים ללקוח)
            CreateMap<User, UserDTO>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.UserEmail))
                .ForMember(dest => dest.ArrProfile, opt => opt.MapFrom(src =>
                    File.Exists(path + src.ProfilePath)
                        ? File.ReadAllBytes(path + src.ProfilePath)
                        : null));

            // UserRegisterDTO -> User (POST - קבלת נתונים מהקליינט)
            CreateMap<UserRegisterDTO, User>()
                .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.ProfilePath, opt => opt.Ignore());


            // UserUpdateDTO -> User (PUT)
            CreateMap<UserUpdateDTO, User>()
                .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.ProfilePath, opt => opt.Ignore())
                .ForMember(dest => dest.Password, opt => opt.Ignore()); // אנחנו מטפלים בסיסמה ידנית ב-Service


            // Song -> SongDTO (GET רשימה)
            CreateMap<Song, SongDTO>()
                .ForMember(dest => dest.Genere, opt => opt.MapFrom(src => src.Genere.ToString()))
                .ForMember(dest => dest.ArtistName, opt => opt.MapFrom(src => src.Artist.ArtistName))
                .ForMember(dest => dest.ArrImage, opt => opt.MapFrom(src =>
                    File.Exists(Path.Combine(path, src.CoverSongPath ?? ""))
                        ? File.ReadAllBytes(Path.Combine(path, src.CoverSongPath))
                        : null));

            // Song -> SongDetailsDTO (GET by id - עם השיר עצמו)
            CreateMap<Song, SongDetailsDTO>()
                .ForMember(dest => dest.Genere, opt => opt.MapFrom(src => src.Genere.ToString()))
                .ForMember(dest => dest.ArtistName, opt => opt.MapFrom(src => src.Artist.ArtistName))
                .ForMember(dest => dest.ArrImage, opt => opt.MapFrom(src =>
                    File.Exists(Path.Combine(path, src.CoverSongPath ?? ""))
                        ? File.ReadAllBytes(Path.Combine(path, src.CoverSongPath))
                        : null))
                .ForMember(dest => dest.ArrSong, opt => opt.MapFrom(src =>
                    File.Exists(Path.Combine(musicPath, src.SongPath ?? ""))
                        ? File.ReadAllBytes(Path.Combine(musicPath, src.SongPath))
                        : null));

            // SongCreateDTO -> Song (POST/PUT)
            CreateMap<SongCreateDTO, Song>()
                .ForMember(dest => dest.CoverSongPath, opt => opt.Ignore())
                .ForMember(dest => dest.SongPath, opt => opt.Ignore());

            // Artist -> ArtistDTO (GET רשימה)
            CreateMap<Artist, ArtistDTO>()
                .ForMember(dest => dest.ArrImage, opt => opt.MapFrom(src =>
                    File.Exists(Path.Combine(path, src.CoverArtistPath ?? ""))
                        ? File.ReadAllBytes(Path.Combine(path, src.CoverArtistPath))
                        : null));

            // Artist -> ArtistDetailsDTO (GET by id)
            CreateMap<Artist, ArtistDetailsDTO>()
                .ForMember(dest => dest.ArrImage, opt => opt.MapFrom(src =>
                    File.Exists(Path.Combine(path, src.CoverArtistPath ?? ""))
                        ? File.ReadAllBytes(Path.Combine(path, src.CoverArtistPath))
                        : null));

            // ArtistCreateDTO -> Artist (POST/PUT)
            CreateMap<ArtistCreateDTO, Artist>()
                .ForMember(dest => dest.CoverArtistPath, opt => opt.Ignore());

            // Playlist -> PlaylistDTO
            CreateMap<Playlist, PlaylistDTO>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.SongsCount, opt => opt.MapFrom(src => src.Songs.Count))
                .ForMember(dest => dest.ArrCover, opt => opt.MapFrom(src =>
                    File.Exists(Path.Combine(path, src.PlaylistCoverPath ?? ""))
                        ? File.ReadAllBytes(Path.Combine(path, src.PlaylistCoverPath))
                        : null));

            // Playlist -> PlaylistDetailsDTO
            CreateMap<Playlist, PlaylistDetailsDTO>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.SongsCount, opt => opt.MapFrom(src => src.Songs.Count))
                .ForMember(dest => dest.ArrCover, opt => opt.MapFrom(src =>
                    File.Exists(Path.Combine(path, src.PlaylistCoverPath ?? ""))
                        ? File.ReadAllBytes(Path.Combine(path, src.PlaylistCoverPath))
                        : null));

            // PlaylistCreateDTO -> Playlist
            CreateMap<PlaylistCreateDTO, Playlist>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId)) // אכיפת מיפוי ה-ID
                .ForMember(dest => dest.PlaylistCoverPath, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => true)); // מוודא שהסטטוס תמיד נשמר כ-true
        }
    }
}
