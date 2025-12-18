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
    console.log("❌ ERROR STATUS:", res.status);
    console.log("❌ ERROR BODY:", errorBody);
    throw new Error(`Failed to fetch: ${res.status} ${errorBody}`);
  }

  return await res.json();
}