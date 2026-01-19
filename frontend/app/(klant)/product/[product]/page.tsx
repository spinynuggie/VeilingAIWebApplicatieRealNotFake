"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/features/(NavBar)/AppNavBar";
import { getProductById } from "@/services/productService";
import RequireAuth from "@/components/(oud)/RequireAuth";
import ProductCard from "@/features/ProductCard";
import { Product } from '@/types/product';
import { Background } from "@/components/Background";
import { Box as BoxMui } from "@mui/material";

export default function VeilingDetailPage() {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const pathname = usePathname();
  const id = parseInt(pathname.split('/').pop() || '0');

  useEffect(() => {
    if (id > 0) {
      getProductById(id)
        .then(setCurrentProduct)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);


  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "20px" }}>Laden van product...</p>;
  }

  if (!currentProduct) {
    return (
      <Background>
        <RequireAuth>
          <Navbar />
          <BoxMui sx={{ p: 4 }}>
            <h1>Product niet gevonden</h1>
            <p>Er is geen product met productId: {id}</p>
          </BoxMui>
        </RequireAuth>
      </Background>
    );
  }

  return (
    <RequireAuth>
      <Background>
        <Navbar />
        <BoxMui
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "60px 40px"
          }}
        >
          <ProductCard mode="display" product={currentProduct} />
        </BoxMui>
      </Background>
    </RequireAuth>
  );
}