using FluentValidation;
using backend.Dtos;

namespace backend.Validation
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.Emailadres)
                .NotEmpty().WithMessage("E-mailadres is verplicht.")
                .EmailAddress().WithMessage("Geen geldig e-mailformaat.");

            RuleFor(x => x.Wachtwoord)
                .NotEmpty().WithMessage("Wachtwoord is verplicht.")
                .MinimumLength(12).WithMessage("Wachtwoord moet minimaal 12 tekens lang zijn.");
        }
    }
}