interface VeilingDisplayProps {
  id: number;
  naam: string;
}

export default function VeilingDisplay({ id, naam }: VeilingDisplayProps) {
  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "8px",
      marginBottom: "8px"
    }}>
      <h3>{naam}</h3>
      <p>ID: {id}</p>
    </div>
  );
}
