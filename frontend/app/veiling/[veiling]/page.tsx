"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Veiling } from '@/types/veiling';
import { getVeilingen } from "@/services/veilingService"; // <-- Added necessary import
import RequireAuth from "@/components/RequireAuth";

export default function VeilingDetailPage() {
  const [veiling, setVeiling] = useState<Veiling | null>(null);
  const [error, setError] = useState<string>("");

  // Get ID from URL path
  const pathname = usePathname();
  const id = parseInt(pathname.split('/').pop() || '0');

  useEffect(() => {
    if (!id || id === 0) {
      setError("Invalid ID");
      return;
    }

    getVeilingen()
      .then(data => {
        // Using the Veiling type instead of 'any'
        const found = data.find((v: Veiling) => v.veilingId === id);

        if (!found) {
          // Fixed syntax error: wrapped string in backticks
          setError(`No veiling found with id ${id}`);
        } else {
          setVeiling(found);
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError(err.message);
      });
  }, [id]);

  if (error) return <p>Error: {error}</p>;
  if (!veiling) return <p>Loading... (looking for id: {id})</p>;

  return (
    <RequireAuth>
      <div style={{ padding: "20px" }}>
        <p>naam: {veiling.naam}; veilingId: {veiling.veilingId};</p>
      </div>
    </RequireAuth>
  );
}
