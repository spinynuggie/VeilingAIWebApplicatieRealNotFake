interface ProductDisplayProps {
  productId: number;
  productNaam: string;
}

export default function ProductDisplay({ productId, productNaam }: ProductDisplayProps) {
  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "8px",
      marginBottom: "8px"
    }}>
      <h3>{productNaam}</h3>
      <p>ID: {productId}</p>
    </div>
  );
}
