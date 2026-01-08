using FluentValidation;
using backend.Dtos;

namespace backend.Validators
{
    public class GebruikerCreateDtoValidator : AbstractValidator<GebruikerCreateDto>
    {
        public GebruikerCreateDtoValidator()
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

            RuleFor(x => x.Wachtwoord)
                .NotEmpty()
                .WithMessage("Wachtwoord is verplicht.")
                .MinimumLength(12)
                .WithMessage("Wachtwoord moet minimaal 12 tekens bevatten.")
                .MaximumLength(100)
                .WithMessage("Wachtwoord mag maximaal 100 karakters bevatten.")
                .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]")
                .WithMessage("Wachtwoord moet minimaal één kleine letter, één hoofdletter, één cijfer en één speciaal teken (@$!%*?&) bevatten.");

            RuleFor(x => x.Naam)
                .MaximumLength(100)
                .WithMessage("Naam mag maximaal 100 karakters bevatten.")
                .When(x => !string.IsNullOrEmpty(x.Naam))
                .Matches(@"^[a-zA-ZÀ-ÿ\s'-]+$")
                .WithMessage("Naam mag alleen letters, spaties, apostrofen en koppeltekens bevatten.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Naam bevat ongeldige tekens.");
        }

        private bool BeValidEmailDomain(string email)
        {
            if (string.IsNullOrEmpty(email))
                return false;

            // Simple validation - block basic SQL injection patterns
            if (email.Contains(';') || email.Contains("--") || email.Contains("/*") || 
                email.Contains("*/") || email.Contains("xp_") || email.Contains("sp_"))
                return false;

            var domain = email.Split('@').LastOrDefault();
            if (string.IsNullOrEmpty(domain))
                return false;

            // Basic domain validation - should have at least one dot and valid TLD
            return domain.Contains('.') && domain.Length > 3;
        }

        private bool BeSafeFromSqlInjection(string input)
        {
            if (string.IsNullOrEmpty(input))
                return true;

            // Simple validation - block basic SQL injection patterns
            if (input.Contains(';') || input.Contains("--") || input.Contains("/*") || 
                input.Contains("*/") || input.Contains("xp_") || input.Contains("sp_"))
                return false;

            return true;
        }
    }
}
