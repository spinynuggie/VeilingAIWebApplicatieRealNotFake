using FluentValidation;
using backend.Dtos;

namespace backend.Validators
{
    public class VerkoperDtoValidator : AbstractValidator<VerkoperDto>
    {
        public VerkoperDtoValidator()
        {
            RuleFor(x => x.KvkNummer)
                .NotEmpty()
                .WithMessage("KvkNummer is verplicht.")
                .MaximumLength(50)
                .WithMessage("KvkNummer mag maximaal 50 karakters bevatten.")
                .Matches(@"^[0-9A-Za-z\s\-\.]+$")
                .WithMessage("KvkNummer mag alleen cijfers, letters, spaties, punten en koppeltekens bevatten.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("KvkNummer bevat ongeldige tekens.");

            RuleFor(x => x.Bedrijfsgegevens)
                .MaximumLength(1000)
                .WithMessage("Bedrijfsgegevens mag maximaal 1000 karakters bevatten.")
                .When(x => !string.IsNullOrEmpty(x.Bedrijfsgegevens))
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Bedrijfsgegevens bevat ongeldige tekens.");

            RuleFor(x => x.Adresgegevens)
                .MaximumLength(500)
                .WithMessage("Adresgegevens mag maximaal 500 karakters bevatten.")
                .When(x => !string.IsNullOrEmpty(x.Adresgegevens))
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Adresgegevens bevat ongeldige tekens.");

            RuleFor(x => x.FinancieleGegevens)
                .MaximumLength(500)
                .WithMessage("FinancieleGegevens mag maximaal 500 karakters bevatten.")
                .When(x => !string.IsNullOrEmpty(x.FinancieleGegevens))
                .Must(BeSafeFromSqlInjection)
                .WithMessage("FinancieleGegevens bevat ongeldige tekens.");
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
