using Service.Dto;

namespace Service.Interfaces
{
    public interface ISearchService
    {
        Task<SearchResultsDTO> SearchAll(string query);
    }
}