using System.ComponentModel.DataAnnotations;

namespace backend.Dtos;

public class SpecificatiesCreateDto
{
    public int specificatieId { get; set; }
    public string naam { get; set; }
    public string beschrijving { get; set; }
}