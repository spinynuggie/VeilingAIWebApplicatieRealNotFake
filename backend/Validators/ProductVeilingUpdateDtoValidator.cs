using FluentValidation;
using backend.Dtos;

namespace backend.Validators
{
    public class ProductVeilingUpdateDtoValidator : AbstractValidator<ProductVeilingUpdateDto>
    {
        public ProductVeilingUpdateDtoValidator()
        {
            RuleFor(x => x.ProductId)
                .GreaterThan(0)
                .WithMessage("ProductId moet een positief getal zijn.");

            RuleFor(x => x.VeilingId)
                .GreaterThan(0)
                .WithMessage("VeilingId moet een positief getal zijn.");

            RuleFor(x => x.StartPrijs)
                .GreaterThan(0)
                .WithMessage("StartPrijs moet groter dan 0 zijn.")
                .LessThanOrEqualTo(1000000)
                .WithMessage("StartPrijs mag niet meer dan €1.000.000 zijn.")
                .PrecisionScale(18, 2, false)
                .WithMessage("StartPrijs mag maximaal 2 decimalen hebben.");

            RuleFor(x => x.EindPrijs)
                .GreaterThan(0)
                .WithMessage("EindPrijs moet groter dan 0 zijn.")
                .LessThanOrEqualTo(1000000)
                .WithMessage("EindPrijs mag niet meer dan €1.000.000 zijn.")
                .PrecisionScale(18, 2, false)
                .WithMessage("EindPrijs mag maximaal 2 decimalen hebben.")
                .GreaterThanOrEqualTo(x => x.StartPrijs)
                .WithMessage("EindPrijs moet gelijk zijn aan of groter dan StartPrijs.");
        }
    }
}
