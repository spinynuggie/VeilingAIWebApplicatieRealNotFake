"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/features/(NavBar)/AppNavBar";
import { getProducts } from "@/services/productService";
import RequireAuth from "@/components/(oud)/RequireAuth";
import ProductCard from "@/features/ProductCard";
// Make sure to import the type to ensure type safety
import { Product } from '@/types/product';

export default function VeilingDetailPage() {
  // Use the correct type for state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const pathname = usePathname();
  // Ensure we get a number
  const id = parseInt(pathname.split('/').pop() || '0');

  // 1. Fetch Products (Only once)
  useEffect(() => {
    getProducts()
      .then(data => {
        console.log("Alle producten geladen:", data);
        setAllProducts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 2. THE FIX: Use 'productId' (from your interface) instead of 'id'
  const currentProduct = allProducts.find(product => product.productId === id);

  console.log("Looking for productId:", id);
  console.log("Found:", currentProduct);

  // 3. Loading State
  if (loading) {
    return <p style={{textAlign: "center", marginTop: "20px"}}>Laden van product...</p>;
  }

  // 4. Product Not Found State
  if (!currentProduct) {
    return (
       <RequireAuth>
          <Navbar/>
          <div style={{textAlign: "center", marginTop: "50px"}}>
              <h1>Product niet gevonden</h1>
              <p>Er is geen product met productId: {id}</p>
          </div>
       </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div style={{background: "white", minHeight: "100vh" }}>
        <Navbar        />

        <ProductCard mode="display" product={currentProduct}/>
      </div>
    </RequireAuth>
  );
}
