using FluentValidation;
using backend.Dtos;

namespace backend.Validators
{
    public class ProductGegevensCreateUpdateDtoValidator : AbstractValidator<ProductGegevensCreateUpdateDto>
    {
        public ProductGegevensCreateUpdateDtoValidator()
        {
            RuleFor(x => x.Fotos)
                .NotEmpty()
                .WithMessage("Fotos is verplicht.")
                .Must(BeValidImageUrls)
                .WithMessage("Fotos moet een lijst van geldige image URLs zijn, gescheiden door komma's.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("Fotos bevat ongeldige tekens.");

            RuleFor(x => x.ProductNaam)
                .NotEmpty()
                .WithMessage("ProductNaam is verplicht.")
                .MaximumLength(200)
                .WithMessage("ProductNaam mag maximaal 200 karakters bevatten.")
                .Matches(@"^[a-zA-ZÀ-ÿ0-9\s\-.,!?()]+$")
                .WithMessage("ProductNaam bevat ongeldige karakters.")
                .Must(BeSafeFromSqlInjection)
                .WithMessage("ProductNaam bevat ongeldige tekens.");

            RuleFor(x => x.ProductBeschrijving)
                .MaximumLength(2000)
                .WithMessage("ProductBeschrijving mag maximaal 2000 karakters bevatten.")
                .When(x => !string.IsNullOrEmpty(x.ProductBeschrijving))
                .Must(BeSafeFromSqlInjection)
                .WithMessage("ProductBeschrijving bevat ongeldige tekens.");

            RuleFor(x => x.Hoeveelheid)
                .GreaterThan(0)
                .WithMessage("Hoeveelheid moet groter dan 0 zijn.")
                .LessThanOrEqualTo(10000)
                .WithMessage("Hoeveelheid mag niet meer dan 10.000 zijn.");

            RuleFor(x => x.StartPrijs)
                .GreaterThanOrEqualTo(0)
                .WithMessage("StartPrijs mag niet negatief zijn.")
                .GreaterThanOrEqualTo(x => x.Eindprijs)
                .WithMessage("StartPrijs moet hoger of gelijk zijn aan Eindprijs.");

            RuleFor(x => x.Eindprijs)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Eindprijs mag niet negatief zijn.")
                .LessThanOrEqualTo(x => x.StartPrijs)
                .WithMessage("Eindprijs mag niet hoger zijn dan StartPrijs.")
                .LessThanOrEqualTo(1000000)
                .WithMessage("Eindprijs mag niet meer dan €1.000.000 zijn.")
                .PrecisionScale(18, 2, false)
                .WithMessage("Eindprijs mag maximaal 2 decimalen hebben.");

            RuleFor(x => x.SpecificatieIds)
                .Must(ids => ids == null || ids.All(id => id > 0))
                .WithMessage("Alle specificatieIds moeten positieve getallen zijn.")
                .When(x => x.SpecificatieIds != null && x.SpecificatieIds.Any());

            RuleFor(x => x.VerkoperId)
                .GreaterThan(0)
                .WithMessage("VerkoperId moet een positief getal zijn.");

            RuleFor(x => x.LocatieId)
                .GreaterThan(0)
                .WithMessage("LocatieId moet een positief getal zijn.");
        }

        private bool BeValidImageUrls(string fotos)
        {
            if (string.IsNullOrEmpty(fotos))
                return false;

            // SQL injection protection first
            if (!BeSafeFromSqlInjection(fotos))
                return false;

            var urls = fotos.Split(',', StringSplitOptions.RemoveEmptyEntries);
            foreach (var url in urls)
            {
                var trimmedUrl = url.Trim();
                if (!Uri.TryCreate(trimmedUrl, UriKind.Absolute, out var uri))
                    return false;

                if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
                    return false;
            }

            return urls.Length <= 10; // Max 10 images
        }

        private bool BeSafeFromSqlInjection(string input)
        {
            if (string.IsNullOrEmpty(input))
                return true;

            // SQL injection protection - block dangerous patterns
            var dangerousPatterns = new[] 
            { 
                ';', '--', '/*', '*/', 'xp_', 'sp_', 'DROP', 'DELETE', 'INSERT', 
                'UPDATE', 'SELECT', 'UNION', 'EXEC', 'CAST', 'CONVERT', 'ALTER', 
                'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE', 'SHUTDOWN', '<script', 
                '</script>', 'javascript:', 'vbscript:', 'onload=', 'onerror=' 
            };
            
            var upperInput = input.ToUpperInvariant();
            
            foreach (var pattern in dangerousPatterns)
            {
                if (upperInput.Contains(pattern))
                    return false;
            }

            return true;
        }
    }
}
