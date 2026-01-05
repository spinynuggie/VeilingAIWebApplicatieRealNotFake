import { useState } from "react";
import { useRouter } from "next/navigation";
import { getVeilingen } from "@/services/veilingService";
import { Veiling } from "@/types/veiling";

export function useVeilingAanmaken() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const navigateToCreate = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const veilingen = await getVeilingen();
      
      const existingIds = veilingen.map((v: Veiling) => Number(v.veilingId));
      const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

      router.push(`/veilingAanmaken/${nextId}`);
    } catch (error) {
      console.error("Fout bij het navigeren naar aanmaken:", error);
      alert("Er is iets misgegaan bij het ophalen van de veilingen.");
    } finally {
      setIsLoading(false);
    }
  };

  return { navigateToCreate, isLoading };
}