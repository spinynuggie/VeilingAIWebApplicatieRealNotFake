import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Typography } from "@mui/material";
import { motion, AnimatePresence } from 'framer-motion';

interface AuctionClockProps {
  startPrice: number;
  endPrice: number;
  duration: number;
  productName?: string;
  isClosed?: boolean;
  closingPrice?: number;
  onBid?: (price: number, quantity: number) => void;
  livePrice?: number | null;
  status?: "pending" | "active" | "ended";
  countdownText?: string;
  remainingQuantity?: number;
}

export const VeilingKlok: React.FC<AuctionClockProps> = ({
  startPrice,
  endPrice,
  duration,
  productName,
  isClosed = false,
  closingPrice,
  onBid,
  livePrice,
  status = "active",
  countdownText,
  remainingQuantity,
}) => {
  const [localTimeRemaining, setLocalTimeRemaining] = useState<number>(duration);
  const [quantity, setQuantity] = useState<string>('1');
  const [isActive, setIsActive] = useState<boolean>(status === "active");
  const [auctionEnded, setAuctionEnded] = useState<boolean>(status === "ended");
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [bidMessage, setBidMessage] = useState<string>('');
  const quantityRef = useRef<HTMLInputElement>(null);

  // Sync internal state with status prop
  useEffect(() => {
    setIsActive(status === "active" && !isClosed);
    setAuctionEnded(status === "ended" || isClosed);
  }, [status, isClosed]);

  // Use livePrice if available, otherwise calculate from local timer
  const isLive = livePrice !== null && livePrice !== undefined;
  const currentPrice = isLive ? livePrice : startPrice - ((duration - localTimeRemaining) / duration) * (startPrice - endPrice);
  const timeRemaining = isLive
    ? Math.max(0, duration * (1 - ((startPrice - livePrice!) / (startPrice - endPrice || 1))))
    : localTimeRemaining;

  const progress = (status === "ended" || auctionEnded || isClosed) ? 1 : (status === "active" ? 1 - (timeRemaining / duration) : 0);

  useEffect(() => {
    // Skip local timer if not active or in live mode
    if (!isActive || isLive || auctionEnded) return;

    if (localTimeRemaining <= 0) {
      setIsActive(false);
      setAuctionEnded(true);
      return;
    }

    const interval = setInterval(() => {
      setLocalTimeRemaining((prev: number) => Math.max(0, prev - 0.1));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, localTimeRemaining, auctionEnded, isLive]);

  useEffect(() => {
    if (isClosed) {
      setIsActive(false);
      setAuctionEnded(true);
      setFinalPrice(closingPrice ?? currentPrice);
    }
  }, [isClosed, closingPrice, currentPrice]);

  useEffect(() => {
    if (quantityRef.current && isActive && !auctionEnded) {
      quantityRef.current.focus();
      quantityRef.current.select();
    }
  }, [isActive, auctionEnded]);

  const handleFocus = () => {
    if (quantity === '1') setQuantity('');
  };

  const handleBlur = () => {
    if (quantity === '') setQuantity('1');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      const num = parseInt(value || '0', 10);
      if (remainingQuantity !== undefined && num > remainingQuantity) {
        setQuantity(remainingQuantity.toString());
      } else {
        setQuantity(value);
      }
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
    if (allowedControlKeys.includes(e.key)) return;
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  };

  const handleBid = () => {
    const qty = parseInt(quantity || '0', 10);
    if (isActive && qty > 0) {
      setIsActive(false);
      setAuctionEnded(true);
      setFinalPrice(currentPrice);
      setBidMessage('Geboden!');
      if (onBid) onBid(currentPrice, qty);
    }
  };

  const getStatusColor = () => {
    if (status === "pending") return "#f59e0b"; // Amber
    if (auctionEnded) return "#ef4444"; // Red
    return "#10b981"; // Emerald
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        width: '400px',
        minHeight: '520px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Background Glow */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${getStatusColor()}22 0%, transparent 70%)`,
          zIndex: 0
        }} />

        {productName && (
          <Box sx={{ textAlign: 'center', zIndex: 1 }}>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', letterSpacing: '-0.02em' }}>
              {productName}
            </Typography>
            {remainingQuantity !== undefined && (
              <Typography sx={{ fontSize: '14px', color: '#6b7280', mt: 0.5 }}>
                Nog {remainingQuantity} beschikbaar
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', flex: 1, zIndex: 1 }}>
          <div style={{ position: 'relative', width: '260px', height: '260px' }}>
            <svg width={260} height={260} style={{ position: 'absolute', top: 0, left: 0 }}>
              <circle cx={130} cy={130} r={120} fill="none" stroke="#f3f4f6" strokeWidth={10} />
              <motion.circle
                cx={130}
                cy={130}
                r={120}
                fill="none"
                stroke={getStatusColor()}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress) }}
                transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                transform="rotate(-90 130 130)"
              />
            </svg>

            <AnimatePresence mode="wait">
              <motion.div
                key={status + (auctionEnded ? "-ended" : "")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                {status === "pending" ? (
                  <>
                    <Typography sx={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>Start over</Typography>
                    <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', mt: 0.5 }}>
                      {countdownText || "..."}
                    </Typography>
                  </>
                ) : auctionEnded ? (
                  <>
                    <Typography sx={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>Startprijs</Typography>
                    <Typography sx={{ fontSize: '32px', fontWeight: 800, color: '#1f2937', mt: 0.5 }}>
                      € {(finalPrice || currentPrice).toFixed(2)}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#ef4444', fontWeight: 600, mt: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Gesloten
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography sx={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>Huidige prijs</Typography>
                    <Typography sx={{ fontSize: '36px', fontWeight: 800, color: '#1f2937', mt: 0.5 }}>
                      € {currentPrice.toFixed(2)}
                    </Typography>
                    <Typography sx={{ fontSize: '18px', color: '#ef4444', fontWeight: 700, mt: 1, fontVariantNumeric: 'tabular-nums' }}>
                      {Math.ceil(timeRemaining)}s
                    </Typography>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Box>

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, zIndex: 1 }}>
          <TextField
            inputRef={quantityRef}
            label="Aantal"
            fullWidth
            value={quantity}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={status !== "active" || auctionEnded}
            sx={{
              maxWidth: '220px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                '& fieldset': {
                  borderColor: getStatusColor(),
                },
                '&:hover fieldset': {
                  borderColor: getStatusColor(),
                },
                '&.Mui-focused fieldset': {
                  borderColor: getStatusColor(),
                },
              },
              '& .MuiInputLabel-root': {
                color: getStatusColor(),
                '&.Mui-focused': {
                  color: getStatusColor(),
                }
              }
            }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleBid}
            disabled={status !== "active" || auctionEnded || parseInt(quantity || '0', 10) <= 0 || (remainingQuantity !== undefined && parseInt(quantity || '0', 10) > remainingQuantity)}
            sx={{
              maxWidth: '220px',
              height: '56px',
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '16px',
              textTransform: 'none',
              backgroundColor: getStatusColor(),
              boxShadow: `0 8px 20px ${getStatusColor()}44`,
              '&:hover': {
                backgroundColor: getStatusColor(),
                filter: 'brightness(0.95)',
                boxShadow: `0 12px 24px ${getStatusColor()}55`,
              },
              transition: 'all 0.2s',
              '&.Mui-disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
              }
            }}
          >
            {bidMessage || (status === "pending" ? "Wachten op start..." : auctionEnded ? "Veiling gesloten" : `Bied € ${currentPrice.toFixed(2)}`)}
          </Button>
        </Box>

        {/* Bid message now shown in button text */}
      </Box>
    </motion.div>
  );
};
