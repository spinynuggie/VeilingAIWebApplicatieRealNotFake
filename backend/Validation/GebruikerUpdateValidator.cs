using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{
    public class GebruikerUpdateValidator : AbstractValidator<GebruikerUpdateDto>
    {
        public GebruikerUpdateValidator()
        {
            RuleFor(x => x.Emailadres)
                .NotEmpty().WithMessage("E-mailadres is verplicht.")
                .EmailAddress().WithMessage("Geen geldig e-mailadres.")
                .MaximumLength(150).WithMessage("E-mailadres mag maximaal 150 tekens bevatten.");

            RuleFor(x => x.Naam)
                .MaximumLength(100).WithMessage("Naam mag maximaal 100 tekens bevatten.");

            // Optioneel: Je kunt hier ook regex toevoegen voor Postcode validatie
            RuleFor(x => x.Postcode)
                .Matches(@"^[1-9][0-9]{3}\s?[a-zA-Z]{2}$")
                .WithMessage("Geen geldige Nederlandse postcode.")
                .When(x => !string.IsNullOrEmpty(x.Postcode));
        }
    }
}