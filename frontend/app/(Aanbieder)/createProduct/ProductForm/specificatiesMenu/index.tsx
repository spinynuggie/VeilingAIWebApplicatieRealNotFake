"use client";

import { useEffect, useState, useRef } from "react";
import { getSpecificaties, Specificaties } from "@/services/specificatiesService";

// 1. Define the props this component accepts
interface SpecificatiesMenuProps {
  onChange: (ids: number[], specs: { naam: string; beschrijving: string }[]) => void; 
  selectedIdsProp?: number[];// Optional: to sync state if form resets
}

export default function SpecificatiesMenu({ onChange, selectedIdsProp = [] }: SpecificatiesMenuProps) {
  const [specificaties, setSpecificaties] = useState<Specificaties[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [isOpen, setIsOpen] = useState(false);
  // We initialize state with props if provided
  const [selectedIds, setSelectedIds] = useState<number[]>(selectedIdsProp);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal state if parent resets the form
  useEffect(() => {
    setSelectedIds(selectedIdsProp);
  }, [selectedIdsProp]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getSpecificaties();
        setSpecificaties(data);
      } catch (error) {
        console.error("Failed to load specs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelection = (id: number, name: string) => {
    if (!id) return;
    
    let newIds: number[];
    
    if (selectedIds.includes(id)) {
      newIds = selectedIds.filter((item) => item !== id);
    } else {
      newIds = [...selectedIds, id];
    }

    setSelectedIds(newIds);

    // 2. Find the names corresponding to the new IDs (for the Product Card preview)
    const selectedNames = specificaties
      .filter(s => newIds.includes(s.specificatieId))
      .map(s => s.naam);

    // 3. Send data up to the parent
    onChange(newIds, selectedNames);
  };

  if (loading) return <div className="text-sm text-gray-500 animate-pulse">Loading options...</div>;

  return (
    <div className="relative w-full" ref={dropdownRef} style={{ marginTop: "15px" }}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Kies Specificaties
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-md py-2 px-4 flex items-center justify-between shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <span className="text-gray-700">
          {selectedIds.length === 0 
            ? "Selecteer opties..." 
            : `${selectedIds.length} geselecteerd`}
        </span>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {specificaties.length === 0 ? (
            <div className="p-2 text-gray-500">Geen specificaties gevonden.</div>
          ) : (
            specificaties.map((spec) => {
              const isSelected = selectedIds.includes(spec.specificatieId);
              
              return (
                <div
                  key={spec.specificatieId || Math.random()} 
                  onClick={() => toggleSelection(spec.specificatieId, spec.naam)}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 transition-colors ${
                    isSelected ? "bg-blue-50 text-blue-900" : "text-gray-900"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3 pointer-events-none"
                    />
                    <span className={`block truncate ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                      {spec.naam}
                    </span>
                    <span className="ml-2 text-xs text-gray-400 truncate">
                      - {spec.beschrijving}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Selected Tags Display */}
      <div className="mt-2 flex flex-wrap gap-2">
        {specificaties
          .filter(s => selectedIds.includes(s.specificatieId))
          .map(s => (
            <span key={s.specificatieId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {s.naam}
              <button 
                type="button"
                onClick={() => toggleSelection(s.specificatieId, s.naam)}
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                &times;
              </button>
            </span>
          ))}
      </div>
    </div>
  );
}