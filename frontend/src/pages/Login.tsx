import React, { useState } from "react";
import { Grid, Button, Typography, TextField, IconButton, Alert } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import floraHollandKantoor from "../assets/loginAssets/floraHollandKantoor.png";
import royalLogo from "../assets/loginAssets/royalLogo.svg";
import { useNavigate } from "react-router-dom";

const BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:5000";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  async function handleLogin() {
    setErr(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Emailadres: email, Wachtwoord: pw }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? `${res.status} ${res.statusText}`);
      }
      // const user = await res.json(); // available if you want to store it
      navigate("/Landing");
    } catch (e: any) {
      setErr(e.message ?? "Inloggen mislukt");
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
              Inloggen
            </Typography>

            {err && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {err}
              </Alert>
            )}

            <Typography variant="body1" sx={{ pt: { xs: 2, md: 4 } }}>
              E-mail adres
            </Typography>
            <TextField
              fullWidth
              id="login-email"
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
                    id="login-password"
                    label={<LockIcon />}
                    variant="standard"
                    type={showPassword ? "text" : "password"}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
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
              onClick={handleLogin}
              disabled={submitting || !email || !pw}
              sx={{ mt: 4 }}
            >
              Inloggen
            </Button>

            <Button
              variant="text"
              onClick={() => navigate("/Register")}
              sx={{ mt: 1, alignSelf: "start" }}
            >
              Nog geen account? Registreer
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
