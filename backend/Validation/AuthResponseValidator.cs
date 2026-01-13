using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{
    public class AuthResponseValidator : AbstractValidator<AuthResponseDto>
    {
        public AuthResponseValidator()
        {
            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Response bericht mag niet leeg zijn.");

            RuleFor(x => x.Gebruiker)
                .NotNull().WithMessage("Gebruikergegevens mogen niet ontbreken in de response.");
        }
    }
}