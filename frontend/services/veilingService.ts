export async function getVeilingen() {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
  const res = await fetch(`${apiBase}/api/Veiling`);
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json();
}
