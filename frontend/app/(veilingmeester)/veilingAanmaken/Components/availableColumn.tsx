import { Product } from "@/types/product";
import ProductSearchBar from "@/components/(oud)/ProductSearchBar"
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Stack, 
  Avatar, 
  CircularProgress 
} from '@mui/material';

interface Props {
  loading: boolean;
  products: Product[];
  selectedId?: number;
  onSearch: (term: string) => void;
  onSelect: (product: Product) => void;
}

export function AvailableColumn({ loading, products, selectedId, onSearch, onSelect }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* TITEL */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'custom.color1' }}>
        Zoek naar producten
      </Typography>

      {/* ZOEKBALK */}
      <ProductSearchBar onSearch={onSearch} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, mt: 2, overflowY: 'auto' }}>
          <Stack spacing={1.5}>
            {products.map((prod) => {
              const isSelected = selectedId === prod.productId;

              return (
                <Paper
                  key={prod.productId}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: '0.2s',
                    // Gebruik color2 voor de geselecteerde rand, anders kleur 5
                    borderColor: isSelected ? 'primary.main' : 'custom.color5',
                    borderWidth: isSelected ? '2px' : '1px',
                    bgcolor: isSelected ? 'custom.color6' : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'custom.color6',
                    },
                  }}
                  onClick={() => onSelect(prod)}
                >
                  {/* PRODUCT FOTO (Links) */}
                  <Avatar
                    src={prod.fotos} // URL uit je interface
                    variant="rounded"
                    sx={{ 
                      width: 50, 
                      height: 50, 
                      mr: 2, 
                      bgcolor: 'custom.color5' // Fallback kleur
                    }}
                  >
                    {prod.productNaam.charAt(0)}
                  </Avatar>

                  {/* PRODUCT INFO (Midden) */}
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ fontWeight: 'bold', color: 'text.primary', lineHeight: 1.2 }}
                    >
                      {prod.productNaam}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Aantal: {prod.hoeveelheid}
                    </Typography>
                  </Box>

                  {/* SELECTIE KNOP (Rechts) */}
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'custom.color4', // Jouw Vibrant Accent Green
                      color: 'white',
                      ml: 1,
                      '&:hover': { bgcolor: 'custom.color3' },
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Voorkom dubbele trigger door Paper onClick
                      onSelect(prod);
                    }}
                  >
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
