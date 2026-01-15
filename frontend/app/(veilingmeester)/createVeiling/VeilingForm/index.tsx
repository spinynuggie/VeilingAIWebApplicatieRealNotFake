import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createVeiling } from "@/services/veilingService";
import { Alert, Snackbar, CircularProgress, TextField, Stack, Grid, Typography, Box as BoxMui } from "@mui/material";
import { Button } from "@/components/Buttons/Button";
import { Box } from "@/components/Box";
import { getLocaties, Locatie } from "@/services/locatieService";
import { Veiling } from "@/types/veiling";

// --- TYPES ---
export interface VeilingData {
    naam: string;
    beschrijving: string;
    image: string;
    starttijd: string;
    eindtijd: string;
    locatieId: number | "";
    veilingMeesterId: number | "";
}

interface VeilingFormProps {
    formData: VeilingData;
    setFormData: React.Dispatch<React.SetStateAction<VeilingData>>;
}

export default function VeilingForm({ formData, setFormData }: VeilingFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { user } = useAuth();
    const [locations, setLocations] = useState<Locatie[]>([]);

    useEffect(() => {
        getLocaties().then((data) => {
            setLocations(data);
            if (data.length > 0 && (formData.locatieId === "" || formData.locatieId === undefined)) {
                setFormData(prev => ({ ...prev, locatieId: data[0].locatieId || "" }));
            }
        }).catch(console.error);
    }, []);

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

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_LINK}/api/Upload?folder=veilings`, {
                method: "POST",
                body: uploadData,
            });

            if (!res.ok) {
                throw new Error("Upload mislukt");
            }

            const data = await res.json();

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

        if (!formData.image) { setError("Afbeelding is verplicht"); return false; }
        if (formData.locatieId === "") { setError("Locatie is verplicht"); return false; }

        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validateForm()) return;
        if (!user) {
            setError("Je moet ingelogd zijn.");
            return;
        }

        try {
            setIsSubmitting(true);

            const veilingPayload: Omit<Veiling, 'veilingId'> = {
                naam: formData.naam,
                beschrijving: formData.beschrijving || "Geen beschrijving",
                image: formData.image,
                starttijd: new Date(formData.starttijd).toISOString(),
                eindtijd: new Date(formData.eindtijd).toISOString(),
                locatieId: Number(formData.locatieId),
                veilingMeesterId: Number(formData.veilingMeesterId || user.gebruikerId),
            };

            await createVeiling(veilingPayload);

            setSuccess("Veiling succesvol aangemaakt!");

            // Reset the form state
            setFormData({
                naam: "",
                beschrijving: "",
                image: "",
                starttijd: "",
                eindtijd: "",
                locatieId: locations.length > 0 ? (locations[0].locatieId || "") : "",
                veilingMeesterId: user.gebruikerId,
            });

        } catch (err: any) {
            console.error("Submit error:", err);
            setError(err.message || "Er is iets misgegaan");
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
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Nieuwe Veiling</Typography>

            <Grid container spacing={4}>
                {/* LINKER KOLOM */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={3}>
                        <TextField
                            label="Naam Veiling"
                            fullWidth
                            name="naam"
                            value={formData.naam}
                            onChange={handleChange}
                            required
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

                        <TextField
                            select
                            label="Locatie"
                            name="locatieId"
                            value={formData.locatieId}
                            onChange={handleChange}
                            required
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            slotProps={{
                                select: {
                                    native: true,
                                },
                            }}
                        >
                            {locations.map((loc) => (
                                <option key={loc.locatieId} value={loc.locatieId}>
                                    {loc.locatieNaam}
                                </option>
                            ))}
                        </TextField>
                    </Stack>
                </Grid>

                {/* RECHTER KOLOM */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={3} sx={{ height: '100%' }}>
                        <TextField
                            label="Beschrijving"
                            multiline
                            rows={12}
                            name="beschrijving"
                            value={formData.beschrijving}
                            onChange={handleChange}
                            required
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
            {error && showAlert(error, "error")}
            {success && showAlert(success, "success")}
        </Box>
    );
}
