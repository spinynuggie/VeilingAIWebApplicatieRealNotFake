using FluentValidation;
using backend.Dtos;

namespace backend.Validators
{
    public class GebruikerUpdateDtoValidator : AbstractValidator<GebruikerUpdateDto>
    {
        public GebruikerUpdateDtoValidator()
        {
            RuleFor(x => x.Emailadres)
                .NotEmpty()
                .WithMessage("E-mailadres is verplicht.")
                .EmailAddress()
                .WithMessage("Ongeldig e-mailadres formaat.")
                .MaximumLength(150)
                .WithMessage("E-mailadres mag maximaal 150 karakters bevatten.")
                .Must(BeValidEmailDomain)
                .WithMessage("E-mailadres moet een geldig domein hebben.");

            RuleFor(x => x.Naam)
                .MaximumLength(100)
                .WithMessage("Naam mag maximaal 100 karakters bevatten.")
                .When(x => !string.IsNullOrEmpty(x.Naam))
                .Matches(@"^[a-zA-ZÀ-ÿ\s'-]+$")
                .WithMessage("Naam mag alleen letters, spaties, apostrofen en koppeltekens bevatten.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Naam bevat ongeldige tekens.");

            RuleFor(x => x.Straat)
                .MaximumLength(100)
                .WithMessage("Straatnaam mag maximaal 100 karakters bevatten.")
                .When(x => !string.IsNullOrEmpty(x.Straat))
                .Matches(@"^[a-zA-ZÀ-ÿ0-9\s'-]+$")
                .WithMessage("Straatnaam mag alleen letters, cijfers, spaties, apostrofen en koppeltekens bevatten.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Straatnaam bevat ongeldige tekens.");

            RuleFor(x => x.Huisnummer)
                .MaximumLength(20)
                .WithMessage("Huisnummer mag maximaal 20 karakters bevatten.")
                .When(x => !string.IsNullOrEmpty(x.Huisnummer))
                .Matches(@"^[0-9A-Za-z\s-]+$")
                .WithMessage("Huisnummer mag alleen cijfers, letters, spaties en koppeltekens bevatten.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Huisnummer bevat ongeldige tekens.");

            RuleFor(x => x.Postcode)
                .MaximumLength(10)
                .WithMessage("Postcode mag maximaal 10 karakters bevatten.")
                .When(x => !string.IsNullOrEmpty(x.Postcode))
                .Matches(@"^[0-9A-Za-z\s-]+$")
                .WithMessage("Postcode mag alleen cijfers, letters, spaties en koppeltekens bevatten.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Postcode bevat ongeldige tekens.");

            RuleFor(x => x.Woonplaats)
                .MaximumLength(100)
                .WithMessage("Woonplaats mag maximaal 100 karakters bevatten.")
                .When(x => !string.IsNullOrEmpty(x.Woonplaats))
                .Matches(@"^[a-zA-ZÀ-ÿ\s'-]+$")
                .WithMessage("Woonplaats mag alleen letters, spaties, apostrofen en koppeltekens bevatten.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Woonplaats bevat ongeldige tekens.");
        }

        private bool BeValidEmailDomain(string email)
        {
            if (string.IsNullOrEmpty(email))
                return false;

            // SQL injection protection - block dangerous characters
            var dangerousChars = new[] { ';', '--', '/*', '*/', 'xp_', 'sp_', 'DROP', 'DELETE', 'INSERT', 'UPDATE', 'SELECT', 'UNION', 'EXEC', 'CAST', 'CONVERT' };
            var upperEmail = email.ToUpperInvariant();
            
            foreach (var dangerousChar in dangerousChars)
            {
                if (upperEmail.Contains(dangerousChar))
                    return false;
            }

            var domain = email.Split('@').LastOrDefault();
            if (string.IsNullOrEmpty(domain))
                return false;

            return domain.Contains('.') && domain.Length > 3;
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
