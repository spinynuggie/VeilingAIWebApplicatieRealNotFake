namespace backend.Dtos;

/// <summary>
/// Wordt gebruikt door de veilingmeester om een product aan een veiling te koppelen en prijsmarges in te stellen.
/// </summary>
public class ProductVeilingUpdateDto
{
    /// <summary>ID van het te koppelen product.</summary>
    public int ProductId { get; set; }

    /// <summary>ID van de veiling waarin dit product getoond moet worden.</summary>
    public int VeilingId { get; set; }

    /// <summary>De ingestelde startprijs voor de veiling.</summary>
    public decimal StartPrijs { get; set; }

    /// <summary>De ingestelde eindprijs (bodemprijs) voor de veiling.</summary>
    public decimal EindPrijs { get; set; }
}