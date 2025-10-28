using Microsoft.AspNetCore.Mvc;
using backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpPut]
        public IActionResult GetTest()
        {
            var test = new TestModel
            {
                Id = 1,
                TestName = "Joe"
            };
            return Ok(test);
        }
        
        // A POST endpoint to receive a message
        [HttpPost]
        public IActionResult PostTest([FromBody] TestModel model)
        {
            // Just echo the message back
            return Ok(new { received = model.TestName });
        }
    }
}
