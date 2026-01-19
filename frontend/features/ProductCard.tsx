"use client";

import React, { useState, useEffect } from "react";
import { ProductCardProps } from "../types/types";
import { Box } from "@/components/Box";
import {
  Typography,
  Box as BoxMui,
  List,
  CardMedia,
  TextField,
  Button,
  CardContent,
  Divider,
  ListItem,
  ListItemText,
  Stack,
  Paper
} from "@mui/material";

export default function ProductCard({ product, mode, onAction }: ProductCardProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
  }, []);

  useEffect(() => {
    // Set default value based on available price info
    if (product) {
      const initialPrice = product.startPrijs || product.eindPrijs || product.huidigeprijs || product.price || 0;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setInputValue(initialPrice ? initialPrice.toString() : "");
    }
  }, [product]);

  const handleActionClick = () => {
    if (onAction) {
      if (mode === 'create') {
        const priceFromForm = product.price || product.huidigeprijs || 0;
        const val = typeof priceFromForm === 'string' ? parseFloat(priceFromForm) : Number(priceFromForm);
        onAction(isNaN(val) ? 0 : val);
      } else {
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
  const rawSpecs = product.specifications || (product as any).specificaties || [];

  const displayPrice =
    product.eindPrijs !== undefined ? product.eindPrijs :
      product.startPrijs !== undefined ? product.startPrijs :
        product.price !== undefined ? product.price :
          product.huidigeprijs !== undefined ? product.huidigeprijs : 0;

  const rawImage = product.image || product.fotos;
  const getImageUrl = (img: string | File | null | undefined) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    if (img instanceof File) return URL.createObjectURL(img);
    return null;
  };
  const imageUrl = getImageUrl(rawImage);

  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      height: '100%', // Allows the card to grow vertically
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 1,
      overflow: 'hidden',
      maxWidth: 400, // Constrain width so it doesn't fill the page on detail/wide views
      mx: 'auto'     // Center if it's the only item
    }}>
      {/* HEADER */}
      <CardContent sx={{ pb: 0 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 'bold',
            overflowWrap: 'anywhere' // Prevents title from stretching width
          }}
        >
          {displayTitle}
        </Typography>
      </CardContent>

      {/* IMAGE SECTION */}
      <BoxMui sx={{ p: 2 }}>
        {imageUrl ? (
          <CardMedia
            component="img"
            height="220" // Increased slightly for better aspect ratio
            image={imageUrl}
            alt={product.productNaam}
            sx={{ borderRadius: 1, objectFit: 'cover', width: '100%' }}
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

      {/* Main Content Area */}
      <CardContent sx={{ pt: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* DESCRIPTION - Fixed wrapping here */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            whiteSpace: 'pre-wrap',    // Respects manual line breaks
            overflowWrap: 'anywhere',  // Forces wrap on long strings/URLs
            wordBreak: 'break-word',   // Standard wrapping logic
            width: '100%'              // Constrain to container
          }}
        >
          {displayDesc}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* SPECIFICATIONS */}
        <BoxMui sx={{ flexGrow: 1 }}> {/* Keeps specs pushing content if short */}
          <List dense sx={{ p: 0, mb: 2 }}>
            {rawSpecs.length > 0 ? (
              rawSpecs.map((spec: any, index: number) => {
                const displayName = typeof spec === 'string' ? spec : (spec.naam || spec.Naam);
                return (
                  <ListItem key={index} disableGutters sx={{ py: 0 }}>
                    <ListItemText
                      primary={`• ${displayName || "Onbekend"}`}
                      primaryTypographyProps={{
                        variant: 'caption',
                        sx: { overflowWrap: 'anywhere' }
                      }}
                    />
                  </ListItem>
                );
              })
            ) : (
              <Typography variant="caption" color="text.secondary">Geen Specificaties</Typography>
            )}
          </List>
        </BoxMui>

        {/* PRICE DISPLAY & ACTIONS - Pushed to bottom */}
        <BoxMui sx={{ mt: 'auto' }}>
          {mounted && (
            <BoxMui sx={{ mb: 2 }}>
              {mode === 'display' ? (
                <Stack direction="row" spacing={1}>
                  <Paper variant="outlined" sx={{ flex: 1, p: 1, textAlign: 'center', bgcolor: 'custom.color6' }}>
                    <Typography variant="caption" display="block" color="text.secondary">startprijs</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {product.startPrijs ? `€${Number(product.startPrijs).toFixed(2)}` : 'n.v.t.'}
                    </Typography>
                  </Paper>
                  <Paper variant="outlined" sx={{ flex: 1, p: 1, textAlign: 'center', bgcolor: 'custom.color6' }}>
                    <Typography variant="caption" display="block" color="text.secondary">eindprijs</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {product.eindPrijs ? `€${Number(product.eindPrijs).toFixed(2)}` : 'n.v.t.'}
                    </Typography>
                  </Paper>
                </Stack>
              ) : (
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Min prijs: € {typeof displayPrice === 'number' ? displayPrice.toFixed(2) : displayPrice || "0.00"}
                  </Typography>
                </Paper>
              )}
            </BoxMui>
          )}

          {mode === 'auction' && (
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                label="Bedrag"
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