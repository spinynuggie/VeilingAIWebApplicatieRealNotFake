// components/ProductDisplay.tsx
import { Product, ProductDisplayProps } from '@/types/product';

export default function ProductDisplay({ product }: ProductDisplayProps) {
  return (
    <div key={product.productId} style={{margin: '20px', border: '1px solid #ccc', padding: '10px' }}>
      <h3>Naam: {product.productNaam} ID:{product.productId}</h3>
      {product.fotos ? (
        <img
          src={product.fotos}
          alt={product.productNaam}
          style={{ width: '200px', height: 'auto', objectFit: 'cover' }}
        />
      ) : (
        <p>Geen afbeelding beschikbaar</p>
      )}
    </div>
  );
}
