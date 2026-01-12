using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{
    public class VeilingValidator : AbstractValidator<VeilingDto>
    {
        public VeilingValidator()
        {
            RuleFor(x => x.Naam)
                .NotEmpty().WithMessage("Naam is verplicht.")
                .MaximumLength(100).WithMessage("Naam mag maximaal 100 karakters bevatten.");
            RuleFor(x => x.Beschrijving)
                .NotEmpty().WithMessage("Beschrijving is verplicht.")
                .MaximumLength(150).WithMessage("Beschrijving mag niet langer zijn dan 150 karakters.");

            RuleFor(x => x.LocatieId)
                .NotEmpty().WithMessage("LocatieId is verplicht.");

            RuleFor(x => x.VeilingMeesterId)
                .NotEmpty().WithMessage("VeilingMeesterId is verplicht.");

            RuleFor(x => x.Starttijd)
                .NotEmpty().WithMessage("Starttijd is verplicht.")
                .Must(start => start >= DateTimeOffset.UtcNow)
                .WithMessage("De starttijd mag niet in het verleden liggen.");

            RuleFor(x => x.Eindtijd)
                .NotEmpty().WithMessage("Eindtijd is verplicht.")
                .GreaterThan(x => x.Starttijd)
                .WithMessage("De eindtijd moet na de starttijd liggen.");
                
            RuleFor(x => x.Image)
                .Must(uri => string.IsNullOrEmpty(uri) || Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("De afbeelding moet een geldige URL zijn.");
        }
    }
}