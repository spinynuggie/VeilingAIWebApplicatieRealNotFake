using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{

    public class AankoopCreateValidator : AbstractValidator<AankoopCreateDto>
    {
        public AankoopCreateValidator()
        {
            RuleFor(x => x.ProductId)
                .NotEmpty().WithMessage("ProductId is verplicht.");

            RuleFor(x => x.Prijs)
                .GreaterThan(0).WithMessage("Prijs moet groter zijn dan 0.");

            RuleFor(x => x.AanKoopHoeveelheid)
                .GreaterThan(0).WithMessage("Hoeveelheid moet minstens 1 zijn.");
        }
    }
}