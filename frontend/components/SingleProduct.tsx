"use client";

import { Product, ProductDisplayProps } from '@/types/product';
import { useRouter } from "next/navigation";
import { Box } from '@mui/material';

export default function ProductDisplay({ product }: ProductDisplayProps) {
  const router = useRouter();

  if (!product || product.length === 0) {
    return <p>Geen producten beschikbaar</p>;
  }

  const handleProductClick = (productItem: Product) => {
    console.log("Clicked product:", productItem);
    console.log("ProductId:", productItem.productId);

    if (!productItem.productId) {
      console.error("No productId found in product object:", productItem);
      return;
    }

    router.push(`/product/${productItem.productId}`);
  };

return (
  <>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "24px",
        backgroundColor: "#f0ffe8",
        borderRadius: "16px",
        width: "400px",
        maxWidth: "90vw",
        maxHeight: "530px",
      }}
    >
      <h1></h1>
    </Box>
  </>
);
}``
