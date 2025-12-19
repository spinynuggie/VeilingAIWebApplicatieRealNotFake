"use client"; // <--- Add this at the very top

import { Box } from '@mui/material';
import { ReactNode } from 'react';

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
        // This function is now safe because the component is 'use client'
        background: (theme) => theme.gradients?.main || 'white', 
        color: 'text.primary',
        overflowX: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}