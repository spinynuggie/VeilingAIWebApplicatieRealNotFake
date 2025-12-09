using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class RoleUpdateDto
    {
        [Required]
        [MaxLength(50)]
        public required string Role { get; set; }
    }
}
