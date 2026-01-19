"use client";

import React from 'react';
import VeilingDisplay from '@/components/VeilingDisplay';

const sample = [
  {
    veilingId: 1,
    naam: 'Elektronica Veiling',
    beschrijving: 'Kleine gadgets',
    image: '/placeholder-auction.jpg',
    starttijd: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    eindtijd: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    locatieId: 1,
    veilingMeesterId: 1,
    veilingDuurInSeconden: 10
  }
];

export default function VeilingDisplayExample() {
  return (<div style={{ padding: 8 }}><VeilingDisplay veilingen={sample} /></div>);
}
