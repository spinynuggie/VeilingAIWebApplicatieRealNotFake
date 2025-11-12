export interface Veiling {
  veilingId: number;
  naam: string;
  beschrijving: string;
  image: string;
}

export interface VeilingDisplayProps {
  veilingen: Veiling[];
}
