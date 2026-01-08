using FluentValidation;
using backend.Dtos;

namespace backend.Validators
{
    public class AankoopCreateDtoValidator : AbstractValidator<AankoopCreateDto>
    {
        public AankoopCreateDtoValidator()
        {
            RuleFor(x => x.ProductId)
                .GreaterThan(0)
                .WithMessage("ProductId moet een positief getal zijn.");

            RuleFor(x => x.Prijs)
                .GreaterThan(0)
                .WithMessage("Prijs moet groter dan 0 zijn.")
                .LessThanOrEqualTo(1000000)
                .WithMessage("Prijs mag niet meer dan €1.000.000 zijn.")
                .PrecisionScale(18, 2, false)
                .WithMessage("Prijs mag maximaal 2 decimalen hebben.");

            RuleFor(x => x.AanKoopHoeveelheid)
                .GreaterThan(0)
                .WithMessage("AankoopHoeveelheid moet groter dan 0 zijn.")
                .LessThanOrEqualTo(10000)
                .WithMessage("AankoopHoeveelheid mag niet meer dan 10.000 zijn.");
        }
    }
}
