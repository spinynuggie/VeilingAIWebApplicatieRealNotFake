"use client";

import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import UserInfoCard from "@/components/UserInfoCard";

export default function ProfielPage() {
  const { user, loading } = useAuth();

  return (
    <RequireAuth>
      <div style={{ padding: "20px", display: "grid", gap: 16 }}>
        <h1 style={{ margin: 0 }}>Profiel</h1>
        {user && !loading ? (
          <UserInfoCard user={user} title="Profielinformatie" />
        ) : (
          <div>Gegevens laden...</div>
        )}
      </div>
    </RequireAuth>
  );
}
