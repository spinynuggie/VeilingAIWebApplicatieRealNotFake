"use client";

import { GebruikerDisplayProps } from '@/types/gebruiker';
export default function GebruikerDisplay({ gebruikers }: GebruikerDisplayProps) {
  // Bescherm tegen undefined
  if (!gebruikers || gebruikers.length === 0) {
    return <p>Geen gebruikers beschikbaar</p>;
  }

  return (
    <div>
      {gebruikers.map((gebruiker) => (
        <div key={gebruiker.gebruikerId} style={{ margin: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h3>Naam: {gebruiker.naam} ID: {gebruiker.gebruikerId}</h3>
          <p>Email: {gebruiker.emailadres}</p>
          <h3>Adres informatie:</h3>
          <p>Woonplaats: {gebruiker.woonplaats}</p>
          <p>Straat: {gebruiker.straat} {gebruiker.huisnummer}</p>
          <p>Postcode: {gebruiker.postcode}</p>
        </div>
      ))}
    </div>
  );
}
