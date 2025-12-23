export interface Veiling {
  veilingId: number;
  naam: string;
  beschrijving: string;
  image: string;
  starttijd?: string;
  eindtijd?: string;
  actiefProductId?: number | null;
}

export interface VeilingDisplayProps {
  veilingen: Veiling[];
}
