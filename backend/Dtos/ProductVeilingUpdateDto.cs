namespace backend.Dtos;

public class ProductVeilingUpdateDto
{
    public int ProductId { get; set; }
    public int VeilingId { get; set; }
    public decimal StartPrijs { get; set; }
    public decimal EindPrijs { get; set; }
}