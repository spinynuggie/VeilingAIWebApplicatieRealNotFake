using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{
    public class ProductGegevensValidator : AbstractValidator<ProductCreateDto>
    {
        public ProductGegevensValidator()
        {
            RuleFor(x => x.ProductNaam).NotEmpty().MaximumLength(200);
            RuleFor(x => x.Fotos).NotEmpty();
            RuleFor(x => x.Hoeveelheid).GreaterThan(0);
            RuleFor(x => x.Eindprijs).GreaterThan(0);
        }
    }
}