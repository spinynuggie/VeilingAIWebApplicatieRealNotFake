"use client";

import React from 'react';
import { FloraLogo } from '@/components/FloraLogo';

export default function FloraLogoExample() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      <FloraLogo mode="small" />
      <FloraLogo mode="medium" />
      <FloraLogo mode="large" />
    </div>
  );
}
