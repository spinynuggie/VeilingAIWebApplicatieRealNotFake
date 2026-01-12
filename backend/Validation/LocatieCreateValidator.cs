using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{
    public class LocatieCreateValidator : AbstractValidator<LocatieCreateDto>
    {
        public LocatieCreateValidator()
        {
            RuleFor(x => x.LocatieNaam)
                .NotEmpty().WithMessage("Locatienaam is verplicht.")
                .MinimumLength(3).WithMessage("Locatienaam moet minimaal 3 tekens bevatten.")
                .MaximumLength(100).WithMessage("Locatienaam mag maximaal 100 tekens bevatten.");

            RuleFor(x => x.Foto)
                .NotEmpty().WithMessage("Foto URL is verplicht.")
                .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Foto moet een geldige URL zijn (bijv. https://...)");
        }
    }
}