"use client";

import React, { useState, CSSProperties } from "react";

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  baseStyle: CSSProperties;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({ baseStyle, children, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  const finalStyle: CSSProperties = {
    ...baseStyle,
    transition: "all 0.2s ease-in-out",
    filter: isHovered ? "brightness(0.85)" : "brightness(1)",
    transform: isHovered ? "scale(1.05)" : "scale(1)",
    cursor: "pointer",
  };

  return (
    <button
      style={finalStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </button>
  );
};
