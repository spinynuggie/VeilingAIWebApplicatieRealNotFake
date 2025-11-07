interface ProductDisplayProps {
  productId: number;
  productNaam: string;
  foto: string;
}

export default function ProductDisplay({ productId, productNaam, foto }: ProductDisplayProps) {
return (
    <div key={productId} style={{ margin: '20px', border: '1px solid #ccc', padding: '10px' }}>
      <h3>Naam: {productNaam} ID:{productId}</h3>
      {foto ? (
        <img
          src={foto}
          alt={productNaam}
          style={{ width: '200px', height: 'auto', objectFit: 'cover' }}
        />
      ) : (
        <p>Geen afbeelding beschikbaar</p>
      )}
    </div>
  );
}
