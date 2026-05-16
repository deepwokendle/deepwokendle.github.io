using DeepwokendleApi.DTOS;
using DeepwokendleApi.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ITokenService _tokenService;

    public AuthController(IUserService userService, ITokenService tokenService)
    {
        _userService = userService;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _userService.UserExists(dto.Username))
            return BadRequest("User already exists.");
        if (string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
            return BadRequest("Fill all the required fields.");
        var result = await _userService.CreateUser(dto.Username, dto.Password);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(RegisterDto dto)
    {
        var user = await _userService.GetByUsername(dto.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Invalid Credentials.");
        user.PasswordHash = null;
        var token = _tokenService.GenerateToken(user);
        return Ok(new { token, user });
    }

    [HttpPost("refresh")]
    [Authorize]
    public async Task<IActionResult> Refresh()
    {
        var username = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username)) return Unauthorized();
        var user = await _userService.GetByUsername(username);
        if (user == null) return Unauthorized();
        user.PasswordHash = null;
        var token = _tokenService.GenerateToken(user);
        return Ok(new { token });
    }
}
