using FluentValidation;
using backend.Dtos;

namespace backend.Validators
{
    public class VeilingMeesterDtoValidator : AbstractValidator<VeilingMeesterDto>
    {
        public VeilingMeesterDtoValidator()
        {
            RuleFor(x => x.GebruikerId)
                .GreaterThan(0)
                .WithMessage("GebruikerId moet een positief getal zijn.");
        }
    }
}
