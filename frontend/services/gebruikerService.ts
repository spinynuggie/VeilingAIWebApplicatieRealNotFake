import type { User } from "@/types/user";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;


export async function getGebruiker() {
  const res = await fetch(`${apiBase}/api/Gebruiker`, { credentials: "include" });
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json() as Promise<User[]>;
}

export async function getCurrentGebruiker(): Promise<User> {
  // Probeer /me (require auth). Fallback naar eerste gebruiker uit lijst.
  const meRes = await fetch(`${apiBase}/api/Gebruiker/me`, { credentials: "include" });
  if (meRes.ok) return meRes.json() as Promise<User>;

  const gebruikers = await getGebruiker();
  if (!gebruikers || gebruikers.length === 0) throw new Error("Geen gebruiker gevonden");
  return gebruikers[0];
}

export async function updateGebruiker(field: string, value: string): Promise<void> {
  // Haal de huidige gebruiker (via /me of fallback)
  const gebruiker = await getCurrentGebruiker();
  console.log("Huidige gebruiker voor update:", gebruiker);
  // Pas alleen het gevraagde veld aan
  if (field === "naam") gebruiker.naam = value;
  else if (field === "emailadres") gebruiker.emailadres = value;
  else if (field === "straat") gebruiker.straat = value;
  else if (field === "huisnummer") gebruiker.huisnummer = value;
  else if (field === "postcode") gebruiker.postcode = value;
  else if (field === "woonplaats") gebruiker.woonplaats = value;
  else throw new Error("Ongeldig veld");

  // Bouw DTO met de velden die backend verwacht
  const dto = {
    naam: gebruiker.naam ?? null,
    emailadres: gebruiker.emailadres ?? null,
    straat: gebruiker.straat ?? null,
    huisnummer: gebruiker.huisnummer ?? null,
    postcode: gebruiker.postcode ?? null,
    woonplaats: gebruiker.woonplaats ?? null,
  };

  // Sommige backend versies verwachten (of kunnen accepteren) een volledig Gebruiker-object.
  // Bouw een compleet object zoals jouw voorbeeld (we vullen wachtwoord leeg en role uit cookie indien aanwezig).
  

  // Stuur het volledige object naar de backend. De controller zal alleen de verwachte velden mappen,
  // maar als jouw backend echt een volledig object verlangt, wordt dit hier meegegeven.
  const res = await fetch(`${apiBase}/api/Gebruiker/${gebruiker.gebruikerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Bijwerken mislukt.");
  }
}
