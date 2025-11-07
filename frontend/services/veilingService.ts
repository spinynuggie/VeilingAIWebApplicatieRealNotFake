export async function getVeilingen() {
  const res = await fetch("http://localhost:5000/api/veiling");
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json();
}
