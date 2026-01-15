import { Product } from './product';

export interface Veiling {
  veilingId: number;
  naam: string;
  description?: string; // Backend has 'beschrijving', and sometimes UI uses 'description'
  beschrijving: string;
  image: string;
  starttijd: string;
  eindtijd: string;
  locatieId: number;
  veilingMeesterId: number;
  producten?: Product[];
}

export interface VeilingDisplayProps {
  veilingen: Veiling[];
}
