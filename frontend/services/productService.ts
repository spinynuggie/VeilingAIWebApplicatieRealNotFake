import { Product, CreateProductInput, UpdateProductAuctionInput } from '@/types/product';
import { authFetch } from "./authService";

 const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

 // 3. Product updaten (voor je veilingAanmaken pagina)
// Deze wordt gebruikt voor Toevoegen (links -> rechts) en Verwijderen (rechts -> links)
export async function updateProductAuctionData(payload: UpdateProductAuctionInput): Promise<void> {
  // Let op: Afhankelijk van je C# controller moet dit PUT of PATCH zijn.
  // Meestal is PUT standaard voor updates.
  const res = await authFetch(`${apiBase}/api/ProductGegevens/${payload.productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        productId: payload.productId,
        veilingId: payload.veilingId,
        startPrijs: payload.startPrijs,
        eindPrijs: payload.eindPrijs,
        // Als je backend eist dat alle velden aanwezig moeten zijn bij een PUT,
        // moet je hier mogelijk meer data meesturen.
        // Bij een PATCH request hoeft dat vaak niet.
    }),
  });
}
export async function getProducts(): Promise<Product[]> {
  const res = await authFetch(`${apiBase}/api/ProductGegevens`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Kon producten niet ophalen");
  }

  return res.json();
}

export async function createProduct(payload: CreateProductInput): Promise<Product> {
  const res = await authFetch(`${apiBase}/api/ProductGegevens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });



  if (!res.ok) throw new Error('Aanmaken mislukt');
  return res.json();
}
