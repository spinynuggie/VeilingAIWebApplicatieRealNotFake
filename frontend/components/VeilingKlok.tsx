import React, { useState } from 'react';
import { Box, Button, TextField, Typography, IconButton } from "@mui/material";
import { motion, AnimatePresence } from 'framer-motion';
import InfoIcon from '@mui/icons-material/Info';
import { PriceHistoryDialog } from './PriceHistoryDialog';

interface AuctionClockProps {
    startPrice: number;
    endPrice: number;
    duration: number;
    productName?: string;
    // New Props for History
    productId?: number;
    verkoperId?: number;

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
    productId,
    verkoperId,
    isClosed = false,
    closingPrice,
    onBid,
    livePrice,
    status = "active",
    countdownText,
    remainingQuantity,
}) => {
    const [quantity, setQuantity] = useState<string>('1');
    const [historyOpen, setHistoryOpen] = useState(false);

    // Derive simple states
    const isPending = status === "pending";
    const isEnded = status === "ended" || isClosed;
    const currentPrice = livePrice ?? endPrice;

    // Progress calculation for the circle (0 to 1)
    const progress = isEnded ? 1 : isPending ? 0 : 1 - ((currentPrice - endPrice) / (startPrice - endPrice || 1));

    const handleBid = () => {
        const qty = parseInt(quantity, 10);
        if (!isEnded && !isPending && qty > 0 && onBid) {
            onBid(currentPrice, qty);
        }
    };

    const statusColor = isPending ? "#6b7280" : isEnded ? "#ef4444" : "#10b981";

    return (
        <Box sx={{
            background: 'white',
            borderRadius: '24px',
            p: 4,
            boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            width: '380px',
            border: '1px solid #f0f0f0'
        }}>
            {productName && (
                <Box textAlign="center">
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <Typography variant="h6" fontWeight={700}>{productName}</Typography>
                        <IconButton size="small" onClick={() => setHistoryOpen(true)}>
                            <InfoIcon fontSize="small" color="primary" />
                        </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {remainingQuantity !== undefined ? `Nog ${remainingQuantity} beschikbaar` : 'Voorraad onbekend'}
                    </Typography>
                </Box>
            )}

            {/* Price History Dialog */}
            {productName && productId && verkoperId && (
                <PriceHistoryDialog
                    open={historyOpen}
                    onClose={() => setHistoryOpen(false)}
                    productId={productId}
                    verkoperId={verkoperId}
                    productNaam={productName}
                />
            )}

            {/* The Clock Face */}
            <Box sx={{ position: 'relative', width: 240, height: 240 }}>
                <svg width={240} height={240}>
                    <circle cx={120} cy={120} r={110} fill="none" stroke="#f3f4f6" strokeWidth={8} />
                    <motion.circle
                        cx={120} cy={120} r={110} fill="none" stroke={statusColor} strokeWidth={8}
                        strokeDasharray={2 * Math.PI * 110}
                        animate={{ strokeDashoffset: 2 * Math.PI * 110 * (1 - progress) }}
                        transition={{ type: "tween", duration: 0.3 }}
                        transform="rotate(-90 120 120)"
                    />
                </svg>

                <Box sx={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'center', textAlign: 'center'
                }}>
                    {isPending ? (
                        <Typography variant="h4" fontWeight={800} sx={{ color: '#6b7280' }}>{countdownText || "..."}</Typography>
                    ) : isEnded ? (
                        <>
                            <Typography variant="caption" color="text.secondary">Prijs bij sluiting</Typography>
                            <Typography variant="h4" fontWeight={800}>€ {(closingPrice ?? currentPrice).toFixed(2)}</Typography>
                            <Typography variant="overline" color="error" fontWeight={700}>Gesloten</Typography>
                        </>
                    ) : (
                        <>
                            <Typography variant="caption" color="text.secondary">Huidige prijs</Typography>
                            <Typography variant="h3" fontWeight={800}>€ {currentPrice.toFixed(2)}</Typography>
                        </>
                    )}
                </Box>
            </Box>

            {/* Interaction Area */}
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    label="Aantal"
                    type="number"
                    autoFocus
                    value={quantity}
                    onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value || '1', 10));
                        setQuantity((remainingQuantity !== undefined ? Math.min(val, remainingQuantity) : val).toString());
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleBid();
                        }
                    }}
                    disabled={isEnded || isPending}
                    fullWidth
                />
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleBid}
                    disabled={isEnded || isPending || !quantity || parseInt(quantity, 10) <= 0}
                    sx={{
                        py: 2, borderRadius: '12px', fontWeight: 700,
                        backgroundColor: statusColor,
                        '&:hover': { backgroundColor: statusColor, filter: 'brightness(0.9)' }
                    }}
                >
                    {isPending ? "Wachten..." : isEnded ? "Veiling gesloten" : `Bied € ${currentPrice.toFixed(2)}`}
                </Button>
            </Box>
        </Box>
    );
};
