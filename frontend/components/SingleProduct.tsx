"use client";

import { ProductDisplayProps } from '@/types/product';
import { Box } from '@mui/material';

export default function ProductDisplay({ product }: ProductDisplayProps) {
  if (!product || product.length === 0) {
    return <p>Geen producten beschikbaar</p>;
  }

  return (
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
  );
}
