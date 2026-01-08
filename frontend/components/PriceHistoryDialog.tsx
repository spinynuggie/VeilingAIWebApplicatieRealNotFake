"use client";

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    CircularProgress,
    Divider,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// ... imports ...

interface PriceEntry {
    datum: string;
    prijs: number;
}

interface GlobalPriceEntry extends PriceEntry {
    sellerName: string;
}

interface PriceHistoryData {
    currentSellerName?: string;
    sellerLast10: PriceEntry[];
    sellerAverage: number | null;
    globalLast10: GlobalPriceEntry[];
    globalAverage: number | null;
}

interface PriceHistoryDialogProps {
    open: boolean;
    onClose: () => void;
    productId: number;
    verkoperId: number;
    productNaam: string;
}

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export const PriceHistoryDialog: React.FC<PriceHistoryDialogProps> = ({
    open,
    onClose,
    productId,
    verkoperId,
    productNaam
}) => {
    const [data, setData] = useState<PriceHistoryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && productId) {
            setLoading(true);
            setError(null);
            fetch(`${apiBase}/api/PrijsHistorie/${productId}?verkoperId=${verkoperId}&productNaam=${encodeURIComponent(productNaam)}`, {
                credentials: 'include',
                headers: {
                    'X-XSRF-TOKEN': document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Kon historie niet laden.');
                    return res.json();
                })
                .then(setData)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [open, productId, verkoperId, productNaam]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatPrice = (price: number) => {
        return `€ ${price.toFixed(2).replace('.', ',')} euro per per eenheid`;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
                <Typography variant="h6" fontWeight="bold">Prijsinformatie</Typography>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
                ) : error ? (
                    <Typography color="error" align="center" sx={{ p: 2 }}>{error}</Typography>
                ) : data ? (
                    <Box sx={{ fontFamily: 'Roboto, sans-serif', color: '#000' }}>

                        {/* Header Info */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body1"><strong>Bloemsoort:</strong> {productNaam}</Typography>
                            <Typography variant="body1"><strong>Aanvoerder:</strong> {data.currentSellerName || 'Laden...'}</Typography>
                        </Box>

                        {/* Section 1: Local History */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Historische prijzen van deze aanbieder (laatste 10):
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
                                Aanbieder: {data.currentSellerName || '...'}
                            </Typography>

                            <Table size="small" sx={{ '& td, & th': { border: 'none', px: 1, py: 0.5 } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', p: 0, width: '40%' }}>Datum:</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', p: 0 }}>Prijs:</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.sellerLast10.map((entry, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell sx={{ p: 0 }}>{formatDate(entry.datum)}</TableCell>
                                            <TableCell sx={{ p: 0 }}>{formatPrice(entry.prijs)}</TableCell>
                                        </TableRow>
                                    ))}
                                    {data.sellerLast10.length === 0 && (
                                        <TableRow><TableCell colSpan={2} sx={{ p: 0, fontStyle: 'italic' }}>Geen data</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Gemiddelde prijs <em>alle</em> historische orders van de {data.currentSellerName || 'aanbieder'}: {data.sellerAverage ? formatPrice(data.sellerAverage) : 'N/A'}
                            </Typography>
                        </Box>

                        {/* Section 2: Global History (conditionally rendered by backend data presence) */}
                        {data.globalLast10.length > 0 || data.globalAverage ? (
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Historische prijzen van alle aanbieders (laatste 10):
                                </Typography>

                                <Table size="small" sx={{ '& td, & th': { border: 'none', px: 1, py: 0.5 } }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', p: 0, width: '30%' }}>Aanbieder</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', p: 0, width: '30%' }}>Datum</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', p: 0 }}>Prijs</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.globalLast10.map((entry, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell sx={{ p: 0 }}>{entry.sellerName}</TableCell>
                                                <TableCell sx={{ p: 0 }}>{formatDate(entry.datum)}</TableCell>
                                                <TableCell sx={{ p: 0 }}>{formatPrice(entry.prijs)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Gemiddelde prijs <em>alle</em> historische orders: {data.globalAverage ? formatPrice(data.globalAverage) : 'N/A'}
                                </Typography>
                            </Box>
                        ) : null}
                    </Box>
                ) : (
                    <Typography>Geen gegevens.</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Sluiten</Button>
            </DialogActions>
        </Dialog>
    );
};
