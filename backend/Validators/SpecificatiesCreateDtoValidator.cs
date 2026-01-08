using FluentValidation;
using backend.Dtos;

namespace backend.Validators
{
    public class SpecificatiesCreateDtoValidator : AbstractValidator<SpecificatiesCreateDto>
    {
        public SpecificatiesCreateDtoValidator()
        {
            RuleFor(x => x.specificatieId)
                .GreaterThan(0)
                .WithMessage("specificatieId moet een positief getal zijn.");

            RuleFor(x => x.naam)
                .NotEmpty()
                .WithMessage("naam is verplicht.")
                .MaximumLength(100)
                .WithMessage("naam mag maximaal 100 karakters bevatten.")
                .Matches(@"^[a-zA-ZÀ-ÿ0-9\s\-.,!?()]+$")
                .WithMessage("naam bevat ongeldige karakters.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("naam bevat ongeldige tekens.");

            RuleFor(x => x.beschrijving)
                .NotEmpty()
                .WithMessage("beschrijving is verplicht.")
                .MaximumLength(500)
                .WithMessage("beschrijving mag maximaal 500 karakters bevatten.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("beschrijving bevat ongeldige tekens.");
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
