import { useState, useEffect, useRef } from "react";

export function useSearch<T>(searchFn: (query: string, signal: AbortSignal) => Promise<T[]>) {
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 1. Als het veld leeg is, wis de opties en doe niets
    if (inputValue.length === 0) {
      setOptions([]);
      return;
    }

    // 2. NIEUW: Als de tekst korter is dan 2 tekens, doe nog geen API-call
    // Dit voorkomt de 400 Bad Request error van je nieuwe validator
    if (inputValue.length < 2) {
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchFn(inputValue, controller.signal);
        setOptions(data);
      } catch (error: any) {
        if (error.name !== "AbortError") console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    }, 300); 

    return () => clearTimeout(timer);
  }, [inputValue, searchFn]);

  return { options, loading, inputValue, setInputValue };
}