using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class SpecificatiesCreateDto
{
    [Required(ErrorMessage = "specificatieId is verplicht")]
    public int specificatieId { get; set; }
    [Required(ErrorMessage = "naam is verplicht")]
    public string naam { get; set; }
    [Required(ErrorMessage = "beschrijving is verplicht")]
    public string beschrijving { get; set; }
}