const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export interface Specificaties {
  specificatieId: number;
  naam: string;
  beschrijving: string;
}

export async function getSpecificaties(): Promise<Specificaties[]> {
  const res = await fetch(`${apiBase}/api/Specificaties`, {
    cache: "no-store"
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to fetch: ${res.status} ${errorBody}`);
  }

  return await res.json();
}

export type CreateSpecificatieInput = {
  naam: string;
  beschrijving: string;
};

export async function createSpecificatie(data: CreateSpecificatieInput): Promise<Specificaties> {
  const res = await fetch(`${apiBase}/api/Specificaties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data), // Bevat alleen naam en beschrijving
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("❌ CREATE ERROR:", res.status, errorBody);
    throw new Error(`Failed to create: ${res.status}`);
  }

  return await res.json();
}

export async function searchSpecificaties(term: string): Promise<Specificaties[]> {
  const all = await getSpecificaties(); // Using your existing fetch function
  return all.filter(s =>
    s.naam.toLowerCase().includes(term.toLowerCase()) ||
    s.beschrijving.toLowerCase().includes(term.toLowerCase())
  );
}