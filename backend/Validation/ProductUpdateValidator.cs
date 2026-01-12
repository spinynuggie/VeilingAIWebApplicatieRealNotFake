using FluentValidation;
using backend.Dtos;

namespace backend.Validation;

public class ProductUpdateValidator : AbstractValidator<ProductUpdateDto>
{
    public ProductUpdateValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("ProductId is verplicht.");

        RuleFor(x => x.ProductNaam)
            .NotEmpty().WithMessage("Productnaam mag niet leeg zijn.");

        RuleFor(x => x.Hoeveelheid)
            .GreaterThan(0).WithMessage("Hoeveelheid moet groter zijn dan 0.");

        RuleFor(x => x.StartPrijs)
            .GreaterThan(0).WithMessage("Startprijs moet groter zijn dan 0.");

        RuleFor(x => x.Eindprijs)
            .GreaterThan(0).WithMessage("Eindprijs moet groter zijn dan 0.")
            .LessThanOrEqualTo(x => x.StartPrijs)
            .WithMessage("De eindprijs mag niet hoger zijn dan de startprijs.");

        RuleFor(x => x.LocatieId)
            .NotEmpty().WithMessage("Locatie is verplicht.");
    }
}