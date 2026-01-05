"use client";

import { Box } from '@mui/material';
import { ReactNode } from 'react';

interface BackgroundProps {
  children: ReactNode;
}

export function Background({ children }: BackgroundProps) {
  return (
    <Box
      sx={{
        // Gebruik minHeight in plaats van height om afsnijden van content te voorkomen
        minHeight: '100vh',
        width: '100%',
        display: 'block', // 'block' in plaats van 'flex' voorkomt ongewenste verticale centering
        background: (theme) => theme.gradients?.main || 'white', 
        color: 'text.primary',
        margin: 0,
        padding: 0,
      }}
    >
      {children}
    </Box>
  );
}