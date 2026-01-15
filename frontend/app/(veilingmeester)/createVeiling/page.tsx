"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createVeiling } from "@/services/veilingService";
import Navbar from "@/features/(NavBar)/AppNavBar";
import RequireAuth from "@/components/(oud)/RequireAuth";
import { Typography, Alert, Snackbar, Grid, Stack, TextField, Box as BoxMui, CircularProgress } from "@mui/material";
import { Button } from "@/components/Buttons/Button";
import { Background } from "@/components/Background";
import { useAuth } from "@/components/AuthProvider";

interface VeilingData {
    naam: string;
    beschrijving: string;
    image: string;
    starttijd: string;
    eindtijd: string;
    veilingMeesterId: number | "";
}

export default function CreateVeilingPage() {
    const router = useRouter();
    const { user } = useAuth();

    // Default form state
    const [formData, setFormData] = useState<VeilingData>({
        naam: "",
        beschrijving: "",
        image: "",
        starttijd: "",
        eindtijd: "",
        veilingMeesterId: user ? user.gebruikerId : "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // --- HANDLERS ---
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        // Show immediate preview locally
        const localPreviewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, image: localPreviewUrl }));

        const uploadData = new FormData();
        uploadData.append("file", file);
        // Assuming we want to organize uploads in a 'veilings' folder or similar, 
        // copying logic from ProductForm but maybe we can use specific folder if backend supports it.
        // ProductForm uses `folder=products`. Let's use `folder=veilings` or similar if appropriate, 
        // or just rely on backend default if not specified. ProductForm uses: `${process.env.NEXT_PUBLIC_BACKEND_LINK}/api/Upload?folder=products`
        // Let's use `folder=veilings` for organization.

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/api/Upload?folder=veilings`, {
                method: "POST",
                body: uploadData,
            });

            if (!res.ok) {
                throw new Error("Upload mislukt");
            }

            const data = await res.json();

            // If backend returns absolute URL, use it directly. Otherwise, prepend backend link.
            const finalUrl = data.url.startsWith("http")
                ? data.url
                : `${process.env.NEXT_PUBLIC_BACKEND_LINK}${data.url}`;

            setFormData(prev => ({ ...prev, image: finalUrl }));

        } catch (err) {
            console.error("Upload error", err);
            setError("Kon afbeelding niet uploaden naar de server.");
        }
    };

    const validateForm = (): boolean => {
        if (!formData.naam.trim()) { setError("Naam is verplicht"); return false; }
        if (!formData.starttijd) { setError("Starttijd is verplicht"); return false; }
        if (!formData.eindtijd) { setError("Eindtijd is verplicht"); return false; }

        const start = new Date(formData.starttijd);
        const end = new Date(formData.eindtijd);

        if (end <= start) {
            setError("Eindtijd moet na starttijd liggen.");
            return false;
        }

        if (!formData.image) { setError("Afbeelding URL/Upload is verplicht"); return false; }

        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            await createVeiling({
                naam: formData.naam,
                beschrijving: formData.beschrijving,
                image: formData.image,
                starttijd: new Date(formData.starttijd).toISOString(),
                eindtijd: new Date(formData.eindtijd).toISOString(),
                veilingMeesterId: Number(formData.veilingMeesterId || user?.gebruikerId || 1),
            } as any);

            setSuccess("Veiling succesvol aangemaakt!");
            setTimeout(() => {
                router.push("/(veilingmeester)/veilingDashboard");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Er is iets misgegaan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const showAlert = (message: string, severity: "error" | "success") => (
        <Snackbar
            open={true}
            autoHideDuration={6000}
            onClose={() => severity === "error" ? setError(null) : setSuccess(null)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert onClose={() => severity === "error" ? setError(null) : setSuccess(null)} severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );

    return (
        <Background>
            <RequireAuth roles={["ADMIN", "VEILINGMEESTER"]}>
                <Navbar />

                <BoxMui
                    component="form"
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        gap: "60px",
                        padding: "60px 40px",
                        maxWidth: "1400px",
                        margin: "0 auto",
                    }}
                >
                    <Grid container spacing={4} sx={{ width: '100%' }}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: 'black' }}>
                                Nieuwe Veiling Aanmaken
                            </Typography>
                        </Grid>

                        {/* LINKER KOLOM */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={3}>
                                <TextField
                                    label="Naam Veiling"
                                    name="naam"
                                    value={formData.naam}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                />

                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                >
                                    Of Upload Afbeelding
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </Button>

                                <BoxMui sx={{ height: 250, width: '100%', border: '1px dashed grey', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 1, bgcolor: '#f9f9f9' }}>
                                    {formData.image ? <img src={formData.image} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} /> : "Preview"}
                                </BoxMui>

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
                            </Stack>
                        </Grid>

                        {/* RECHTER KOLOM */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={3} sx={{ height: '100%' }}>
                                <TextField
                                    label="Beschrijving"
                                    name="beschrijving"
                                    value={formData.beschrijving}
                                    onChange={handleChange}
                                    required
                                    multiline
                                    rows={10}
                                    fullWidth
                                />

                                <BoxMui sx={{ mt: 'auto', textAlign: 'center' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        disabled={isSubmitting}
                                        startIcon={isSubmitting && <CircularProgress size={20} />}
                                    >
                                        Veiling Aanmaken
                                    </Button>
                                </BoxMui>
                            </Stack>
                        </Grid>
                    </Grid>
                </BoxMui>

                {error && showAlert(error, "error")}
                {success && showAlert(success, "success")}
            </RequireAuth>
        </Background>
    );
}
