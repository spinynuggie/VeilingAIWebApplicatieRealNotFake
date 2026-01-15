import { authFetch } from "./authService";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export type VerkoperPayload = {
  kvkNummer: string;
  bedrijfsnaam: string;
  straat: string;
  huisnummer: string;
  postcode: string;
  woonplaats: string;
  financieleGegevens?: string;
};

export type VerkoperResponse = {
  verkoperId: number;
  kvkNummer: string;
  bedrijfsnaam: string;
  straat: string;
  huisnummer: string;
  postcode: string;
  woonplaats: string;
  financieleGegevens: string;
  gebruikerId?: number;
};

const toDto = (payload: VerkoperPayload) => ({
  kvkNummer: payload.kvkNummer,
  bedrijfsnaam: payload.bedrijfsnaam,
  straat: payload.straat,
  huisnummer: payload.huisnummer,
  postcode: payload.postcode,
  woonplaats: payload.woonplaats,
  financieleGegevens: payload.financieleGegevens ?? "",
});

export async function createVerkoper(payload: VerkoperPayload): Promise<VerkoperResponse> {
  const res = await authFetch(`${apiBase}/api/Verkoper`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toDto(payload)),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Aanmaken verkoper mislukt.");
  }
  return res.json() as Promise<VerkoperResponse>;
}

export async function updateVerkoper(id: number, payload: VerkoperPayload): Promise<void> {
  const res = await authFetch(`${apiBase}/api/Verkoper/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toDto(payload)),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Bijwerken verkoper mislukt.");
  }
}

export async function getMyVerkoper(): Promise<VerkoperResponse | null> {
  const res = await authFetch(`${apiBase}/api/Verkoper/me`);
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Ophalen verkoper mislukt.");
  }
  return res.json() as Promise<VerkoperResponse>;
}

export async function upsertMyVerkoper(payload: VerkoperPayload): Promise<VerkoperResponse> {
  const res = await authFetch(`${apiBase}/api/Verkoper/me`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toDto(payload)),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Opslaan verkoper mislukt.");
  }
  return res.json() as Promise<VerkoperResponse>;
}
