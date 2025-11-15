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
          width: "fit-content",
          maxWidth: "90vw",
          // Calculate max height for 3 products: 3*150px (product height) + 2*16px (gaps) + 48px (padding)
          maxHeight: "530px",
          overflowY: "auto",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          margin: "0 auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
        }}
      >
        {product.map((p) => (
          <Box
            key={p.productId || Math.random()}
            onClick={() => handleProductClick(p)}
            sx={{
              display: "flex",
              border: "1px solid #ccc",
              borderRadius: "8px",
              width: "350px",
              height: "150px",
              overflow: "hidden",
              backgroundColor: "#f5f5f5",
              flexShrink: 0,
              transition: "transform 0.2s ease-in-out, background-color 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#e9e9e9",
                cursor: "pointer",
                transform: "scale(1.02)",
              },
            }}
          >
            <Box
              sx={{
                width: "30%",
                height: "100%",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {p.fotos ? (
                <img
                  src={p.fotos}
                  alt={`afbeelding van ${p.productNaam}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#e0e0e0",
                    color: "#666",
                  }}
                >
                  Geen afbeelding
                </Box>
              )}
            </Box>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                padding: "16px",
                gap: "8px",
              }}
            >
              <Box sx={{ minHeight: "40px" }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: "bold",
                    wordWrap: "break-word",
                    overflow: "hidden",
                    lineHeight: "1.3",
                  }}
                >
                  {p.productNaam}
                </h3>
              </Box>

              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: "1.4",
                    color: "#666",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 6,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {p.productBeschrijving || "Geen beschrijving beschikbaar"}
                </p>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
}
