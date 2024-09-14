using Centrifugo.AspNetCore.Abstractions;

using Ergec.CentrifugoChat.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace Ergec.CentrifugoChat.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CentrifugoController : Controller
    {
        private readonly ILogger<CentrifugoController> _logger;
        private readonly IConfiguration _configuration;
        private readonly ICentrifugoClient _centrifugoClient;

        public CentrifugoController(ILogger<CentrifugoController> logger, IConfiguration configuration, ICentrifugoClient centrifugoClient)
        {
            _logger = logger;
            _configuration = configuration;
            _centrifugoClient = centrifugoClient;
        }

        [HttpPost("GenerateToken")]
        public IActionResult GenerateToken([FromBody] GenerateToken param)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Centrifugo:Secret"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            List<Claim> claims = new List<Claim>
                {
                    new Claim("name", param.Name),
                    new Claim(JwtRegisteredClaimNames.Sub, param.Guid),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

            if (!string.IsNullOrEmpty(param.ChannelName))
            {
                claims.Add(new Claim("channel", param.ChannelName));
            }

            var token = new JwtSecurityToken(claims: claims, expires: DateTime.Now.AddMinutes(30), signingCredentials: creds);

            var generatedToken = new JwtSecurityTokenHandler().WriteToken(token);
            var model = new GenerateTokenResponse() { Token = generatedToken };

            return Ok(model);
        }

        [HttpPost("SendMessagePublicChannel")]
        public async Task<IActionResult> SendMessagePublicChannel([FromBody] SendMessage param)
        {
            param.Date = DateTime.Now;

            // Send Receiver
            await _centrifugoClient.Publish(
             new Centrifugo.AspNetCore.Models.Request.PublishParams()
             {
                 Channel = "chat",
                 Data = new { value = JsonSerializer.Serialize(param) }
             });

            return Ok();
        }

        [HttpPost("SendMessagePrivate")]
        public async Task<IActionResult> SendMessageAsync([FromBody] SendMessage param)
        {
            param.Date = DateTime.Now;

            // Send Receiver
            await _centrifugoClient.Publish(
             new Centrifugo.AspNetCore.Models.Request.PublishParams()
             {
                 Channel = "$" + param.Receiver,
                 Data = new { value = JsonSerializer.Serialize(param) }
             });

            // Send Sender
            await _centrifugoClient.Publish(
             new Centrifugo.AspNetCore.Models.Request.PublishParams()
             {
                 Channel = "$" + param.Sender,
                 Data = new { value = JsonSerializer.Serialize(param) }
             });

            return Ok();
        }
    }
}
