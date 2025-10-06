import React, { useState } from "react";
import explosionSound from "./assets/massive-explosion.mp3";
import { Button } from '@mui/material';

const App: React.FC = () => {
  const [explosions, setExplosions] = useState<number[]>([]);
  const [particles, setParticles] = useState<{id: number, left: number, top: number, color: string}[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const explosionCount = 20; // aangepast naar 20

  const playSound = () => {
    setIsAnimating(true);
    for (let i = 0; i < explosionCount; i++) {
      setTimeout(() => {
        // Geluid afspelen
        const audio = new Audio(explosionSound);
        audio.play();
        // Visueel effect toevoegen
        setExplosions((prev) => [...prev, i]);
        // Particles toevoegen
        for (let j = 0; j < 10; j++) {
          setParticles((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              left: 120 + Math.random() * 100 - 50,
              top: 140 + Math.random() * 40 - 20,
              color: `hsl(${Math.random() * 60 + 20}, 90%, 60%)`
            }
          ]);
        }
        setTimeout(() => {
          setExplosions((prev) => prev.slice(1));
        }, 300); // Explosie verdwijnt na 0.3s
      }, i * 200);
    }
    setTimeout(() => setIsAnimating(false), explosionCount * 200 + 300);
    setTimeout(() => setParticles([]), explosionCount * 200 + 600);
  };

  return (
    <div style={{ position: "relative", minHeight: 300, overflow: "hidden" }}>
      <h1>Click the button.</h1>
      <Button
        variant="contained"
        onClick={playSound}
        sx={{
          fontSize: 32,
          padding: "32px 64px",
          marginBottom: 4,
          transition: "transform 0.2s, background 0.2s",
          transform: isAnimating ? "scale(1.2)" : "scale(1)",
          animation: isAnimating
            ? "shake 0.2s infinite, flash-bg 0.15s infinite alternate"
            : "none",
          background: isAnimating
            ? "linear-gradient(90deg, #ff1744, #ffea00 70%)"
            : "primary.main",
          color: isAnimating ? "#222" : "#fff",
          boxShadow: isAnimating ? "0 0 32px 8px #ff1744" : undefined,
        }}
        style={{
          marginBottom: 40,
          marginLeft: 40,
          marginTop: 20,
        }}
      >
        i wount exsploode
      </Button>
      {/* Toon explosies */}
      {explosions.map((_, idx) => (
        <span
          key={idx}
          style={{
            fontSize: 80,
            position: "absolute",
            left: `${100 + idx * 60}px`,
            top: "120px",
            pointerEvents: "none",
            transition: "opacity 0.2s",
            opacity: 1,
            zIndex: 2,
          }}
        >
          💥
        </span>
      ))}
      {/* Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            top: p.top,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: p.color,
            opacity: 0.8,
            zIndex: 1,
            pointerEvents: "none",
            boxShadow: `0 0 8px ${p.color}`,
            animation: "particle-move 0.6s linear forwards"
          }}
        />
      ))}
      <audio src={explosionSound} style={{ display: "none" }} />
      {/* Animatie styles */}
      <style>
        {`
          @keyframes shake {
            0% { transform: scale(1.2) translate(0px, 0px); }
            25% { transform: scale(1.2) translate(4px, -2px); }
            50% { transform: scale(1.2) translate(-4px, 2px); }
            75% { transform: scale(1.2) translate(2px, 4px); }
            100% { transform: scale(1.2) translate(0px, 0px); }
          }
          @keyframes flash-bg {
            0% { background: linear-gradient(90deg, #ffea00, #ff1744 70%); }
            100% { background: linear-gradient(90deg, #ff1744, #ffea00 70%); }
          }
          @keyframes particle-move {
            to {
              opacity: 0;
              transform: translateY(-60px) scale(0.5) rotate(60deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default App;