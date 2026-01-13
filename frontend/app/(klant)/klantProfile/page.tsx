"use client";

import Image from "next/image";
import backgroundImage from "@/public/loginAssets/FloraHollandGebouw.svg";
import {
  Typography,
  Grid,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Box as BoxMui, // MUI Box hernoemd om conflict met jouw component te voorkomen
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

// Jouw custom components
import { Box } from "@/components/Box";
import { Button } from "@/components/Buttons/Button";
import { TextField } from "@/components/TextField";
import { Background } from "@/components/Background";
import { FloraLogo } from "@/components/FloraLogo";
import AppNavBar from "@/features/(NavBar)/AppNavBar";

import RequireAuth from "@/components/(oud)/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import * as gebruikerService from "@/services/gebruikerService";
import * as verkoperService from "@/services/verkoperService";

type ProfileForm = {
  naam: string;
  emailadres: string;
  woonplaats: string;
  straat: string;
  postcode: string;
  huisnummer: string;
};

type BusinessForm = {
  bedrijfsnaam: string;
  kvkNummer: string;
  woonplaats: string;
  straat: string;
  postcode: string;
  huisnummer: string;
};

export default function KlantProfile() {
  const { user, refreshUser } = useAuth();

  // States voor Profiel
  const [formValues, setFormValues] = useState<ProfileForm>({ naam: "", emailadres: "", woonplaats: "", straat: "", postcode: "", huisnummer: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // States voor Verkoper/Bedrijf
  const [isVerkoper, setIsVerkoper] = useState(false);
  const [businessValues, setBusinessValues] = useState<BusinessForm>({ bedrijfsnaam: "", kvkNummer: "", woonplaats: "", straat: "", postcode: "", huisnummer: "" });
  const [verkoperId, setVerkoperId] = useState<number | null>(null);
  const [businessSaving, setBusinessSaving] = useState(false);
  const [businessFeedback, setBusinessFeedback] = useState<string | null>(null);
  const [businessError, setBusinessError] = useState<string | null>(null);

  // States voor Dialog/Rollen
  const [sellerDialogOpen, setSellerDialogOpen] = useState(false);
  const [roleChanging, setRoleChanging] = useState(false);

  const roleLabel = user?.role ?? "Onbekend";

  // Helpers voor dataconversie
  const verkoperPayloadFromBusiness = (business: BusinessForm) => ({
    kvkNummer: business.kvkNummer,
    bedrijfsgegevens: JSON.stringify({ bedrijfsnaam: business.bedrijfsnaam }),
    adresgegevens: JSON.stringify({
      woonplaats: business.woonplaats,
      straat: business.straat,
      postcode: business.postcode,
      huisnummer: business.huisnummer,
    }),
    financieleGegevens: "",
  });

  // Effect: Laad profielgegevens
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
      setIsVerkoper(user.role === "VERKOPER");
    }
  }, [user]);

  // Effect: Laad verkopergegevens als gebruiker verkoper is
  useEffect(() => {
    const loadVerkoper = async () => {
      if (!user || user.role !== "VERKOPER") {
        setVerkoperId(null);
        return;
      }
      try {
        const verkoper = await verkoperService.getMyVerkoper();
        if (verkoper) {
          setVerkoperId(verkoper.verkoperId);
          // Parsing logica uit je oude bestand
          const parsedBus = JSON.parse(verkoper.bedrijfsgegevens ?? "{}");
          const parsedAdr = JSON.parse(verkoper.adresgegevens ?? "{}");
          setBusinessValues({
            bedrijfsnaam: parsedBus.bedrijfsnaam ?? "",
            kvkNummer: verkoper.kvkNummer ?? "",
            woonplaats: parsedAdr.woonplaats ?? "",
            straat: parsedAdr.straat ?? "",
            postcode: parsedAdr.postcode ?? "",
            huisnummer: parsedAdr.huisnummer ?? "",
          });
        }
      } catch (err: any) {
        setBusinessError("Kon verkopergegevens niet ophalen.");
      }
    };
    loadVerkoper();
  }, [user]);

  // Handler: Profiel opslaan
  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    setError(null);
    try {
      await gebruikerService.updateGebruikerFields(formValues, user);
      await refreshUser();
      setFeedback("Gegevens opgeslagen.");
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message ?? "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  // Handler: Bedrijfsgegevens opslaan
  const handleBusinessSave = async () => {
    setBusinessSaving(true);
    setBusinessFeedback(null);
    setBusinessError(null);

    if (!businessValues.kvkNummer || !businessValues.bedrijfsnaam) {
      setBusinessError("Kvk-nummer en bedrijfsnaam zijn verplicht.");
      setBusinessSaving(false);
      return;
    }

    try {
      const payload = verkoperPayloadFromBusiness(businessValues);
      const result = await verkoperService.upsertMyVerkoper(payload);
      setVerkoperId(result.verkoperId);
      setBusinessFeedback("Bedrijfsgegevens opgeslagen.");
    } catch (err: any) {
      setBusinessError(err?.message ?? "Opslaan bedrijfsgegevens mislukt.");
    } finally {
      setBusinessSaving(false);
    }
  };

  // Handlers: Rollen beheren
  const confirmBecomeSeller = async () => {
    setRoleChanging(true);
    try {
      await gebruikerService.updateRole("VERKOPER", user ?? undefined);
      await refreshUser();
      setSellerDialogOpen(false);
    } catch (err: any) {
      setBusinessError(err.message);
    } finally {
      setRoleChanging(false);
    }
  };

  const handleDisableSeller = async () => {
    setRoleChanging(true);
    try {
      await gebruikerService.updateRole("KOPER", user ?? undefined);
      await refreshUser();
    } catch (err: any) {
      setBusinessError(err.message);
    } finally {
      setRoleChanging(false);
    }
  };

  return (
    <RequireAuth>
      <Background>
        <AppNavBar />
        {/* Decoratieve achtergrondlaag */}
        <BoxMui sx={{ position: "fixed", inset: 0, zIndex: -1, opacity: 0.15 }}>
          <Image src={backgroundImage} alt="Background" fill style={{ objectFit: "cover" }} priority />
        </BoxMui>

        <BoxMui sx={{ maxWidth: 1200, mx: "auto", px: 3, py: 6 }}>

          {/* Header met Logo en Rol */}
          <BoxMui sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
            <BoxMui sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <FloraLogo mode="medium" />
              <BoxMui>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Klantprofiel</Typography>
                <Typography variant="body2" color="text.secondary">Beheer hier uw persoonlijke en zakelijke instellingen</Typography>
              </BoxMui>
            </BoxMui>
            <Chip label={`Huidige rol: ${roleLabel}`} color={isVerkoper ? "success" : "primary"} sx={{ fontWeight: 700, borderRadius: "8px" }} />
          </BoxMui>

          {/* Sectie 1: Persoonlijke Gegevens (Gebruikt jouw Box component) */}
          <Box sx={{ width: "100%", mb: 5 }}>
            <BoxMui sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, width: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Persoonlijke Informatie</Typography>
              {!isEditing ? (
                <Button variant="contained" onClick={() => setIsEditing(true)}>Gegevens Bewerken</Button>
              ) : (
                <BoxMui sx={{ display: "flex", gap: 1 }}>
                  <Button variant="text" onClick={() => setIsEditing(false)}>Annuleren</Button>
                  <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? "Laden..." : "Opslaan"}</Button>
                </BoxMui>
              )}
            </BoxMui>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Naam" value={formValues.naam} disabled={!isEditing} onChange={(e) => setFormValues({ ...formValues, naam: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="E-mail" value={formValues.emailadres} disabled={!isEditing} onChange={(e) => setFormValues({ ...formValues, emailadres: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Woonplaats" value={formValues.woonplaats} disabled={!isEditing} onChange={(e) => setFormValues({ ...formValues, woonplaats: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Straat" value={formValues.straat} disabled={!isEditing} onChange={(e) => setFormValues({ ...formValues, straat: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField label="Postcode" value={formValues.postcode} disabled={!isEditing} onChange={(e) => setFormValues({ ...formValues, postcode: e.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField label="Huisnr" value={formValues.huisnummer} disabled={!isEditing} onChange={(e) => setFormValues({ ...formValues, huisnummer: e.target.value })} />
              </Grid>
            </Grid>
            {feedback && <Alert severity="success" sx={{ mt: 2, borderRadius: "10px" }}>{feedback}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>{error}</Alert>}
          </Box>

          {/* Sectie 2: Zakelijke Gegevens of Promo (Gebruikt jouw Box component) */}
          <Box sx={{ width: "100%" }}>
            {!isVerkoper ? (
              <BoxMui sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Wilt u ook verkopen op de veiling?</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Zet uw account gratis om naar een verkopersaccount om producten aan te bieden.</Typography>
                <Button variant="contained" onClick={() => setSellerDialogOpen(true)}>Word nu Verkoper</Button>
              </BoxMui>
            ) : (
              <BoxMui sx={{ width: "100%" }}>
                <BoxMui sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Bedrijfsgegevens</Typography>
                  <BoxMui sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" color="error" onClick={handleDisableSeller} disabled={roleChanging}>Stopzetten</Button>
                    <Button variant="contained" onClick={handleBusinessSave} disabled={businessSaving}>
                      {businessSaving ? "Laden..." : "Update Bedrijf"}
                    </Button>
                  </BoxMui>
                </BoxMui>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField label="Bedrijfsnaam" value={businessValues.bedrijfsnaam} onChange={(e) => setBusinessValues({ ...businessValues, bedrijfsnaam: e.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField label="KvK-nummer" value={businessValues.kvkNummer} onChange={(e) => setBusinessValues({ ...businessValues, kvkNummer: e.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField label="Stad" value={businessValues.woonplaats} onChange={(e) => setBusinessValues({ ...businessValues, woonplaats: e.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField label="Straat" value={businessValues.straat} onChange={(e) => setBusinessValues({ ...businessValues, straat: e.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField label="Postcode" value={businessValues.postcode} onChange={(e) => setBusinessValues({ ...businessValues, postcode: e.target.value })} />
                  </Grid>
                </Grid>
                {businessFeedback && <Alert severity="success" sx={{ mt: 2, borderRadius: "10px" }}>{businessFeedback}</Alert>}
                {businessError && <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>{businessError}</Alert>}
                <Divider sx={{ my: 3 }} />
                <Typography variant="caption" color="text.secondary">Bedrijfsgegevens worden gekoppeld aan uw unieke Verkoper ID: {verkoperId ?? 'Laden...'}</Typography>
              </BoxMui>
            )}
          </Box>
        </BoxMui>

        {/* Dialog voor Rolbevestiging */}
        <Dialog open={sellerDialogOpen} onClose={() => setSellerDialogOpen(false)} PaperProps={{ sx: { borderRadius: "15px", p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Bevestig Verkopersrol</DialogTitle>
          <DialogContent>
            <DialogContentText>Weet u zeker dat u uw rol wilt wijzigen naar verkoper? U kunt hierna direct producten aanmaken voor de veiling.</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="text" onClick={() => setSellerDialogOpen(false)}>Annuleren</Button>
            <Button variant="contained" onClick={confirmBecomeSeller} disabled={roleChanging}>Bevestigen</Button>
          </DialogActions>
        </Dialog>

      </Background>
    </RequireAuth>
  );
}