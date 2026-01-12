using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{
    public class GebruikerCreateValidator : AbstractValidator<GebruikerCreateDto>
    {
        public GebruikerCreateValidator()
        {
            RuleFor(x => x.Emailadres)
                .NotEmpty().WithMessage("E-mailadres is verplicht.")
                .EmailAddress().WithMessage("Geen geldig e-mailadres.")
                .MaximumLength(150).WithMessage("E-mailadres mag maximaal 150 tekens bevatten.");

            RuleFor(x => x.Wachtwoord)
                .NotEmpty().WithMessage("Wachtwoord is verplicht.")
                .MinimumLength(12).WithMessage("Wachtwoord moet minimaal 12 tekens bevatten.")
                .MaximumLength(100).WithMessage("Wachtwoord mag maximaal 100 tekens bevatten.");

            RuleFor(x => x.Naam)
                .MaximumLength(100).WithMessage("Naam mag maximaal 100 tekens bevatten.");
        }
    }
}