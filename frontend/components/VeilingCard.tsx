"use client";

import React from 'react';
import { Veiling } from '@/types/veiling';
import {
    Box,
    Typography,
    Card,
    CardActionArea,
    CardMedia,
    CardContent,
} from '@mui/material';

interface VeilingCardProps {
    veiling: Veiling;
    onClick?: (veiling: Veiling) => void;
    // Optional: override styling or behavior for specific modes like 'preview'
    isPreview?: boolean;
}

export default function VeilingCard({ veiling, onClick, isPreview = false }: VeilingCardProps) {
    const now = new Date().getTime();
    const start = veiling.starttijd ? new Date(veiling.starttijd).getTime() : now; // Default to now for preview
    const end = veiling.eindtijd ? new Date(veiling.eindtijd).getTime() : Infinity;

    let status: "pending" | "active" | "ended" = "pending";
    let progress = 0;

    if (end !== Infinity && now >= end) {
        status = "ended";
        progress = 100;
    } else if (now >= start) {
        status = "active";
        const total = end === Infinity ? 0 : end - start;
        const elapsed = now - start;
        progress = total > 0 ? (elapsed / total) * 100 : 0;
    } else {
        status = "pending";
        progress = 0;
    }

    const statusColor = status === "active" ? "#10b981" : status === "pending" ? "#f59e0b" : "#ef4444";

    // Handle preview images (Blob/Object URLs) vs string URLs
    const imageUrl = veiling.image || '/placeholder-auction.jpg';

    return (
        <Card
            sx={{
                width: 300,        // Fixed width for consistency
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                    transform: !isPreview ? "scale(1.02)" : "none",
                },
            }}
        >
            <CardActionArea
                onClick={() => onClick && onClick(veiling)}
                disabled={!onClick}
                sx={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', flex: 1 }}
            >
                {/* Linkerkant: Afbeelding */}
                <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={veiling.naam || "Veiling"}
                    sx={{ width: "50%", height: "100%", objectFit: "cover" }}
                />

                {/* Rechterkant: Content */}
                <CardContent
                    sx={{
                        width: "50%",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        p: 2
                    }}
                >
                    <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            lineHeight: 1.2,
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {veiling.naam || "Naam Veiling"}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: "0.85rem"
                        }}
                    >
                        {veiling.beschrijving || "Geen beschrijving"}
                    </Typography>
                </CardContent>
            </CardActionArea>

            {/* Minimal Status Bar */}
            <Box sx={{ height: 4, width: '100%', bgcolor: '#e0e0e0', position: 'absolute', bottom: 0, left: 0 }}>
                <Box sx={{
                    height: '100%',
                    width: `${progress}%`,
                    bgcolor: statusColor,
                    transition: 'width 1s linear'
                }} />
            </Box>
        </Card>
    );
}
