"use client";

import React from 'react';
import UserInfoCard from '@/features/UserInfoCard';

const sampleUser = {
  gebruikerId: 1,
  emailadres: 'jan@example.com',
  naam: 'Jan de Vries',
  role: 'VERKOPER',
  straat: 'Dorpsstraat',
  huisnummer: '12A',
  postcode: '1234AB',
  woonplaats: 'Amsterdam'
};

export default function UserInfoExample() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <UserInfoCard user={sampleUser as any} title="Voorbeeld gebruiker" />
    </div>
  );
}
