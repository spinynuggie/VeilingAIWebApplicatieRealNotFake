"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/NavBar";
import SearchBar from "@/components/SearchBar";
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import { getProducts } from "@/services/productService";
import Profile  from "@/components/Profile";
import { Box } from "@mui/material"
import RequireAuth from "@/components/RequireAuth";
import ProductCard from "@/components/ProductCard/ProductCard";
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
          <Navbar
            style={{ backgroundColor: "#C8FFD6"}}
            left={<img src={royalLogo.src} alt="Logo Royal Flora Holland" width={100}/>}
            center={<SearchBar/>}
            right={<Profile/>}
          />
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
        <Navbar
          style={{ backgroundColor: "#C8FFD6"}}
          left={<img src={royalLogo.src} alt="Logo Royal Flora Holland" width={100}/>}
          center={<SearchBar/>}
          right={<Profile/>}
        />

        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'center', paddingY: 4 }}>
            {/* THE FIX: Use currentProduct variable, NOT array index allProducts[id] */}
            <ProductCard mode="display" product={currentProduct} />
        </Box>
      </div>
    </RequireAuth>
  );
}
