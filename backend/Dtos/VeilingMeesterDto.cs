using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    /// <summary>
    /// Gebruikt om een bestaande gebruiker te promoveren tot of te registreren als veilingmeester.
    /// </summary>
    public class VeilingMeesterDto
    {
        /// <summary>De identifier van de gebruiker die de veilingmeester-permissies krijgt.</summary>
        public int GebruikerId { get; set; }
    }
}