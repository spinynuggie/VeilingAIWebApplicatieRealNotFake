import React, { useState, useEffect } from "react";
import { Box as BoxMui, Typography, Alert, Grid } from "@mui/material";
import { Box } from "@/components/Box";
import { Button } from "@/components/Buttons/Button";
import { TextField } from "@/components/TextField";
import { User } from "@/types/user";
import * as gebruikerService from "@/services/gebruikerService";
import { handleResponse } from "@/services/authService"; // Ensure this is exported or replicate logic

interface PersonalDataFormProps {
    user: User | null;
    refreshUser: () => Promise<void>;
}

type ProfileForm = {
    naam: string;
    emailadres: string;
    woonplaats: string;
    straat: string;
    postcode: string;
    huisnummer: string;
};

export default function PersonalDataForm({ user, refreshUser }: PersonalDataFormProps) {
    const [formValues, setFormValues] = useState<ProfileForm>({
        naam: "",
        emailadres: "",
        woonplaats: "",
        straat: "",
        postcode: "",
        huisnummer: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            setFormValues({
                naam: user.naam ?? "",
                emailadres: user.emailadres ?? "",
                woonplaats: user.woonplaats ?? "",
                straat: user.straat ?? "",
                postcode: user.postcode ?? "",
                huisnummer: user.huisnummer ?? "",
            });
        }
    }, [user]);

    const handleChange = (field: keyof ProfileForm, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }));
        // Clear specific field error on change
        if (fieldErrors[field]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSave = async () => {
        // 1. Client-side Validation (Basic)
        const newErrors: Record<string, string> = {};
        if (!formValues.naam.trim()) newErrors.naam = "Naam is verplicht";
        if (!formValues.emailadres.trim()) newErrors.emailadres = "Email is verplicht";

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            setError("Corrigeer de gemarkeerde velden.");
            return;
        }

        setSaving(true);
        setFieldErrors({});
        setFeedback(null);
        setError(null);

        try {
            await gebruikerService.updateGebruikerFields(formValues, user);
            await refreshUser();
            setFeedback("Persoonlijke gegevens opgeslagen.");
            setIsEditing(false);
        } catch (err: any) {
            // 2. Error Parsing Logic (similar to handleResponse)
            // If the error message is a JSON string (from backend validation), parse it.
            let displayError = "Opslaan mislukt.";
            try {
                const parsed = JSON.parse(err.message);
                // ASP.NET Core ProblemDetails format
                if (parsed.errors) {
                    const backendErrors: Record<string, string> = {};
                    // Map backend errors (e.g. "Postcode": ["Invalid"]) to fieldErrors
                    Object.keys(parsed.errors).forEach((key) => {
                        // Normalize key (backend might use "Postcode", frontend uses "postcode")
                        const lowerKey = key.toLowerCase();
                        backendErrors[lowerKey] = parsed.errors[key][0]; // Take first error
                    });
                    setFieldErrors(backendErrors);
                    displayError = "Er zijn validatiefouten opgetreden.";
                } else if (parsed.title) {
                    displayError = parsed.title;
                }
            } catch (e) {
                // Not JSON, just use the message text
                displayError = err.message || "Opslaan mislukt.";
            }
            setError(displayError);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ width: "100%", mb: 5 }}>
            <BoxMui sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, width: "100%" }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Persoonlijke Informatie</Typography>
                {!isEditing ? (
                    <Button variant="contained" onClick={() => setIsEditing(true)}>Gegevens Bewerken</Button>
                ) : (
                    <BoxMui sx={{ display: "flex", gap: 1 }}>
                        <Button variant="text" onClick={() => setIsEditing(false)}>Annuleren</Button>
                        <Button variant="contained" onClick={handleSave} disabled={saving}>
                            {saving ? "Laden..." : "Opslaan"}
                        </Button>
                    </BoxMui>
                )}
            </BoxMui>

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Naam"
                        value={formValues.naam}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("naam", e.target.value)}
                        error={!!fieldErrors.naam}
                        helperText={fieldErrors.naam}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="E-mail"
                        value={formValues.emailadres}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("emailadres", e.target.value)}
                        error={!!fieldErrors.emailadres}
                        helperText={fieldErrors.emailadres}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        label="Woonplaats"
                        value={formValues.woonplaats}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("woonplaats", e.target.value)}
                        error={!!fieldErrors.woonplaats}
                        helperText={fieldErrors.woonplaats}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        label="Straat"
                        value={formValues.straat}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("straat", e.target.value)}
                        error={!!fieldErrors.straat}
                        helperText={fieldErrors.straat}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                        label="Postcode"
                        value={formValues.postcode}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("postcode", e.target.value)}
                        error={!!fieldErrors.postcode}
                        helperText={fieldErrors.postcode}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                        label="Huisnr"
                        value={formValues.huisnummer}
                        disabled={!isEditing}
                        onChange={(e) => handleChange("huisnummer", e.target.value)}
                        error={!!fieldErrors.huisnummer}
                        helperText={fieldErrors.huisnummer}
                    />
                </Grid>
            </Grid>

            {feedback && <Alert severity="success" sx={{ mt: 2, borderRadius: "10px" }}>{feedback}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>{error}</Alert>}
        </Box>
    );
}
