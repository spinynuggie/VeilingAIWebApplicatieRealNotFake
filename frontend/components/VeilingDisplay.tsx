interface Veiling {
  id: number;
  naam: string;
  beschrijving: string;
  image: string;
}

interface VeilingDisplayProps {
  veilingen: Veiling[];
}

export default function VeilingDisplay({ veilingen }: VeilingDisplayProps) {
  // Bescherm tegen undefined
  if (!veilingen || veilingen.length === 0) {
    return <p>Geen veilingen beschikbaar</p>;
  }

  return (
    <>
      <div style={{
        display: "flex",
        gap: "16px",
        overflowX: "auto",
        overflowY: "hidden",
        padding: "16px 0",
        width: "100%"
      }}>
        {veilingen.map((v) => (
          <div
            key={v.id}
            style={{
              display: "flex",
              border: "1px solid #ccc",
              borderRadius: "8px",
              width: "300px",
              height: "200px",
              overflow: "hidden",
              backgroundColor: "#f5f5f5",
              flexShrink: 0
            }}
          >
            {/* Afbeelding - 50% van de breedte */}
            <div style={{
              width: "50%",
              height: "100%",
              overflow: "hidden",
              flexShrink: 0
            }}>
              <img
                src={v.image}
                alt={`afbeelding van ${v.naam} veiling`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </div>

            {/* Rechter sectie - Titel en Beschrijving */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: "16px",
              gap: "8px"
            }}>
              {/* Titel */}
              <div style={{
                minHeight: "40px"
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: "bold",
                  wordWrap: "break-word",
                  overflow: "hidden",
                  lineHeight: "1.3"
                }}>
                  {v.naam}
                </h3>
              </div>

              {/* Beschrijving */}
              <div style={{
                flex: 1,
                overflow: "hidden"
              }}>
                <p style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: "1.4",
                  color: "#666",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: "vertical"
                }}>
                  {v.beschrijving}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          height: 8px;
        }

        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        div::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </>
  );
}
