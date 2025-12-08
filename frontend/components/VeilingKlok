import React from 'react';

interface AuctionClockProps {
  price: string;
  progress?: number;
  size?: number;
  strokeWidth?: number;
}

export const AuctionClock: React.FC<AuctionClockProps> = ({
  price,
  progress = 0.7,
  size = 240,
  strokeWidth = 12, 
}) => {
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div style={{
      position: 'relative',
      width: `${size}px`,
      height: `${size}px`,
    }}>
      <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Huidige prijs</div>
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>{price}</div>
      </div>
    </div>
  );
};