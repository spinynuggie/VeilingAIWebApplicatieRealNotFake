import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent,
    Table, TableBody, TableCell, TableHead, TableRow,
    Paper, Typography, Box, CircularProgress, Alert
} from "@mui/material";
import { authFetch } from '@/services/authService';

interface PriceEntry {
    datum: string;
    prijs: number;
}

interface GlobalPriceEntry {
    sellerName: string;
    datum: string;
    prijs: number;
}

interface HistoryData {
    sellerLast10: PriceEntry[];
    sellerAverage: number | null;
    globalLast10: GlobalPriceEntry[];
    globalAverage: number | null;
}

interface Props {
    open: boolean;
    onClose: () => void;
    productId: number;
    productName: string;
    sellerId: number;
    sellerName: string;
}

export const PriceHistoryModal: React.FC<Props> = ({
    open, onClose, productId, productName, sellerId, sellerName
}) => {
    const [data, setData] = useState<HistoryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open && productId) {
            setLoading(true);
            setError("");
            const url = `${process.env.NEXT_PUBLIC_BACKEND_LINK}/api/PrijsHistorie/${productId}?verkoperId=${sellerId}&productNaam=${encodeURIComponent(productName)}`;

            authFetch(url)
                .then(res => {
                    if (!res.ok) throw new Error("Kon historie niet ophalen");
                    return res.json();
                })
                .then(data => setData(data))
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [open, productId, sellerId, productName]);

    const formatCurrency = (val: number) => `€ ${val.toFixed(2)}`;
    const formatDate = (d: string) => new Date(d).toLocaleDateString("nl-NL", { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>
                <Typography variant="h6" fontWeight={700}>
                    Prijsanalyses: {productName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Huidige aanbieder: {sellerName}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {loading && <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}
                {error && <Alert severity="error">{error}</Alert>}

                {data && !loading && (
                    <Box display="flex" flexDirection="column" gap={4}>

                        {/* Section 1: History for THIS seller */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                Historische prijzen van deze aanbieder (laatste 10):
                            </Typography>
                            <Paper variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f9fafb' }}>
                                            <TableCell>Datum</TableCell>
                                            <TableCell>Prijs</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.sellerLast10.length > 0 ? data.sellerLast10.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{formatDate(row.datum)}</TableCell>
                                                <TableCell>{formatCurrency(row.prijs)} per stuk</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={2} align="center">Geen data beschikbaar</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Paper>
                            <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: '#f0fdf4', borderRadius: 1, color: '#166534' }}>
                                <strong>Gemiddelde prijs</strong> <em>alle</em> historische orders van {sellerName}: {data.sellerAverage ? formatCurrency(data.sellerAverage) : '-'} per stuk
                            </Typography>
                        </Box>

                        {/* Section 2: Global History */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                Historische prijzen van alle aanbieders (laatste 10):
                            </Typography>
                            <Paper variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f9fafb' }}>
                                            <TableCell>Aanbieder</TableCell>
                                            <TableCell>Datum</TableCell>
                                            <TableCell>Prijs</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.globalLast10.length > 0 ? data.globalLast10.map((row, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{row.sellerName}</TableCell>
                                                <TableCell>{formatDate(row.datum)}</TableCell>
                                                <TableCell>{formatCurrency(row.prijs)} per stuk</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={3} align="center">Geen data beschikbaar</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Paper>
                            <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: '#eff6ff', borderRadius: 1, color: '#1e40af' }}>
                                <strong>Gemiddelde prijs</strong> <em>alle</em> historische orders (alle aanbieders): {data.globalAverage ? formatCurrency(data.globalAverage) : '-'} per stuk
                            </Typography>
                        </Box>

                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};
