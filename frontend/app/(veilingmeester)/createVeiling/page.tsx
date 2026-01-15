"use client";

import { useState } from "react";
import VeilingForm, { VeilingData } from "@/app/(veilingmeester)/createVeiling/VeilingForm/index";
import RequireAuth from "@/components/(oud)/RequireAuth";
import AppNavbar from "@/features/(NavBar)/AppNavBar";
import { Box as BoxMui, Typography, Card, CardMedia, CardContent, Stack, Divider } from "@mui/material";
import { Background } from "@/components/Background";
import { useAuth } from "@/components/AuthProvider";

export default function CreateVeilingPage() {
    const { user } = useAuth();

    // HIER IS DE SINGLE SOURCE OF TRUTH
    const [formData, setFormData] = useState<VeilingData>({
        naam: "",
        beschrijving: "",
        image: "",
        starttijd: "",
        eindtijd: "",
        locatieId: "",
        veilingMeesterId: user ? user.gebruikerId : "",
    });

    return (
        <Background>
            <RequireAuth roles={["ADMIN", "VEILINGMEESTER"]}>
                <AppNavbar />

                <BoxMui
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        gap: "60px",
                        padding: "60px 40px",
                        maxWidth: "1400px",
                        margin: "0 auto",
                        flexWrap: { xs: "wrap", lg: "nowrap" },
                    }}
                >
                    {/* LINKER KANT: Het Formulier */}
                    <BoxMui sx={{ flexGrow: 1, minWidth: { xs: "100%", md: "600px" } }}>
                        <VeilingForm formData={formData} setFormData={setFormData} />
                    </BoxMui>

                    {/* RECHTER KANT: De Voorvertoning */}
                    <BoxMui sx={{ flex: "0 0 auto", width: { xs: "100%", md: "400px" }, position: { lg: "sticky" }, top: "100px" }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Voorvertoning</Typography>

                        <Card sx={{ borderRadius: 2, boxShadow: 3, overflow: 'hidden' }}>
                            <BoxMui sx={{ position: 'relative', height: 250, bgcolor: '#f0f0f0' }}>
                                {formData.image ? (
                                    <CardMedia
                                        component="img"
                                        image={formData.image}
                                        alt="Preview"
                                        sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <BoxMui sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography color="text.secondary">Geen afbeelding</Typography>
                                    </BoxMui>
                                )}
                            </BoxMui>

                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                                    {formData.naam || "Veiling Naam"}
                                </Typography>

                                <Typography variant="body2" color="text.secondary" sx={{
                                    mb: 2,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    minHeight: '4.5em'
                                }}>
                                    {formData.beschrijving || "Hier komt de beschrijving van de veiling..."}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Stack spacing={1}>
                                    <BoxMui sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Start:</Typography>
                                        <Typography variant="caption">{formData.starttijd ? new Date(formData.starttijd).toLocaleString() : "-"}</Typography>
                                    </BoxMui>
                                    <BoxMui sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Einde:</Typography>
                                        <Typography variant="caption">{formData.eindtijd ? new Date(formData.eindtijd).toLocaleString() : "-"}</Typography>
                                    </BoxMui>
                                </Stack>
                            </CardContent>
                        </Card>

                        <BoxMui sx={{ mt: 3, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 2, border: '1px solid rgba(25, 118, 210, 0.2)' }}>
                            <Typography variant="body2" color="primary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                                Dit is hoe de veilingkaart eruit zal zien voor gebruikers.
                            </Typography>
                        </BoxMui>
                    </BoxMui>
                </BoxMui>
            </RequireAuth>
        </Background>
    );
}
