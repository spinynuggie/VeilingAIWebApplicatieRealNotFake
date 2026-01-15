using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{
    public class VerkoperValidator : AbstractValidator<VerkoperDto>
    {
        public VerkoperValidator()
        {
            RuleFor(x => x.KvkNummer)
                .NotEmpty().WithMessage("KvkNummer is verplicht.")
                .Length(8).WithMessage("Een Nederlands KvK-nummer moet exact 8 cijfers bevatten.")
                .Matches(@"^[0-9]+$").WithMessage("KvK-nummer mag alleen cijfers bevatten.");

            RuleFor(x => x.Bedrijfsnaam)
                .NotEmpty().WithMessage("Bedrijfsnaam is verplicht.")
                .MaximumLength(100).WithMessage("Bedrijfsnaam mag maximaal 100 tekens bevatten.");

            RuleFor(x => x.Straat)
                .NotEmpty().WithMessage("Straat is verplicht.")
                .MaximumLength(100).WithMessage("Straat mag maximaal 100 tekens bevatten.");

            RuleFor(x => x.Huisnummer)
                .NotEmpty().WithMessage("Huisnummer is verplicht.")
                .MaximumLength(10).WithMessage("Huisnummer mag maximaal 10 tekens bevatten.");

            RuleFor(x => x.Postcode)
                .NotEmpty().WithMessage("Postcode is verplicht.")
                .Matches(@"^[1-9][0-9]{3}\s?[a-zA-Z]{2}$").WithMessage("Geen geldige Nederlandse postcode.")
                .MaximumLength(10).WithMessage("Postcode mag maximaal 10 tekens bevatten.");

            RuleFor(x => x.Woonplaats)
                .NotEmpty().WithMessage("Woonplaats is verplicht.")
                .MaximumLength(100).WithMessage("Woonplaats mag maximaal 100 tekens bevatten.");

            RuleFor(x => x.FinancieleGegevens)
                .MaximumLength(250).WithMessage("Financiële gegevens mogen maximaal 250 tekens bevatten.");
        }
    }
}