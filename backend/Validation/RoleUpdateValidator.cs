using FluentValidation;
using backend.Dtos;

namespace backend.Validation;

public class RoleUpdateValidator : AbstractValidator<RoleUpdateDto>
{
    public RoleUpdateValidator()
    {
        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Rol is verplicht.")
            .MaximumLength(50).WithMessage("Rol mag maximaal 50 tekens bevatten.")
            .Must(BeAValidRole).WithMessage("Ongeldige rol opgegeven. Kies uit: KOPER, VERKOPER of VEILINGMEESTER.");
    }

    private bool BeAValidRole(string role)
    {
        var validRoles = new List<string> { "KOPER", "VERKOPER", "VEILINGMEESTER" };
        return validRoles.Contains(role.ToUpper());
    }
}