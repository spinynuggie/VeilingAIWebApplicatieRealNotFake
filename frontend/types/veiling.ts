import { Product } from './product';

export interface Veiling {
  veilingId: number;
  naam: string;
  description?: string; // Backend has 'beschrijving', and sometimes UI uses 'description'
  beschrijving: string;
  image: string;
  starttijd: string;
  eindtijd?: string;
  veilingDuurInSeconden: number;
  locatieId: number;
  veilingMeesterId: number;
  producten?: Product[];
  hasUnfinishedProducts?: boolean; // Computed by API - true if auction has products not yet auctioned
}

export interface VeilingDisplayProps {
  veilingen: Veiling[];
}
