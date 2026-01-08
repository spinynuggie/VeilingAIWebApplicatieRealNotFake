using FluentValidation;
using backend.Dtos;

namespace backend.Validators
{
    public class VeilingDtoValidator : AbstractValidator<VeilingDto>
    {
        public VeilingDtoValidator()
        {
            RuleFor(x => x.Naam)
                .NotEmpty()
                .WithMessage("Naam is verplicht.")
                .MaximumLength(100)
                .WithMessage("Naam mag maximaal 100 karakters bevatten.")
                .Matches(@"^[a-zA-ZÀ-ÿ0-9\s\-.,!?()]+$")
                .WithMessage("Naam bevat ongeldige karakters.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Naam bevat ongeldige tekens.");

            RuleFor(x => x.Beschrijving)
                .MaximumLength(2000)
                .WithMessage("Beschrijving mag maximaal 2000 karakters bevatten.")
                .When(x => !string.IsNullOrEmpty(x.Beschrijving))
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Beschrijving bevat ongeldige tekens.");

            RuleFor(x => x.Image)
                .MaximumLength(500)
                .WithMessage("Image URL mag maximaal 500 karakters bevatten.")
                .When(x => !string.IsNullOrEmpty(x.Image))
                .Must(BeValidImageUrl)
                .WithMessage("Image moet een geldige URL zijn.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Image URL bevat ongeldige tekens.");

            RuleFor(x => x.LocatieId)
                .GreaterThan(0)
                .WithMessage("LocatieId moet een positief getal zijn.");

            RuleFor(x => x.Starttijd)
                .NotEmpty()
                .WithMessage("Starttijd is verplicht.")
                .GreaterThan(DateTimeOffset.Now.AddMinutes(-5))
                .WithMessage("Starttijd mag niet in het verleden liggen.")
                .LessThan(x => x.Eindtijd)
                .WithMessage("Starttijd moet voor eindtijd liggen.");

            RuleFor(x => x.Eindtijd)
                .NotEmpty()
                .WithMessage("Eindtijd is verplicht.")
                .GreaterThan(DateTimeOffset.Now.AddHours(1))
                .WithMessage("Eindtijd moet minimaal 1 uur in de toekomst liggen.")
                .GreaterThan(x => x.Starttijd)
                .WithMessage("Eindtijd moet na starttijd liggen.")
                .LessThan(DateTimeOffset.Now.AddMonths(6))
                .WithMessage("Eindtijd mag niet meer dan 6 maanden in de toekomst liggen.");

            RuleFor(x => x.VeilingMeesterId)
                .GreaterThan(0)
                .WithMessage("VeilingMeesterId moet een positief getal zijn.");
        }

        private bool BeValidImageUrl(string url)
        {
            if (string.IsNullOrEmpty(url))
                return true; // Optional field

            // SQL injection protection first
            if (!BeSafeFromSqlInjection(url))
                return false;

            return Uri.TryCreate(url, UriKind.Absolute, out var uri) && 
                   (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
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
