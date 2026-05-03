using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using Service.Dto;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace OurWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;
        public SearchController(ISearchService searchService)
        {
            _searchService = searchService;
        }

        //[HttpGet("{query}")]
        [HttpGet]
        public async Task<ActionResult<SearchResultsDTO>> Get(string query)
        {
            if (string.IsNullOrWhiteSpace(query)) return BadRequest();

            var results = await _searchService.SearchAll(query);
            return Ok(results);
        }
    }
}
