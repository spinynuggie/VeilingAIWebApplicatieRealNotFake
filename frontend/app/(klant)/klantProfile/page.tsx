"use client";

import Image from "next/image";
import backgroundImage from "@/public/loginAssets/FloraHollandGebouw.svg";
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import {
  Box,
  Typography,
  Grid,
  Button,
  Divider,
  TextField,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import RequireAuth from "@/components/(oud)/RequireAuth";
import { useAuth } from "@/components/(oud)/AuthProvider";
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

const blankProfile: ProfileForm = {
  naam: "",
  emailadres: "",
  woonplaats: "",
  straat: "",
  postcode: "",
  huisnummer: "",
};

const blankBusiness: BusinessForm = {
  bedrijfsnaam: "",
  kvkNummer: "",
  woonplaats: "",
  straat: "",
  postcode: "",
  huisnummer: "",
};

const formFromUser = (user: any | null): ProfileForm => ({
  naam: user?.naam ?? "",
  emailadres: user?.emailadres ?? "",
  woonplaats: user?.woonplaats ?? "",
  straat: user?.straat ?? "",
  postcode: user?.postcode ?? "",
  huisnummer: user?.huisnummer ?? "",
});

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#fff",
  },
};

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

export default function KlantProfile() {
  const { user, refreshUser } = useAuth();
  const [formValues, setFormValues] = useState<ProfileForm>(blankProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerkoper, setIsVerkoper] = useState(false);
  const [businessValues, setBusinessValues] = useState<BusinessForm>(blankBusiness);
  const [verkoperId, setVerkoperId] = useState<number | null>(null);
  const [businessSaving, setBusinessSaving] = useState(false);
  const [businessFeedback, setBusinessFeedback] = useState<string | null>(null);
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [sellerDialogOpen, setSellerDialogOpen] = useState(false);
  const [roleChanging, setRoleChanging] = useState(false);
  const roleLabel = user?.role ?? "Onbekend";

  const businessFormFromResponse = (verkoper: verkoperService.VerkoperResponse): BusinessForm => {
    let bedrijfsnaam = "";
    try {
      const parsed = JSON.parse(verkoper.bedrijfsgegevens ?? "{}");
      bedrijfsnaam = parsed.bedrijfsnaam ?? "";
    } catch {
      bedrijfsnaam = "";
    }

    let adres = { woonplaats: "", straat: "", postcode: "", huisnummer: "" };
    try {
      const parsedAdres = JSON.parse(verkoper.adresgegevens ?? "{}");
      adres = {
        woonplaats: parsedAdres.woonplaats ?? "",
        straat: parsedAdres.straat ?? "",
        postcode: parsedAdres.postcode ?? "",
        huisnummer: parsedAdres.huisnummer ?? "",
      };
    } catch {
      // leave defaults
    }

    return {
      bedrijfsnaam,
      kvkNummer: verkoper.kvkNummer ?? "",
      woonplaats: adres.woonplaats,
      straat: adres.straat,
      postcode: adres.postcode,
      huisnummer: adres.huisnummer,
    };
  };

  useEffect(() => {
    setFormValues(formFromUser(user));
    setBusinessValues((prev) => ({
      ...prev,
      woonplaats: user?.woonplaats ?? "",
      straat: user?.straat ?? "",
      postcode: user?.postcode ?? "",
      huisnummer: user?.huisnummer ?? "",
    }));
  }, [user]);

  useEffect(() => {
    setIsVerkoper(user?.role === "VERKOPER");
  }, [user]);

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
          setBusinessValues(businessFormFromResponse(verkoper));
        } else {
          setVerkoperId(null);
        }
      } catch (err: any) {
        setBusinessError(err?.message ?? "Kon verkopergegevens niet ophalen.");
      }
    };
    void loadVerkoper();
  }, [user]);

  const hasChanges = useMemo(() => {
    if (!user) return false;
    return Object.entries(formValues).some(
      ([key, value]) => (user as any)?.[key] ?? "" !== value
    );
  }, [formValues, user]);

  const handleSave = async () => {
    if (!user) return;
    if (!hasChanges) {
      setFeedback("Geen wijzigingen om op te slaan.");
      setIsEditing(false);
      return;
    }
    setSaving(true);
    setFeedback(null);
    setError(null);
    try {
      const updates = Object.entries(formValues).reduce<Partial<ProfileForm>>(
        (acc, [key, value]) => {
          if ((user as any)?.[key] ?? "" !== value) {
            acc[key as keyof ProfileForm] = value;
          }
          return acc;
        },
        {}
      );
      const emailChanged = updates.emailadres !== undefined;

      await gebruikerService.updateGebruikerFields(updates, user);
      await refreshUser();
      setFeedback(
        emailChanged
          ? "Gegevens opgeslagen. E-mail krijgt later een verificatie zodra mail beschikbaar is."
          : "Gegevens opgeslagen."
      );
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message ?? "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormValues(formFromUser(user));
    setIsEditing(false);
    setFeedback(null);
    setError(null);
  };

  const setField = (field: keyof ProfileForm, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const setBusinessField = (field: keyof BusinessForm, value: string) => {
    setBusinessValues((prev) => ({ ...prev, [field]: value }));
  };

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
      setBusinessFeedback("Bedrijfsgegevens opgeslagen en gekoppeld aan je account.");
    } catch (err: any) {
      setBusinessError(err?.message ?? "Opslaan bedrijfsgegevens mislukt.");
    } finally {
      setBusinessSaving(false);
    }
  };

  const handleBecomeSeller = () => {
    setSellerDialogOpen(true);
  };

  const confirmBecomeSeller = async () => {
    setRoleChanging(true);
    setBusinessError(null);
    try {
      await gebruikerService.updateRole("VERKOPER", user ?? undefined);
      await refreshUser();
      setBusinessFeedback("Rol aangepast naar verkoper. Vul je bedrijfsgegevens in en bevestig.");
      setSellerDialogOpen(false);
    } catch (err: any) {
      setBusinessError(err?.message ?? "Rol veranderen mislukt.");
    } finally {
      setRoleChanging(false);
    }
  };

  const handleDisableSeller = async () => {
    setRoleChanging(true);
    setBusinessError(null);
    setBusinessFeedback(null);
    try {
      await gebruikerService.updateRole("KOPER", user ?? undefined);
      await refreshUser();
    } catch (err: any) {
      setBusinessError(err?.message ?? "Rol wijzigen mislukt.");
    } finally {
      setRoleChanging(false);
    }
  };

  return (
    <RequireAuth>
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
          background: "linear-gradient(135deg, #ffffff 0%, #e2ffe9 70%)",
        }}
      >
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: -2,
            opacity: 0.14,
          }}
        >
          <Image
            src={backgroundImage}
            alt="achtergrondfoto van floraholland hoofdkantoor"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            quality={100}
            priority
          />
        </Box>

        <Box
          sx={{
            position: "relative",
            maxWidth: 1180,
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: { xs: 6, md: 10 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Image
                src={royalLogo}
                alt="Royal Flora Holland Logo"
                width={160}
                height={65}
                priority
              />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.4 }}>
                  Klantprofiel
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Zie je gegevens bovenaan, bewerk ze en bevestig met een knop.
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`Rol: ${roleLabel}`}
              color={isVerkoper ? "success" : roleLabel === "VEILINGMEESTER" ? "warning" : "default"}
              sx={{ fontWeight: 700, borderRadius: "10px" }}
            />
          </Box>

          <Box
            sx={{
              background: "linear-gradient(to bottom, #ffffff, #eaf8ef)",
              borderRadius: "18px",
              border: "1px solid rgba(7,64,37,0.08)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.14)",
              p: { xs: 3, md: 4 },
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.6 }}>
                  Jouw gegevens
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bewerk veilig en bevestig met een knop. Email krijgt later
                  een verificatiecode.
                </Typography>
              </Box>
              {!isEditing ? (
                <Button
                  variant="contained"
                  onClick={() => setIsEditing(true)}
                  sx={{
                    backgroundColor: "#2e5b3f",
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2.6,
                  }}
                >
                  Bewerk gegevens
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="text"
                    onClick={handleCancel}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      px: 2,
                    }}
                  >
                    Annuleren
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                      backgroundColor: "#2e5b3f",
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 700,
                      px: 2.6,
                    }}
                  >
                    {saving ? "Opslaan..." : "Bevestigen"}
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={2.4}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Naam"
                  value={formValues.naam}
                  onChange={(e) => setField("naam", e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={fieldStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="E-mail"
                  value={formValues.emailadres}
                  onChange={(e) => setField("emailadres", e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  helperText="Verificatiecode versturen volgt zodra mailservice beschikbaar is."
                  sx={fieldStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Woonplaats"
                  value={formValues.woonplaats}
                  onChange={(e) => setField("woonplaats", e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={fieldStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Straat"
                  value={formValues.straat}
                  onChange={(e) => setField("straat", e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={fieldStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Postcode"
                  value={formValues.postcode}
                  onChange={(e) => setField("postcode", e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={fieldStyle}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Huisnummer"
                  value={formValues.huisnummer}
                  onChange={(e) => setField("huisnummer", e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={fieldStyle}
                />
              </Grid>
            </Grid>

            {(feedback || error) && (
              <Box>
                {feedback && (
                  <Alert severity="success" sx={{ borderRadius: "10px", mb: error ? 1 : 0 }}>
                    {feedback}
                  </Alert>
                )}
                {error && (
                  <Alert severity="error" sx={{ borderRadius: "10px" }}>
                    {error}
                  </Alert>
                )}
              </Box>
            )}
          </Box>

          {!isVerkoper ? (
            <Box
              sx={{
                background: "linear-gradient(to bottom, #ffffff, #eaf8ef)",
                borderRadius: "18px",
                border: "1px solid rgba(7,64,37,0.08)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                p: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "flex-start",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Verkoper worden?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640 }}>
                Klik op de knop om je gebruikersaccount om te zetten naar een bedrijfsaccount. Je bevestigt dit in een popup; later komt er e-mailverificatie bij.
              </Typography>
              <Button
                variant="contained"
                onClick={handleBecomeSeller}
                sx={{
                  backgroundColor: "#2e5b3f",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2.6,
                }}
              >
                Verkoper? Klik hier
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                background: "linear-gradient(to bottom, #ffffff, #eaf8ef)",
                borderRadius: "18px",
                border: "1px solid rgba(7,64,37,0.08)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                p: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: "column",
                gap: 2.3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", md: "center" },
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.6 }}>
                    Bedrijfsgegevens
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Zelfde look-and-feel als login: helder, groen accent, en een duidelijke bevestigknop.
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handleDisableSeller}
                    disabled={roleChanging}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "10px",
                      px: 2.4,
                    }}
                  >
                    {roleChanging ? "Bezig..." : "Verkoper uit"}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleBusinessSave}
                    disabled={businessSaving}
                    sx={{
                      backgroundColor: "#2e5b3f",
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "10px",
                      px: 2.4,
                    }}
                  >
                    {businessSaving ? "Opslaan..." : "Bevestigen"}
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={2.4}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Bedrijfsnaam"
                    placeholder="Vul je bedrijfsnaam in"
                    value={businessValues.bedrijfsnaam}
                    onChange={(e) => setBusinessField("bedrijfsnaam", e.target.value)}
                    disabled={businessSaving}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="KvK-nummer"
                    placeholder="00000000"
                    value={businessValues.kvkNummer}
                    onChange={(e) => setBusinessField("kvkNummer", e.target.value)}
                    disabled={businessSaving}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Woonplaats"
                    placeholder="Aalsmeer"
                    value={businessValues.woonplaats}
                    onChange={(e) => setBusinessField("woonplaats", e.target.value)}
                    disabled={businessSaving}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Straat"
                    placeholder="Zuidereinde"
                    value={businessValues.straat}
                    onChange={(e) => setBusinessField("straat", e.target.value)}
                    disabled={businessSaving}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Postcode"
                    placeholder="1234 AB"
                    value={businessValues.postcode}
                    onChange={(e) => setBusinessField("postcode", e.target.value)}
                    disabled={businessSaving}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldStyle}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Huisnummer"
                    placeholder="42"
                    value={businessValues.huisnummer}
                    onChange={(e) => setBusinessField("huisnummer", e.target.value)}
                    disabled={businessSaving}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={fieldStyle}
                  />
                </Grid>
              </Grid>

              {(businessFeedback || businessError) && (
                <Box>
                  {businessFeedback && (
                    <Alert severity="success" sx={{ borderRadius: "10px", mb: businessError ? 1 : 0 }}>
                      {businessFeedback}
                    </Alert>
                  )}
                  {businessError && (
                    <Alert severity="error" sx={{ borderRadius: "10px" }}>
                      {businessError}
                    </Alert>
                  )}
                </Box>
              )}

              <Divider />
              <Typography variant="body2" color="text.secondary">
                Bedrijfsgegevens worden direct via de Verkoper-controller opgeslagen; breid de koppeling met je account uit zodra die logica gereed is.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <SellerConfirmDialog
        open={sellerDialogOpen}
        onClose={() => setSellerDialogOpen(false)}
        onConfirm={confirmBecomeSeller}
        loading={roleChanging}
      />
    </RequireAuth>
  );
}

// Custom confirmation modal (niet de standaard browser alert/prompt)
function SellerConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          p: 1,
          maxWidth: 420,
          width: "100%",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Word verkoper</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "text.primary" }}>
          Hiermee zet je je gebruikersaccount om naar een bedrijfsaccount. Later komt er e-mail verificatie bij. Bevestig om door te gaan.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700 }}>
          Annuleren
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={{
            backgroundColor: "#2e5b3f",
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 700,
            px: 2.4,
          }}
        >
          {loading ? "Bezig..." : "Bevestigen"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
