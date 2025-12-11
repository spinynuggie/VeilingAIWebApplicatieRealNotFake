import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField } from "@mui/material";

interface AuctionClockProps {
  startPrice: number;
  endPrice: number;
  duration: number;
  productName?: string;
  onBid?: (price: number, quantity: number) => void;
}

export const VeilingKlok: React.FC<AuctionClockProps> = ({
  startPrice,
  endPrice,
  duration,
  productName,
  onBid,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(duration);
  const [currentPrice, setCurrentPrice] = useState<number>(startPrice);
  const [quantity, setQuantity] = useState<string>('1');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [auctionEnded, setAuctionEnded] = useState<boolean>(false);
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [bidMessage, setBidMessage] = useState<string>('');
  const quantityRef = useRef<HTMLInputElement>(null);

  const progress = timeRemaining / duration;

  useEffect(() => {
    if (!isActive || auctionEnded || timeRemaining <= 0) {
      if (timeRemaining <= 0 && !auctionEnded) {
        setIsActive(false);
        setAuctionEnded(true);
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 0.1));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, auctionEnded]);

  useEffect(() => {
    const priceDrop = ((duration - timeRemaining) / duration) * (startPrice - endPrice);
    setCurrentPrice(Math.max(endPrice, startPrice - priceDrop));
  }, [timeRemaining, duration, startPrice, endPrice]);

  useEffect(() => {
    if (quantityRef.current && isActive && !auctionEnded) {
      quantityRef.current.focus();
      quantityRef.current.select();
    }
  }, [isActive, auctionEnded]);

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
    if (e.key === 'Enter' && isActive && !auctionEnded) {
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
    if (isActive && qty > 0) {
      setBidMessage('Geboden!');

      setIsActive(false);
      setAuctionEnded(true);
      setFinalPrice(currentPrice);
      
      if (onBid) {
        onBid(currentPrice, qty);
      }
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
            <circle cx={120} cy={120} r={114} fill="none" stroke={auctionEnded ? "#ef4444" : "#10b981"} strokeWidth={12} strokeLinecap="round" strokeDasharray={2 * Math.PI * 114} strokeDashoffset={2 * Math.PI * 114 * (1 - progress)} transform="rotate(-90 120 120)" style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>{auctionEnded ? 'Eindprijs' : 'Huidige prijs'}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>€ {(auctionEnded ? finalPrice || currentPrice : currentPrice).toFixed(2)}</div>
            {!auctionEnded && isActive && <div style={{ fontSize: '14px', color: '#ef4444', marginTop: '8px' }}>{Math.ceil(timeRemaining)}s</div>}
            {auctionEnded && <div style={{ fontSize: '14px', color: '#ef4444', marginTop: '8px' }}>Veiling gesloten</div>}
          </div>
        </div>
      </Box>

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
        sx={{ width: '180px', '& .MuiOutlinedInput-root': {
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
    } }} 
        disabled={auctionEnded}
      />

      <Button 
        variant="contained" 
        size="large"
        onClick={handleBid}
        disabled={!isActive || auctionEnded || parseInt(quantity || '0', 10) <= 0}
        sx={{ width: '180px', height: '44px', fontWeight: 600, backgroundColor: '#4a7c4a'}}
      >
        {auctionEnded ? 'Veiling gesloten' : `Bied € ${currentPrice.toFixed(2)}`}
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