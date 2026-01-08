namespace backend.Dtos;

public class SpecificatiesCreateDto
{
    public int specificatieId { get; set; }
    public string naam { get; set; } = string.Empty;
    public string beschrijving { get; set; } = string.Empty;
}