"use client";

import React from 'react';
import SearchBar from '@/components/SearchBar';

const control = {
  options: [
    { id: 1, naam: 'Test Product 1', image: '/test1.jpg', type: 'Product' as const },
    { id: 2, naam: 'Test Auction 1', image: '/auction1.jpg', type: 'Veiling' as const }
  ],
  loading: false,
  inputValue: '',
  setInputValue: (v: string) => {}
};

export default function SearchBarExample() {
  return (
    <div>
      <SearchBar mode="callback" onSearch={(t) => alert('Zoeken: '+t)} searchControl={control} />
    </div>
  );
}
