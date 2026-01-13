"use client";

import React from 'react';
import { Box } from '@/components/Box';

export default function BoxExample() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Box>
        <div style={{ padding: 8 }}>Dit is een voorbeeld in de Box component.</div>
      </Box>
    </div>
  );
}
