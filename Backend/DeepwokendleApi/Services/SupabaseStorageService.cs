using DeepwokendleApi.Interfaces;
using System.Net.Http.Headers;

public class SupabaseStorageService : ISupabaseStorageService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public SupabaseStorageService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> UploadImageAsync(IFormFile file, string fileName)
    {
        var supabaseUrl = _configuration["Supabase:Url"];
        var supabaseKey = _configuration["Supabase:Key"];

        using var stream = file.OpenReadStream();
        var content = new StreamContent(stream);
        content.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);

        var request = new HttpRequestMessage(HttpMethod.Put, $"{supabaseUrl}/storage/v1/object/deepwokendle/{fileName}")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", supabaseKey);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        return $"{supabaseUrl}/storage/v1/object/public/deepwokendle/{fileName}";
    }
}
