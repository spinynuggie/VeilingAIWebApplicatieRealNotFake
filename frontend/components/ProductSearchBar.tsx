"use client";

import React from "react";

interface SearchBarProps {
  onSearch: (term: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Zoeken..."
        onChange={(e) => onSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #90B498",
          backgroundColor: "#F0FDF4", // Heel licht groen
          fontSize: "14px",
          outline: "none",
          color: "#333"
        }}
      />
    </div>
  );
}
