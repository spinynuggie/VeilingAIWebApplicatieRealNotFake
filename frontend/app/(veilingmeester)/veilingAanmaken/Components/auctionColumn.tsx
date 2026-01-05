"use client";

import React from "react";
import ProductSearchBar from "@/components/(oud)/ProductSearchBar";
import { Product } from "@/types/product";

interface AuctionColumnProps {
  products: Product[];
  onSearch: (term: string) => void;
  onRemove: (product: Product) => void;
}

export default function AuctionColumn({ products, onSearch, onRemove }: AuctionColumnProps) {
  return (
    <div >
      <h3 >Producten in veiling</h3>

      {/* Zoekbalk specifiek voor deze kolom */}
      <ProductSearchBar onSearch={onSearch} />

      <div style={{ flexGrow: 1, marginTop: '10px' }}>
        {products.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginTop: '20px' }}>
            Geen producten gevonden.
          </p>
        )}

        {products.map((prod) => (
          <div key={prod.productId} style={{ cursor: 'default' }}>
            {/* Verwijder knop (Rood kruisje) */}
            <button
             
              style={{ backgroundColor: "#d9534f", marginRight: "10px" }}
              onClick={() => onRemove(prod)}
            >
              ✕
            </button>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{prod.productNaam}</div>
              <div style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '5px' }}>
                <div>
                  Startprijs: {prod.startPrijs !== 0 ? `€${prod.startPrijs.toFixed(2)}` : 'price not assigned'}
                </div>
                <div>
                  Eindprijs: {prod.eindPrijs !== 0 ? `€${prod.eindPrijs.toFixed(2)}` : 'price not assigned'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer knoppen */}
      <div >
        <button >Start</button>
        <button>Eind</button>
        <button>
          Aanmaken
        </button>
      </div>
    </div>
  );
}
