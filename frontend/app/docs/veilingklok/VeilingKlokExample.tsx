"use client";

import React from 'react';
import { VeilingKlok } from '@/components/VeilingKlok';

export default function VeilingKlokExample() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
      <VeilingKlok
        startPrice={100}
        endPrice={10}
        duration={3600}
        productName="Voorbeeld Product"
        livePrice={42}
        remainingQuantity={5}
        onBid={(price, qty) => alert(`Geboden ${qty} @ € ${price.toFixed(2)}`)}
      />
    </div>
  );
}
