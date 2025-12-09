// page.tsx
"use client";

import { VeilingKlok } from '@/components/VeilingKlok';

export default function VeilingKlokDemoPage() {
  const handleBid = (price: number, quantity: number) => {
    console.log(`Bieding: ${quantity} stuks voor €${price.toFixed(2)} per stuk (Totaal: €${(price * quantity).toFixed(2)})`);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6', padding: 3 }}>
      <VeilingKlok 
        startPrice={25.00}
        endPrice={10.00}
        duration={30} // 30 seconden countdown
        productName="Rode Tulpen"
        onBid={handleBid}
      />
    </div>
  );
}