import { createTheme } from "@mui/material/styles";

const paletteColors = {
  color1: '#003f2d', // Deepest Forest Green (Buttons/Headers)
  color2: '#005c42', // Primary Brand Green (Login Button)
  color3: '#4caf50', // Level 100: Vibrant Accent Green
  color4: '#8bc34a', // Level 80: Light Lime/Green (Gradual step)
  color5: '#c5e1a5', // Level 60: Pale Leaf (Gradual step)
  color6: '#f1f8e9', // Level 20: Ultra Light Mint (Gradual step)
  color7: '#ffffff', // Level 0: Pure White
  color8: '#757575', // Medium Gray (Labels/Placeholders)
  color9: '#212121', // Near Black (Main text)
  color10: '#d32f2f',// Alert Red (Visible in your error message)
};

declare module '@mui/material/styles' {
  interface Palette { custom: typeof paletteColors; }
  interface PaletteOptions { custom?: Partial<typeof paletteColors>; }
  interface Theme { gradients: { main: string }; }
  interface ThemeOptions { gradients?: { main?: string }; }
}

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { 
      main: paletteColors.color2, 
      contrastText: paletteColors.color7 
    },
    secondary: { 
      main: paletteColors.color5, 
      contrastText: paletteColors.color7 
    },
    background: {
      default: paletteColors.color5, // That specific Mint background
      paper: paletteColors.color7,   // Pure white for the login card
    },
    text: {
      primary: paletteColors.color9, 
      secondary: paletteColors.color8,
    },
    error: {
      main: paletteColors.color10, // Matches your NetworkError red
    },
    custom: paletteColors,
  },
  gradients: {
    // This creates that split look or subtle transition seen in professional apps
    main: `linear-gradient(135deg, ${paletteColors.color7} 0%, ${paletteColors.color5} 150%)`,
  },
  shape: { 
    borderRadius: 8, // Modern professional standard
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase', // Matches the "INLOGGEN" button
          fontWeight: 'bold',
          padding: '10px 20px',
        },
      },
    },
  },
});