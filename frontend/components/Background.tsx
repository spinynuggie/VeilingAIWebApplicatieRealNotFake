import { Box } from '@mui/material';
import { ReactNode } from 'react';

// This interface tells TypeScript that 'children' is a valid prop
interface BackgroundProps {
  children: ReactNode;
}

export function Background({ children }: BackgroundProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        // This pulls from the theme we set up earlier
        background: (theme) => theme.gradients.main,
        color: 'text.primary',
        overflowX: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}