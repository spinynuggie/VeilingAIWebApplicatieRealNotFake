"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { NavBar, NavMode } from "./NavBar";

export default function AppNavbar() {
  const [isClient, setIsClient] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Wait for client-side hydration to prevent "flickering"
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div style={{ height: '64px', width: '100%' }} />; 
  }

  // LOGIC: Map Database Roles to UI Modes
  const determineMode = (): NavMode => {
    if (!user) return 'visitor';
    
    if (user.role === "ADMIN") return 'auctioneer';
    if (user.role === "VERKOPER") return 'seller';
    
    return 'customer'; // Default for normal logged-in users
  };

  const handleLogout = async () => {
    await logout();
    router.push("/landing");
  };

  return (
    <NavBar 
      mode={determineMode()} 
      onLogout={handleLogout} 
    />
  );
}