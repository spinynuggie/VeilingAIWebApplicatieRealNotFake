using FluentValidation;
using backend.Dtos;

namespace backend.Validators
{
    public class AankoopUpdateDtoValidator : AbstractValidator<AankoopUpdateDto>
    {
        public AankoopUpdateDtoValidator()
        {
            RuleFor(x => x.AanKoopHoeveelheid)
                .NotEmpty()
                .WithMessage("De aankoophoeveelheid is verplicht.")
                .GreaterThan(0)
                .WithMessage("De aankoophoeveelheid moet minimaal 1 zijn.");
        }
    }
}