import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, TextField } from "@mui/material";

interface AuctionClockProps {
  productName?: string;
  currentPrice: number;
  lastBidPrice?: number | null;
  status: string;
  serverTime?: string;
  startTime?: string;
  endTime?: string;
  remainingQuantity?: number;
  onBid?: (price: number, quantity: number) => void;
}

export const VeilingKlok: React.FC<AuctionClockProps> = ({
  productName,
  currentPrice,
  lastBidPrice,
  status,
  serverTime,
  startTime,
  endTime,
  remainingQuantity,
  onBid,
}) => {
  const [quantity, setQuantity] = useState<string>('1');
  const [bidMessage, setBidMessage] = useState<string>('');
  const quantityRef = useRef<HTMLInputElement>(null);

  const isLive = status === "live";
  const isClosed = status === "ended" || status === "sold_out";
  const isNotStarted = status === "not_started";
  const isNoProduct = status === "no_active_product";

  const displayPrice = isClosed && lastBidPrice ? lastBidPrice : currentPrice;

  const timeInfo = useMemo(() => {
    if (!serverTime || !startTime || !endTime) return null;

    const serverMs = new Date(serverTime).getTime();
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    if (Number.isNaN(serverMs) || Number.isNaN(startMs) || Number.isNaN(endMs)) {
      return null;
    }

    if (isNotStarted) {
      const remainingMs = Math.max(0, startMs - serverMs);
      return {
        label: "Start in",
        seconds: Math.ceil(remainingMs / 1000),
        progress: 1,
      };
    }

    if (isLive) {
      const totalMs = Math.max(1, endMs - startMs);
      const remainingMs = Math.max(0, endMs - serverMs);
      return {
        label: "Resterend",
        seconds: Math.ceil(remainingMs / 1000),
        progress: Math.max(0, Math.min(1, remainingMs / totalMs)),
      };
    }

    return {
      label: "",
      seconds: null,
      progress: isClosed ? 0 : 1,
    };
  }, [serverTime, startTime, endTime, isLive, isNotStarted, isClosed]);

  useEffect(() => {
    if (quantityRef.current && isLive) {
      quantityRef.current.focus();
      quantityRef.current.select();
    }
  }, [isLive]);

  useEffect(() => {
    if (!bidMessage) return;
    const timeout = setTimeout(() => setBidMessage(''), 2000);
    return () => clearTimeout(timeout);
  }, [bidMessage]);

  const handleFocus = () => {
    if (quantity === '1') {
      setQuantity('');
    }
  };

  const handleBlur = () => {
    if (quantity === '') {
      setQuantity('1');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isLive) {
      e.preventDefault();
      handleBid();
      return;
    }

    const blockedKeys = ['e', 'E', '.', '-', '+', ','];
    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      return;
    }

    const allowedControlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedControlKeys.includes(e.key)) {
      return;
    }

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleBid = () => {
    const qty = parseInt(quantity || '0', 10);
    if (!isLive || qty <= 0) return;

    setBidMessage('Bod verzonden');
    if (onBid) {
      onBid(currentPrice, qty);
    }
  };

  return (
    <Box sx={{
      backgroundColor: '#f0ffe8',
      borderRadius: '20px',
      padding: '32px',
      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      width: '400px',
      minHeight: '500px',
    }}>
      {productName && (
        <Box sx={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>{productName}</div>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', flex: 1 }}>
        <div style={{ position: 'relative', width: '240px', height: '240px' }}>
          <svg width={240} height={240} style={{ position: 'absolute', top: 0, left: 0 }}>
            <circle cx={120} cy={120} r={114} fill="none" stroke="#e5e7eb" strokeWidth={12} />
            <circle
              cx={120}
              cy={120}
              r={114}
              fill="none"
              stroke={isClosed ? "#ef4444" : "#10b981"}
              strokeWidth={12}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 114}
              strokeDashoffset={2 * Math.PI * 114 * (1 - (timeInfo?.progress ?? 0))}
              transform="rotate(-90 120 120)"
              style={{ transition: 'stroke-dashoffset 0.2s linear' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>{isClosed ? 'Eindprijs' : 'Huidige prijs'}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>€ {displayPrice.toFixed(2)}</div>
            {timeInfo?.seconds !== null && !isClosed && !isNoProduct && (
              <div style={{ fontSize: '14px', color: '#ef4444', marginTop: '8px' }}>{timeInfo.label} {timeInfo.seconds}s</div>
            )}
            {isClosed && <div style={{ fontSize: '14px', color: '#ef4444', marginTop: '8px' }}>Veiling gesloten</div>}
            {isNoProduct && <div style={{ fontSize: '14px', color: '#ef4444', marginTop: '8px' }}>Geen actief product</div>}
          </div>
        </div>
      </Box>

      {remainingQuantity !== undefined && (
        <div style={{ fontSize: '14px', color: '#374151' }}>Resterende voorraad: {remainingQuantity}</div>
      )}

      <TextField
        inputRef={quantityRef}
        label="Aantal"
        type="text"
        inputMode="numeric"
        value={quantity}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        sx={{
          width: '180px',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#4a7c4a',
            },
            '&:hover fieldset': {
              borderColor: '#3d6b3d',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4a7c4a',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#4a7c4a',
            '&.Mui-focused': {
              color: '#4a7c4a',
            }
          }
        }}
        disabled={!isLive}
      />

      <Button
        variant="contained"
        size="large"
        onClick={handleBid}
        disabled={!isLive || parseInt(quantity || '0', 10) <= 0}
        sx={{ width: '180px', height: '44px', fontWeight: 600, backgroundColor: '#4a7c4a'}}
      >
        {isClosed ? 'Veiling gesloten' : isLive ? `Bied € ${currentPrice.toFixed(2)}` : 'Wachten op start'}
      </Button>

      {bidMessage && (
        <Box sx={{
          mt: 2,
          p: 2,
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '2px solid #4a7c4a',
          width: '100%',
          textAlign: 'center'
        }}>
          <span style={{ color: '#4a7c4a', fontWeight: 700, fontSize: '18px' }}>
            {bidMessage}
          </span>
        </Box>
      )}
    </Box>
  );
};
