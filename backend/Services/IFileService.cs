using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace backend.Services
{
    public interface IFileService
    {
        /// <summary>
        /// Saves a file to the configured storage and returns the full publicly accessible URL.
        /// </summary>
        /// <param name="file">The file to save.</param>
        /// <param name="folder">A subfolder name (e.g. "products").</param>
        /// <returns>The absolute URL to the file.</returns>
        Task<string> SaveFileAsync(IFormFile file, string folder);
    }
}
