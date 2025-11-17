"use client";

import RequireAuth from "@/components/RequireAuth";

export default function NieuweVerkoopPage() {
  return (
    <RequireAuth>
      <div style={{ padding: "20px" }}>
        <h1>Nieuwe verkoop</h1>
        <p>Start hier een nieuwe verkoop.</p>
      </div>
    </RequireAuth>
  );
}

