using Ergec.CentrifugoChat.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Ergec.CentrifugoChat.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CentrifugoController : Controller
    {
        private readonly ILogger<CentrifugoController> _logger;
        private readonly IConfiguration _configuration;

        public CentrifugoController(ILogger<CentrifugoController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        [HttpPost("GenerateToken")]
        public IActionResult GenerateToken([FromBody] GenerateToken param)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Centrifugo:Secret"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            Claim[] claims = new[]
                {
                    new Claim("UserId", param.Guid.ToString()),
                    new Claim("UserName", param.Name),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

            var token = new JwtSecurityToken(claims: claims, expires: DateTime.Now.AddMinutes(30), signingCredentials: creds);

            var generatedToken = new JwtSecurityTokenHandler().WriteToken(token);
            var model = new GenerateTokenResponse() { Token = generatedToken };

            return Ok(model);
        }
    }
}
