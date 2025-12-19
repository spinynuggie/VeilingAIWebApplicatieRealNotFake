import { useState, useEffect, useRef } from "react";
import { SearchResult, globalSearch } from "@/services/searchService";

export function useSearch() {
  const [options, setOptions] = useState<SearchResult[]>([]);
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
        // You can update your globalSearch to accept the signal
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/api/Search?query=${encodeURIComponent(inputValue)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setOptions(data);
      } catch (error: any) {
        if (error.name !== "AbortError") console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [inputValue]);

  return { options, loading, inputValue, setInputValue };
}