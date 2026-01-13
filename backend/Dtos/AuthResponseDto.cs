namespace backend.Dtos;

/// <summary>
/// Response die wordt teruggestuurd na een succesvolle authenticatie-actie (login/register/refresh).
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// Een statusbericht over de uitgevoerde actie (bijv. "Login geslaagd!").
    /// </summary>
    public string Message { get; set; }

    /// <summary>
    /// De publieke profielgegevens van de geautoriseerde gebruiker.
    /// </summary>
    public GebruikerResponseDto Gebruiker { get; set; }
}