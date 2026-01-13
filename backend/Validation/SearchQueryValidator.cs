using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{
    /// <summary>
    /// Validatieregels voor zoekopdrachten op het platform.
    /// </summary>
    public class SearchQueryDtoValidator : AbstractValidator<SearchQueryDto>
    {
        public SearchQueryDtoValidator()
        {
            RuleFor(x => x.Query)
                .NotEmpty().WithMessage("De zoekterm mag niet leeg zijn.")
                .MinimumLength(2).WithMessage("De zoekterm moet minimaal 2 tekens bevatten.")
                .MaximumLength(100).WithMessage("De zoekterm mag niet langer zijn dan 100 tekens.")
                // Optioneel: Voorkom speciale karakters die SQL-injectie achtige patronen nabootsen
                .Matches(@"^[a-zA-Z0-9\s]*$").WithMessage("De zoekterm mag geen speciale tekens bevatten.");
        }
    }
}