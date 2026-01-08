"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    CircularProgress,
    Alert
} from "@mui/material";
import Navbar from "@/features/(NavBar)/AppNavBar";
import RequireAuth from "@/components/(oud)/RequireAuth";
import { authFetch } from "@/services/authService";

interface Sale {
    productId: number;
    productNaam: string;
    verkoopprijs: number;
    aantal: number;
    datum: string;
    koperNaam: string;
}

export default function SalesDashboard() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSales = async () => {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/api/Verkoper/me/sales`);
            if (!res.ok) throw new Error("Kon verkoopgegevens niet ophalen.");
            const data = await res.json();
            setSales(data);
        } catch (err: any) {
            setError(err.message || "Er is een fout opgetreden.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const totalRevenue = sales.reduce((acc, curr) => acc + (curr.verkoopprijs * curr.aantal), 0);

    return (
        <RequireAuth>
            <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
                <Navbar />
                <Container maxWidth="lg" sx={{ py: 6 }}>

                    <Box mb={4}>
                        <Typography variant="h4" fontWeight={800} gutterBottom>
                            Mijn Verkoopdashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Overzicht van uw verkochte producten.
                        </Typography>
                    </Box>

                    {/* Key Metrics */}
                    <Paper sx={{ p: 3, mb: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                                Totaal Omzet
                            </Typography>
                            <Typography variant="h3" fontWeight={800} color="primary.main">
                                € {totalRevenue.toFixed(2)}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                                Aantal Verkopen
                            </Typography>
                            <Typography variant="h4" fontWeight={800}>
                                {sales.length}
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Sales Table */}
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
                    ) : error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : (
                        <Paper variant="outlined">
                            <Table>
                                <TableHead sx={{ bgcolor: '#f3f4f6' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Datum</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Koper</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Aantal</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Prijs per stuk</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Totaal</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sales.length > 0 ? sales.map((sale, i) => (
                                        <TableRow key={i} hover>
                                            <TableCell>
                                                {new Date(sale.datum).toLocaleDateString("nl-NL", {
                                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </TableCell>
                                            <TableCell>{sale.productNaam}</TableCell>
                                            <TableCell>{sale.koperNaam}</TableCell>
                                            <TableCell align="right">{sale.aantal}</TableCell>
                                            <TableCell align="right">€ {sale.verkoopprijs.toFixed(2)}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                € {(sale.verkoopprijs * sale.aantal).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                                <Typography color="text.secondary">Nog geen verkopen.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Paper>
                    )}

                </Container>
            </div>
        </RequireAuth>
    );
}
