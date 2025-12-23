// src/components/ProductCard/index.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ProductCardProps } from "../types/types";
import { Box } from "@/components/Box";
import { Typography, Box as BoxMui, List, CardMedia, Card, TextField, Button, CardContent, Divider, ListItem, ListItemText, Stack, Paper,  } from "@mui/material";

export default function ProductCard({ product, mode, onAction }: ProductCardProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setInputValue("");
  }, [product]);

  const handleActionClick = () => {
    if (onAction) {
      if (mode === 'create') {
        // Mode 1: Create - Use price from prop (form)
        const priceFromForm = product.price || product.huidigeprijs || 0;
        const val = typeof priceFromForm === 'string' ? parseFloat(priceFromForm) : Number(priceFromForm);
        onAction(isNaN(val) ? 0 : val);
      } else {
        // Mode 2: Auction - Use local input (bid)
        const val = parseFloat(inputValue);
        if (isNaN(val)) {
          alert("Vul een geldig bedrag in");
          return;
        }
        onAction(val);
      }
    }
  };

  if (!product) {
    return <div>Loading product…</div>;
  }

  // --- MAPPING LOGICA ---
  const displayTitle = product.name || product.productNaam || "Product Naam";
  const displayDesc = product.description || product.productBeschrijving || "Geen beschrijving beschikbaar.";
  
  // Get the price from the most appropriate field - prioritize eindPrijs as minimum price
  const displayPrice = 
    product.eindPrijs !== undefined ? product.eindPrijs : 
    product.startPrijs !== undefined ? product.startPrijs :
    product.price !== undefined ? product.price :
    product.huidigeprijs !== undefined ? product.huidigeprijs : 0;

  // Handle Image (String URL or File object)
  const rawImage = product.image || product.fotos;
  const getImageUrl = (img: string | File | null | undefined) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    if (img instanceof File) return URL.createObjectURL(img);
    return null;
  };
  const imageUrl = getImageUrl(rawImage);

  return (
    <Box>
      {/* HEADER */}
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
          {displayTitle}
        </Typography>
      </CardContent>

      {/* IMAGE SECTION */}
      <BoxMui sx={{ p: 2 }}>
        {imageUrl ? (
          <CardMedia
            component="img"
            height="180"
            image={imageUrl}
            alt="Product"
            sx={{ borderRadius: 1, objectFit: 'cover' }}
          />
        ) : (
          <BoxMui sx={{ 
            height: 180, 
            bgcolor: 'grey.300', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: 1 
          }}>
            <Typography color="text.secondary">Geen afbeelding</Typography>
          </BoxMui>
        )}
      </BoxMui>

      <CardContent sx={{ pt: 0 }}>
        {/* DESCRIPTION */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {displayDesc}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* SPECIFICATIONS */}
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Product specificaties
        </Typography>
        <List dense sx={{ p: 0, mb: 2 }}>
          {product.specifications && product.specifications.length > 0 ? (
            product.specifications.map((spec, index) => (
              <ListItem key={index} disableGutters sx={{ py: 0 }}>
                <ListItemText primary={`• ${spec}`} primaryTypographyProps={{ variant: 'caption' }} />
              </ListItem>
            ))
          ) : (
            <Typography variant="caption" color="text.secondary">Geen Specificaties</Typography>
          )}
        </List>

        {/* PRICE DISPLAY */}
        {mounted && (
          <BoxMui sx={{ mb: 2 }}>
            {mode === 'display' ? (
              <Stack direction="row" spacing={1}>
                {/* Start Price */}
                <Paper variant="outlined" sx={{ flex: 1, p: 1, textAlign: 'center', bgcolor: 'custom.color6' }}>
                  <Typography variant="caption" display="block" color="text.secondary">startprijs</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {product.startPrijs ? `€${Number(product.startPrijs).toFixed(2)}` : 'price not assigned'}
                  </Typography>
                </Paper>
                {/* End Price */}
                <Paper variant="outlined" sx={{ flex: 1, p: 1, textAlign: 'center', bgcolor: 'custom.color6' }}>
                  <Typography variant="caption" display="block" color="text.secondary">eindprijs</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {product.eindPrijs ? `€${Number(product.eindPrijs).toFixed(2)}` : 'price not assigned'}
                  </Typography>
                </Paper>
              </Stack>
            ) : (
              <Paper variant="outlined" sx={{ p: 1, textAlign: 'center', bgcolor: 'primary.main', color: 'custom.color7' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Min prijs: € {typeof displayPrice === 'number' ? displayPrice.toFixed(2) : displayPrice || "0.00"}
                </Typography>
              </Paper>
            )}
          </BoxMui>
        )}

        {/* ACTIONS */}
        <BoxMui sx={{ mt: 'auto' }}>
          {mode === 'auction' && (
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                label="Startprijs"
                type="number"
                variant="outlined"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleActionClick}
                sx={{ textTransform: 'none' }}
              >
                Toevoegen
              </Button>
            </Stack>
          )}
        </BoxMui>
      </CardContent>
    </Box>
  );
}
