import type { User } from "@/types/user";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

if (!apiBase) {
  // Fail fast in development if env var is missing
  throw new Error("NEXT_PUBLIC_BACKEND_LINK is not defined.");
}

function getXsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("XSRF-TOKEN="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

function applyCsrfHeader(init: RequestInit = {}): RequestInit {
  const method = (init.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { ...init };
  }

  const token = getXsrfToken();
  if (!token) {
    return { ...init };
  }

  const headers = new Headers(init.headers ?? {});
  headers.set("X-XSRF-TOKEN", token);

  return { ...init, headers };
}

async function refreshTokens(): Promise<boolean> {
  const res = await fetch(
    `${apiBase}/api/Gebruiker/refresh`,
    applyCsrfHeader({
      method: "POST",
      credentials: "include",
    })
  );
  return res.ok;
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit, retry = true): Promise<Response> {
  const enhancedInit: RequestInit = applyCsrfHeader({
    ...init,
    credentials: "include",
  });

  const res = await fetch(input, enhancedInit);
  if (res.status === 401 && retry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return authFetch(input, init, false);
    }
  }
  return res;
}

export async function getCurrentUser(): Promise<User | null> {
  const res = await authFetch(`${apiBase}/api/Gebruiker/me`, { method: "GET" });

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
  const res = await authFetch(`${apiBase}/api/Gebruiker/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ emailadres, wachtwoord, naam }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Registreren mislukt.");
  }
}

export async function login(emailadres: string, wachtwoord: string): Promise<void> {
  const res = await authFetch(`${apiBase}/api/Gebruiker/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ emailadres, wachtwoord }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Inloggen mislukt.");
  }
}

export async function logout(): Promise<void> {
  const res = await authFetch(`${apiBase}/api/Gebruiker/logout`, {
    method: "POST",
  });

  if (!res.ok && res.status !== 401) {
    const text = await res.text();
    throw new Error(text || "Uitloggen mislukt.");
  }
}
