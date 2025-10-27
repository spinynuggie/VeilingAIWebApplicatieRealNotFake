import React, { useState } from "react";
import { Grid, Button, Typography, TextField, IconButton, Alert, } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import royalLogo from "../assets/loginAssets/royalLogo.png";

const BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:5000";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div>
      <Grid container
      sx={{
        backgroundColor: "gray",
        width: "100vw"
      }}>
        <Typography variant="body1" sx={{
           backgroundColor: "black",
         }}>
          <Link
            to="/Login"
            style={{
              color: "#5575d4ff",
              textDecoration: "underline",
              marginRight: "10px"
            }}
          >
            Inloggen
          </Link>

          of

          <Link
            to="/Register"
            style={{
              color: "#5575d4ff",
              textDecoration: "underline",
              marginLeft: "10px"
            }}
          >
            Registreren
          </Link>
        </Typography>
      </Grid>
      <Grid container
        sx={{
        height: "94vh",
        width: "100vw",
        background: "linear-gradient(to bottom, #E2FFE9 0%, #E2FFE9 70%, #FFFFFF 100%)",
        }}>
        <Grid container justifyContent="center">
          <Grid item xs={4} md={6} sx={{
           }}>
            <img
              src={royalLogo}
              alt="Royal FloraHolland Logo"
              style={{  }}
            />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
