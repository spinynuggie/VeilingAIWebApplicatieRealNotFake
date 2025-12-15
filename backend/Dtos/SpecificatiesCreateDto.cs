namespace backend.Dtos;

public class SpecificatiesCreateDto
{
    [Required]
    [Required(ErrorMessage = "specificatieId is verplicht")]
    public int specificatieId { get; set; }
    [Required]
    [Required(ErrorMessage = "naam is verplicht")]
    public string naam { get; set; }
    [Required]
    [Required(ErrorMessage = "beschrijving is verplicht")]
    public string beschrijving { get; set; }
}