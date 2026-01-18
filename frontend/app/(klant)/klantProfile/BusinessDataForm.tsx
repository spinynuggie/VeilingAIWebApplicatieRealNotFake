import React, { useState, useEffect } from "react";
import { Box as BoxMui, Typography, Alert, Grid, Divider } from "@mui/material";
import { Box } from "@/components/Box";
import { Button } from "@/components/Buttons/Button";
import { TextField } from "@/components/TextField";
import { User } from "@/types/user";
import * as verkoperService from "@/services/verkoperService";
import * as gebruikerService from "@/services/gebruikerService";

interface BusinessDataFormProps {
    user: User | null;
    refreshUser: () => Promise<void>;
    isVerkoper: boolean;
}

type BusinessForm = {
    bedrijfsnaam: string;
    kvkNummer: string;
    woonplaats: string;
    straat: string;
    postcode: string;
    huisnummer: string;
};

export default function BusinessDataForm({ user, refreshUser, isVerkoper }: BusinessDataFormProps) {
    const [businessValues, setBusinessValues] = useState<BusinessForm>({
        bedrijfsnaam: "",
        kvkNummer: "",
        woonplaats: "",
        straat: "",
        postcode: "",
        huisnummer: "",
    });

    // If not verkoper, fields are disabled until they click "Word Verkoper" (which enables editing mode)
    // If is verkoper, they can click "Update Bedrijf" to edit.
    // Actually, requested flow: "visible but greyed out".
    // So we default isEditing to false.
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [verkoperId, setVerkoperId] = useState<number | null>(null);

    useEffect(() => {
        const loadVerkoper = async () => {
            // We load inputs even if not verkoper if we can find them, but usually they won't exist.
            if (!user || user.role !== "VERKOPER") {
                setVerkoperId(null);
                return;
            }
            try {
                const verkoper = await verkoperService.getMyVerkoper();
                if (verkoper) {
                    setVerkoperId(verkoper.verkoperId);
                    setBusinessValues({
                        bedrijfsnaam: verkoper.bedrijfsnaam ?? "",
                        kvkNummer: verkoper.kvkNummer ?? "",
                        woonplaats: verkoper.woonplaats ?? "",
                        straat: verkoper.straat ?? "",
                        postcode: verkoper.postcode ?? "",
                        huisnummer: verkoper.huisnummer ?? "",
                    });
                }
            } catch (err: any) {
                console.error("Kon verkopergegevens niet ophalen", err);
            }
        };
        loadVerkoper();
    }, [user]);

    const handleChange = (field: keyof BusinessForm, value: string) => {
        setBusinessValues((prev) => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
        // Also clear special case mappings like "kvk"
        if (field === "kvkNummer" && fieldErrors["kvk"]) {
            setFieldErrors((prev) => { const n = { ...prev }; delete n["kvk"]; return n; });
        }
    };

    const handleStartBecomingSeller = () => {
        setIsEditing(true);
        setFeedback(null);
        setError(null);
    };

    const verkoperPayloadFromBusiness = (business: BusinessForm) => ({
        kvkNummer: business.kvkNummer,
        bedrijfsnaam: business.bedrijfsnaam,
        straat: business.straat,
        huisnummer: business.huisnummer,
        postcode: business.postcode,
        woonplaats: business.woonplaats,
    });

    const handleSave = async () => {
        setSaving(true);
        setFieldErrors({});
        setFeedback(null);
        setError(null);

        // Basic frontend checks
        const newErrors: Record<string, string> = {};
        if (!businessValues.bedrijfsnaam.trim()) newErrors.bedrijfsnaam = "Naam is verplicht";
        if (!businessValues.kvkNummer.trim()) newErrors.kvkNummer = "KvK is verplicht";

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            setError("Vul alle verplichte velden in.");
            setSaving(false);
            return;
        }

        try {
            const payload = verkoperPayloadFromBusiness(businessValues);
            const result = await verkoperService.upsertMyVerkoper(payload);
            setVerkoperId(result.verkoperId);

            // If user was not yet a seller, upgrade them now
            if (user?.role !== "VERKOPER") {
                await gebruikerService.updateRole("VERKOPER", user ?? undefined);
                await refreshUser();
                setFeedback("Gefeliciteerd! U bent nu verkoper.");
            } else {
                setFeedback("Bedrijfsgegevens opgeslagen.");
            }
            setIsEditing(false);
        } catch (err: any) {
            // ERROR PARSING LOGIC
            let displayError = "Opslaan mislukt.";
            try {
                const parsed = JSON.parse(err.message);
                if (parsed.errors) {
                    const backendErrors: Record<string, string> = {};
                    Object.keys(parsed.errors).forEach((key) => {
                        // Backend keys might be "KvkNummer", "Adresgegevens", or "Postcode"
                        // We try to map them to our field names
                        const lowerKey = key.toLowerCase();
                        if (lowerKey.includes("kvk")) backendErrors.kvkNummer = parsed.errors[key][0];
                        else if (lowerKey.includes("bedrijfsnaam")) backendErrors.bedrijfsnaam = parsed.errors[key][0];
                        else if (lowerKey.includes("postcode")) backendErrors.postcode = parsed.errors[key][0];
                        else if (lowerKey.includes("woonplaats")) backendErrors.woonplaats = parsed.errors[key][0];
                        else if (lowerKey.includes("straat")) backendErrors.straat = parsed.errors[key][0];
                        else if (lowerKey.includes("huisnummer")) backendErrors.huisnummer = parsed.errors[key][0];
                        else {
                            // Fallback: just put it in error message
                            displayError = parsed.errors[key][0];
                        }
                    });
                    setFieldErrors(backendErrors);
                    if (Object.keys(backendErrors).length > 0) {
                        displayError = "Controleer de gemarkeerde velden.";
                    }
                } else if (parsed.title) {
                    displayError = parsed.title;
                } else if (parsed.detail) {
                    displayError = parsed.detail;
                }
            } catch (e) {
                displayError = err.message || "Er is iets misgegaan.";
            }
            setError(displayError);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError(null);
        setFeedback(null);
        setFieldErrors({});
        // If they were just trying to become a seller but cancelled, maybe reset values?
        // For now we keep them typed in case they misclicked.
    };

    return (
        <Box sx={{ width: "100%" }}>
            <BoxMui sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Bedrijfsgegevens</Typography>
                <BoxMui sx={{ display: "flex", gap: 1 }}>
                    {!isEditing ? (
                        !isVerkoper ? (
                            <Button variant="contained" onClick={handleStartBecomingSeller}>Word Verkoper</Button>
                        ) : (
                            <Button variant="contained" onClick={() => setIsEditing(true)}>Gegevens Bewerken</Button>
                        )
                    ) : (
                        <>
                            <Button variant="text" onClick={handleCancel}>Annuleren</Button>
                            <Button variant="contained" onClick={handleSave} disabled={saving}>
                                {saving ? "Laden..." : (!isVerkoper ? "Word Verkoper" : "Opslaan")}
                            </Button>
                        </>
                    )}
                </BoxMui>
            </BoxMui>

            {!isVerkoper && !isEditing && (
                <Alert severity="info" sx={{ mb: 3, borderRadius: "8px" }}>
                    Vul uw bedrijfsgegevens in om te beginnen met verkopen.
                </Alert>
            )}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="Bedrijfsnaam"
                        value={businessValues.bedrijfsnaam}
                        onChange={(e) => handleChange("bedrijfsnaam", e.target.value)}
                        disabled={!isEditing}
                        error={!!fieldErrors.bedrijfsnaam}
                        helperText={fieldErrors.bedrijfsnaam}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        label="KvK-nummer"
                        value={businessValues.kvkNummer}
                        onChange={(e) => handleChange("kvkNummer", e.target.value)}
                        disabled={!isEditing}
                        error={!!fieldErrors.kvkNummer || !!fieldErrors.kvk}
                        helperText={fieldErrors.kvkNummer || fieldErrors.kvk}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        label="Stad"
                        value={businessValues.woonplaats}
                        onChange={(e) => handleChange("woonplaats", e.target.value)}
                        disabled={!isEditing}
                        error={!!fieldErrors.woonplaats}
                        helperText={fieldErrors.woonplaats}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        label="Straat"
                        value={businessValues.straat}
                        onChange={(e) => handleChange("straat", e.target.value)}
                        disabled={!isEditing}
                        error={!!fieldErrors.straat}
                        helperText={fieldErrors.straat}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                        label="Postcode"
                        value={businessValues.postcode}
                        onChange={(e) => handleChange("postcode", e.target.value)}
                        disabled={!isEditing}
                        error={!!fieldErrors.postcode}
                        helperText={fieldErrors.postcode}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 1}}>
                    <TextField
                        label="Huisnummer"
                        value={businessValues.huisnummer}
                        onChange={(e) => handleChange("huisnummer", e.target.value)}
                        disabled={!isEditing}
                        error={!!fieldErrors.huisnummer}
                        helperText={fieldErrors.huisnummer}
                        />
                 </Grid>
            </Grid>

            {feedback && <Alert severity="success" sx={{ mt: 2, borderRadius: "10px" }}>{feedback}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>{error}</Alert>}

            {isVerkoper && (
                <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="caption" color="text.secondary">Bedrijfsgegevens gekoppeld aan Verkoper ID: {verkoperId}</Typography>
                </>
            )}
        </Box>
    );
}
