"use client";

import React from 'react';
import { Button } from '@/components/Buttons/Button';

export default function ButtonExample() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Button variant="contained" onClick={() => alert('Button clicked')}>Klik mij</Button>
    </div>
  );
}
