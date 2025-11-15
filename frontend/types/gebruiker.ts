export interface Gebruiker {
  gebruikerId: number;
  naam: string;
  emailadres: string;
  straat: string;
  huisnummer: string;
  postcode: string;
  woonplaats: string;
}

export interface GebruikerDisplayProps {
  gebruikers: Gebruiker[];
}
