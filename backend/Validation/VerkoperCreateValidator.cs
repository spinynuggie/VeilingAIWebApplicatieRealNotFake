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

            RuleFor(x => x.Bedrijfsgegevens)
                .MaximumLength(500).WithMessage("Bedrijfsgegevens mogen maximaal 500 tekens bevatten.");

            RuleFor(x => x.Adresgegevens)
                .MaximumLength(250).WithMessage("Adresgegevens mogen maximaal 250 tekens bevatten.");

            RuleFor(x => x.FinancieleGegevens)
                .MaximumLength(250).WithMessage("Financiële gegevens mogen maximaal 250 tekens bevatten.");
        }
    }
}