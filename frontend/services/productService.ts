export async function getProduct() {
  const res = await fetch("http://localhost:5000/api/ProductGegevens");
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json();
}
