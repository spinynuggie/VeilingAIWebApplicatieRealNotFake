using FluentValidation;
using backend.Dtos;

namespace backend.Validation;

public class SpecificatiesCreateValidator : AbstractValidator<SpecificatiesCreateDto>
{
    public SpecificatiesCreateValidator()
    {
        RuleFor(x => x.specificatieId)
            .NotEmpty().WithMessage("specificatieId is verplicht.");

        RuleFor(x => x.naam)
            .NotEmpty().WithMessage("naam is verplicht.")
            .MaximumLength(100).WithMessage("naam mag maximaal 100 tekens bevatten.");

        RuleFor(x => x.beschrijving)
            .NotEmpty().WithMessage("beschrijving is verplicht.")
            .MaximumLength(500).WithMessage("beschrijving mag maximaal 500 tekens bevatten.");
    }
}