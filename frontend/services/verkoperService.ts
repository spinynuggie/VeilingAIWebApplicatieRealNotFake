import { authFetch } from "./authService";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export type VerkoperPayload = {
  kvkNummer: string;
  bedrijfsgegevens: string;
  adresgegevens?: string;
  financieleGegevens?: string;
};

export type VerkoperResponse = {
  verkoperId: number;
  kvkNummer: string;
  bedrijfsgegevens: string;
  adresgegevens: string;
  financieleGegevens: string;
};

const toDto = (payload: VerkoperPayload) => ({
  kvkNummer: payload.kvkNummer,
  bedrijfsgegevens: payload.bedrijfsgegevens,
  adresgegevens: payload.adresgegevens ?? "",
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
