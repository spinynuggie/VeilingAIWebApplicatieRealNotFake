using FluentValidation;
using backend.Dtos;

namespace backend.Validators
{
    public class RoleUpdateDtoValidator : AbstractValidator<RoleUpdateDto>
    {
        private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase)
        {
            "KOPER",
            "VERKOPER", 
            "VEILINGMEESTER",
            "ADMIN"
        };

        public RoleUpdateDtoValidator()
        {
            RuleFor(x => x.Role)
                .NotEmpty()
                .WithMessage("Role is verplicht.")
                .MaximumLength(50)
                .WithMessage("Role mag maximaal 50 karakters bevatten.")
                .Must(BeValidRole)
                .WithMessage("Role moet een van de volgende waarden zijn: KOPER, VERKOPER, VEILINGMEESTER, ADMIN.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Role bevat ongeldige tekens.");
        }

        private bool BeValidRole(string role)
        {
            return !string.IsNullOrEmpty(role) && AllowedRoles.Contains(role.ToUpperInvariant());
        }

        private bool BeSafeFromSqlInjection(string input)
        {
            if (string.IsNullOrEmpty(input))
                return true;

            // SQL injection protection - block dangerous patterns
            var dangerousPatterns = new[] 
            { 
                ';', '--', '/*', '*/', 'xp_', 'sp_', 'DROP', 'DELETE', 'INSERT', 
                'UPDATE', 'SELECT', 'UNION', 'EXEC', 'CAST', 'CONVERT', 'ALTER', 
                'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE', 'SHUTDOWN', '<script', 
                '</script>', 'javascript:', 'vbscript:', 'onload=', 'onerror=' 
            };
            
            var upperInput = input.ToUpperInvariant();
            
            foreach (var pattern in dangerousPatterns)
            {
                if (upperInput.Contains(pattern))
                    return false;
            }

            return true;
        }
    }
}
