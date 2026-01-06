"use client";

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Stack, 
  Divider 
} from '@mui/material';
import { Close as CloseIcon} from "@mui/icons-material"
import ProductSearchBar from "@/components/(oud)/ProductSearchBar";
import { Product } from "@/types/product";

interface AuctionColumnProps {
  products: Product[];
  onSearch: (term: string) => void;
  onRemove: (product: Product) => void;
}

export default function AuctionColumn({ products, onSearch, onRemove }: AuctionColumnProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* TITEL */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'custom.color1' }}>
        Producten in veiling
      </Typography>

      {/* ZOEKBALK */}
      <ProductSearchBar onSearch={onSearch} />

      <Box sx={{ flexGrow: 1, mt: 2, overflowY: 'auto' }}>
        {products.length === 0 ? (
          <Typography 
            variant="body2" 
            sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}
          >
            Geen producten gevonden.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {products.map((prod) => (
              <Paper
                key={prod.productId}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  borderColor: 'custom.color5',
                  bgcolor: 'background.paper',
                  '&:hover': { borderColor: 'primary.main' }
                }}
              >
                {/* VERWIJDER KNOP */}
                <IconButton
                  size="small"
                  onClick={() => onRemove(prod)}
                  sx={{
                    bgcolor: 'error.main',
                    color: 'white',
                    mr: 2,
                    '&:hover': { bgcolor: 'error.dark' },
                    borderRadius: 1 // Maakt het een subtiel vierkantje met afgeronde hoeken
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>

                {/* PRODUCT INFO */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {prod.productNaam}
                  </Typography>
                  
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Start: {prod.startPrijs !== 0 ? `€${prod.startPrijs.toFixed(2)}` : 'N.v.t.'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Eind: {prod.eindPrijs !== 0 ? `€${prod.eindPrijs.toFixed(2)}` : 'N.v.t.'}
                    </Typography>
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
