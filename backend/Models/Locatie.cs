using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("locatie")]
public class Locatie
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LocatieId { get; set; }
    
    public string LocatieNaam { get; set; }
    
    public string Foto { get; set; }
    
}