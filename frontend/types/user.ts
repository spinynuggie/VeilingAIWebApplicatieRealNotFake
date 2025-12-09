export type Role = "KOPER" | "VERKOPER" | "VEILINGMEESTER" | "ADMIN";

export interface User {
  gebruikerId: number;
  emailadres: string;
  naam?: string | null;
  role: Role;
  straat?: string | null;
  huisnummer?: string | null;
  postcode?: string | null;
  woonplaats?: string | null;
}
