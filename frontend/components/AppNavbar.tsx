"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "./NavBar";
import { useAuth } from "./AuthProvider";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const isLoggedIn = !!user;
  const isSellerOrAdmin = user && (user.role === "VERKOPER" || user.role === "ADMIN");
  const isAdmin = user?.role === "ADMIN";

  const handleLogout = async () => {
    await logout();
    router.push("/landing");
  };

  return (
    <Navbar
      left={
        isLoggedIn ? (
          <>
            <Link href="/dashboard" className="navbar-left-link">
              Dashboard
            </Link>
            <Link href="/profiel" className="navbar-left-link">
              Profiel
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="navbar-left-link">
              Inloggen
            </Link>
            <span>of</span>
            <Link href="/register" className="navbar-left-link">
              registreren
            </Link>
          </>
        )
      }
      center={null}
      right={
        isLoggedIn ? (
          <>
            {isSellerOrAdmin && (
              <Link href="/mijn-veilingen" className="navbar-link">
                Mijn veilingen
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="navbar-link">
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="navbar-link"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              Uitloggen
            </button>
          </>
        ) : (
          <>
            <Link href="#" className="navbar-link flex items-center gap-1">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" />
              <span>Nieuws</span>
            </Link>
            <Link href="#" className="navbar-link flex items-center gap-1">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" />
              <span>Werken bij</span>
            </Link>
          </>
        )
      }
    />
  );
}

