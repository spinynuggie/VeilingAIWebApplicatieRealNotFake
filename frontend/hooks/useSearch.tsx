import { useState, useEffect, useRef } from "react";

export function useSearch<T>(searchFn: (query: string, signal: AbortSignal) => Promise<T[]>) {
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (inputValue.length === 0) {
      setOptions([]);
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
    }, 200);

    return () => clearTimeout(timer);
  }, [inputValue, searchFn]); // searchFn is nu een dependency

  return { options, loading, inputValue, setInputValue };
}