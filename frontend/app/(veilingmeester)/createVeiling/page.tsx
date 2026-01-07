"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createVeiling } from "@/services/veilingService";
import Navbar from "@/features/(NavBar)/AppNavBar";
import RequireAuth from "@/components/(oud)/RequireAuth";
import { Box, Button, TextField, Typography, Paper, Alert } from "@mui/material";

export default function CreateVeilingPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        naam: "",
        beschrijving: "",
        image: "",
        starttijd: "",
        eindtijd: "",
        veilingMeesterId: 1, // Default to 1 (Admin)
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        try {
            // Validate dates
            if (new Date(formData.eindtijd) <= new Date(formData.starttijd)) {
                setError("Eindtijd moet na starttijd liggen.");
                return;
            }

            await createVeiling({
                naam: formData.naam,
                beschrijving: formData.beschrijving,
                image: formData.image,
                starttijd: new Date(formData.starttijd).toISOString(),
                eindtijd: new Date(formData.eindtijd).toISOString(),
                veilingMeesterId: Number(formData.veilingMeesterId), // Ensure it's a number
            } as any);

            setSuccess(true);
            setTimeout(() => {
                router.push("/(veilingmeester)/veilingDashboard");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Er is iets misgegaan.");
        }
    };

    return (
        <RequireAuth roles={["ADMIN", "VEILINGMEESTER"]}>
            <div style={{ background: "white", minHeight: "100vh" }}>
                <Navbar />
                <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
                    <Paper sx={{ p: 4 }}>
                        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                            Nieuwe Veiling Aanmaken
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 3 }}>Veiling succesvol aangemaakt! Doorverwijzen...</Alert>}

                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                <TextField
                                    label="Naam"
                                    name="naam"
                                    value={formData.naam}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />

                                <TextField
                                    label="Beschrijving"
                                    name="beschrijving"
                                    value={formData.beschrijving}
                                    onChange={handleChange}
                                    required
                                    multiline
                                    rows={3}
                                    fullWidth
                                />

                                <TextField
                                    label="Starttijd"
                                    name="starttijd"
                                    type="datetime-local"
                                    value={formData.starttijd}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />

                                <TextField
                                    label="Eindtijd"
                                    name="eindtijd"
                                    type="datetime-local"
                                    value={formData.eindtijd}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />

                                <TextField
                                    label="Afbeelding URL (Optioneel)"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    fullWidth
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    sx={{ mt: 2, backgroundColor: '#4a7c4a' }}
                                >
                                    Aanmaken
                                </Button>
                            </Box>
                        </form>
                    </Paper>
                </Box>
            </div>
        </RequireAuth>
    );
}
