import type { User } from "@/types/user";

export async function getGebruiker() {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
  const res = await fetch(`${apiBase}/api/Gebruiker`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json() as Promise<User[]>;
}
