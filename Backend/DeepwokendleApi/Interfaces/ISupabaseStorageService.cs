namespace DeepwokendleApi.Interfaces
{
    public interface ISupabaseStorageService
    {
        Task<string> UploadImageAsync(IFormFile file, string fileName);
    }
}
