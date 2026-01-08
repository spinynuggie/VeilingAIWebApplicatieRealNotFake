namespace backend.Dtos
{
    /// <summary>
    /// Data Transfer Object voor het aanmaken of bijwerken van VeilingMeester gegevens.
    /// Sluit de automatisch gegenereerde MeesterId uit.
    /// </summary>
    public class VeilingMeesterDto
    {
        public int GebruikerId { get; set; }
    }
}