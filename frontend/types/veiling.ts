export interface Veiling {
  veilingId: number;
  naam: string;
  beschrijving: string;
  image: string;
  starttijd: string;
  eindtijd: string;
  locatieId: number;
}

export interface VeilingDisplayProps {
  veilingen: Veiling[];
}
