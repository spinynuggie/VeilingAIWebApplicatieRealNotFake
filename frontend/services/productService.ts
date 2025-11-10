export async function getProduct() {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
  const res = await fetch(`${apiBase}/api/ProductGegevens`);
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json();
}
