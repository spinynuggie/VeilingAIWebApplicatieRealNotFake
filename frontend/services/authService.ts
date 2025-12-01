import type { User } from "@/types/user";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

if (!apiBase) {
  // Fail fast in development if env var is missing
  throw new Error("NEXT_PUBLIC_BACKEND_LINK is not defined.");
}

export async function getCurrentUser(): Promise<User | null> {
  const res = await fetch(`${apiBase}/api/Gebruiker/me`, {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Kon huidige gebruiker niet ophalen.");
  }

  return res.json();
}

export async function register(emailadres: string, wachtwoord: string, naam?: string): Promise<void> {
  const res = await fetch(`${apiBase}/api/Gebruiker/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ emailadres, wachtwoord, naam }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Registreren mislukt.");
  }
}

export async function login(emailadres: string, wachtwoord: string): Promise<void> {
  const res = await fetch(`${apiBase}/api/Gebruiker/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ emailadres, wachtwoord }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Inloggen mislukt.");
  }
}

export async function logout(): Promise<void> {
  const res = await fetch(`${apiBase}/api/Gebruiker/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok && res.status !== 401) {
    const text = await res.text();
    throw new Error(text || "Uitloggen mislukt.");
  }
}
