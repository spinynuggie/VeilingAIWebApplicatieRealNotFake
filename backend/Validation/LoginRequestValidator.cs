using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{
    public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
    {
        public LoginRequestValidator()
        {
            RuleFor(x => x.Emailadres)
                .NotEmpty().WithMessage("E-mailadres mag niet leeg zijn.");

            RuleFor(x => x.Wachtwoord)
                .NotEmpty().WithMessage("Wachtwoord mag niet leeg zijn.");
        }
    }
}