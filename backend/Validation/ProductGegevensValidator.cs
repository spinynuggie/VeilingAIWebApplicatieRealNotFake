using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{
    public class ProductGegevensValidator : AbstractValidator<ProductGegevensCreateUpdateDto>
    {
        public ProductGegevensValidator()
        {
            RuleFor(x => x.ProductNaam)
                .NotEmpty().WithMessage("Productnaam is verplicht.")
                .MaximumLength(100).WithMessage("Productnaam mag maximaal 100 tekens bevatten.")
                .Must(NoXss).WithMessage("Productnaam bevat ongeldige tekens (XSS detected).");

            RuleFor(x => x.ProductBeschrijving)
                .NotEmpty().WithMessage("Productbeschrijving is verplicht.")
                .MaximumLength(500).WithMessage("Productbeschrijving mag maximaal 500 tekens bevatten.")
                .Must(NoXss).WithMessage("Productbeschrijving bevat ongeldige tekens (XSS detected).");

            RuleFor(x => x.StartPrijs)
                .GreaterThan(0).WithMessage("Startprijs moet groter zijn dan 0.");

            RuleFor(x => x.Eindprijs)
                .GreaterThan(0).WithMessage("Eindprijs moet groter zijn dan 0.")
                .LessThanOrEqualTo(x => x.StartPrijs).WithMessage("Eindprijs moet lager of gelijk zijn aan de startprijs.");

            RuleFor(x => x.Hoeveelheid)
                .GreaterThan(0).WithMessage("Hoeveelheid moet groter zijn dan 0.");
        }

        // Simple check to prevent basic script injection
        private bool NoXss(string? input)
        {
            if (string.IsNullOrEmpty(input)) return true;
            return !input.Contains("<script") && !input.Contains("javascript:") && !input.Contains("onload=");
        }
    }
}
