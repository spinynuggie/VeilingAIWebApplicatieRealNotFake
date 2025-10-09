import React, { useState } from "react";
import { Grid, Button, Typography, TextField, IconButton, Alert } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import floraHollandKantoor from "../assets/loginAssets/floraHollandKantoor.png";
import royalLogo from "../assets/loginAssets/royalLogo.png";
import { useNavigate } from "react-router-dom";

const BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:5000";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const navigate = useNavigate();
  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  function validate(): string | null {
    if (!naam.trim()) return "Naam is verplicht.";
    if (!email.trim()) return "E-mail adres is verplicht.";
    if (pw.length < 6) return "Wachtwoord moet minimaal 6 tekens zijn.";
    if (pw !== pw2) return "Wachtwoorden komen niet overeen.";
    return null;
  }

  async function handleRegister() {
    setErr(null);
    setOk(null);
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Naam: naam, Emailadres: email, Wachtwoord: pw }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `${res.status} ${res.statusText}`);
      }
      setOk("Account aangemaakt! Je kunt nu inloggen.");
      // Optional: direct naar Landing of Login
      navigate("/Landing");
      // of: navigate("/Login");
    } catch (e: any) {
      setErr(e.message ?? "Registratie mislukt");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left half - Image */}
      <Grid item xs={12} md={6} sx={{ width: { md: "50vw" } }}>
        <img
          src={floraHollandKantoor}
          alt="floraholland hoofdkantoor"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Grid>

      {/* Right half */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          width: { md: "50vw" },
          background: "linear-gradient(to top, #E2FFE9 0%, #E2FFE9 70%, #FFFFFF 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: { xs: 2, md: 4 },
        }}
      >
        {/* Logo */}
        <Grid container justifyContent="center">
          <Grid item xs={4} md={6} sx={{ ml: "12.5%" }}>
            <img
              src={royalLogo}
              alt="Royal FloraHolland Logo"
              style={{ display: "block", width: "auto", maxWidth: "75%" }}
            />
          </Grid>
        </Grid>

        {/* Form area */}
        <Grid container justifyContent="center">
          <Grid
            item
            md={4}
            xs={12}
            sx={{ pt: { xs: 3, md: 6 }, display: "flex", flexDirection: "column" }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Registreren
            </Typography>

            {err && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {err}
              </Alert>
            )}
            {ok && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {ok}
              </Alert>
            )}

            <Typography variant="body1" sx={{ pt: { xs: 2, md: 4 } }}>
              Naam
            </Typography>
            <TextField
              fullWidth
              id="reg-naam"
              variant="standard"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              InputProps={{ sx: { height: "23px" } }}
            />

            <Typography variant="body1" sx={{ pt: 3 }}>
              E-mail adres
            </Typography>
            <TextField
              fullWidth
              id="reg-email"
              label={<EmailIcon />}
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{ sx: { height: "23px" } }}
              sx={{
                "& .MuiInputLabel-root": {
                  transform: "translateY(10px)",
                  transition: "transform 0.2s ease",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  transform: "translate(-30px, 10px)",
                },
              }}
            />

            <Grid container alignItems="center" spacing={1} sx={{ mt: 3, width: "100%" }}>
              <Grid item xs sx={{ flexGrow: 1 }}>
                <Grid container direction="column">
                  <Typography variant="body1">Wachtwoord</Typography>
                  <TextField
                    fullWidth
                    id="reg-password"
                    label={<LockIcon />}
                    variant="standard"
                    type={showPassword ? "text" : "password"}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    InputProps={{ sx: { height: "23px" } }}
                    sx={{
                      mb: 1,
                      "& .MuiInputLabel-root": {
                        transform: "translateY(10px)",
                        transition: "transform 0.2s ease",
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        transform: "translate(-30px, 10px)",
                      },
                    }}
                  />

                  <Typography variant="body1">Bevestig wachtwoord</Typography>
                  <TextField
                    fullWidth
                    id="reg-password2"
                    label={<LockIcon />}
                    variant="standard"
                    type={showPassword ? "text" : "password"}
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    error={!!pw2 && pw !== pw2}
                    helperText={pw2 && pw !== pw2 ? "Wachtwoorden komen niet overeen" : " "}
                    InputProps={{ sx: { height: "23px" } }}
                    sx={{
                      "& .MuiInputLabel-root": {
                        transform: "translateY(10px)",
                        transition: "transform 0.2s ease",
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        transform: "translate(-30px, 10px)",
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Grid item>
                <IconButton onClick={handleTogglePassword} aria-label="toon/verberg wachtwoord">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              onClick={handleRegister}
              disabled={submitting || !naam || !email || !pw || !pw2 || pw !== pw2}
              sx={{ mt: 4 }}
            >
              Aanmelden
            </Button>

            <Button variant="text" onClick={() => navigate("/Login")} sx={{ mt: 1, alignSelf: "start" }}>
              Al een account? Inloggen
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
