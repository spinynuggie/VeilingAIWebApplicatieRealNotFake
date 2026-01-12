using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{
    public class ProductCreateValidator : AbstractValidator<ProductCreateDto>
    {
        public ProductCreateValidator()
        {
            RuleFor(x => x.ProductNaam)
                .NotEmpty().WithMessage("Productnaam is verplicht.")
                .MaximumLength(200).WithMessage("Productnaam mag maximaal 200 tekens bevatten.");

            RuleFor(x => x.Fotos)
                .NotEmpty().WithMessage("Voeg minimaal één foto toe.");

            RuleFor(x => x.Hoeveelheid)
                .GreaterThan(0).WithMessage("Hoeveelheid moet minimaal 1 zijn.");

            RuleFor(x => x.Eindprijs)
                .GreaterThan(0).WithMessage("De prijs moet groter zijn dan 0.");

            RuleFor(x => x.VerkoperId)
                .NotEmpty().WithMessage("VerkoperId is verplicht.");

            RuleFor(x => x.LocatieId)
                .NotEmpty().WithMessage("LocatieId is verplicht.");
        }
    }
}