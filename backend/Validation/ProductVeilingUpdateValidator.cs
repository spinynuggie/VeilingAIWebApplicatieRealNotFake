using FluentValidation;
using backend.Dtos;

namespace backend.Validation;

public class ProductVeilingUpdateValidator : AbstractValidator<ProductVeilingUpdateDto>
{
    public ProductVeilingUpdateValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("ProductId is verplicht.");

        RuleFor(x => x.VeilingId)
            .NotEmpty().WithMessage("VeilingId is verplicht.");

        RuleFor(x => x.StartPrijs)
            .GreaterThan(0).WithMessage("De startprijs moet groter zijn dan 0.");

        RuleFor(x => x.EindPrijs)
            .GreaterThan(0).WithMessage("De eindprijs moet groter zijn dan 0.")
            .LessThanOrEqualTo(x => x.StartPrijs)
            .WithMessage("De eindprijs mag niet hoger zijn dan de startprijs.");
    }
}