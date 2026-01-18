import type { User } from "@/types/user";
import { authFetch } from "./authService";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export async function getGebruiker() {
  const res = await authFetch(`${apiBase}/api/Gebruiker`);
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json() as Promise<User[]>;
}

export async function getCurrentGebruiker(): Promise<User | null> {
  const res = await authFetch(`${apiBase}/api/Gebruiker/me`);
  if (res.status === 401) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Kon huidige gebruiker niet ophalen");
  }
  return res.json() as Promise<User>;
}

/**
 * Eén enkele payload om gewijzigde velden te updaten.
 * Houdt DB-load laag door het slechts eenmaal te sturen en niets te doen als er geen verschil is.
 */
export async function updateGebruikerFields(
  partial: Partial<Pick<User, "naam" | "emailadres" | "straat" | "huisnummer" | "postcode" | "woonplaats">>,
  currentUser?: User | null
): Promise<User> {
  const gebruiker = currentUser ?? (await getCurrentGebruiker());
  if (!gebruiker) throw new Error("Niet ingelogd");

  const hasChanges = Object.entries(partial).some(
    ([key, value]) => (gebruiker as any)?.[key] ?? "" !== value
  );
  if (!hasChanges) return gebruiker;

  const dto = {
    naam: partial.naam ?? gebruiker.naam ?? null,
    emailadres: partial.emailadres ?? gebruiker.emailadres ?? "",
    straat: partial.straat ?? gebruiker.straat ?? null,
    huisnummer: partial.huisnummer ?? gebruiker.huisnummer ?? null,
    postcode: partial.postcode ?? gebruiker.postcode ?? null,
    woonplaats: partial.woonplaats ?? gebruiker.woonplaats ?? null,
  };

  const res = await authFetch(`${apiBase}/api/Gebruiker/${gebruiker.gebruikerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Bijwerken mislukt.");
  }

  return { ...gebruiker, ...partial };
}

// Backwards compatibility helper for legacy callers
export async function updateGebruiker(field: string, value: string): Promise<User> {
  return updateGebruikerFields({ [field]: value } as any);
}

export async function updateRole(role: User["role"], currentUser?: User | null): Promise<User> {
  const gebruiker = currentUser ?? (await getCurrentGebruiker());
  if (!gebruiker) throw new Error("Niet ingelogd");

  const res = await authFetch(`${apiBase}/api/Gebruiker/${gebruiker.gebruikerId}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Rol wijzigen mislukt.");
  }

  return (await res.json()) as User;
}
export async function deleteCurrentAccount(id: number): Promise<void> {
  const res = await authFetch(`${apiBase}/api/Gebruiker/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Verwijderen van account mislukt.");
  }
}