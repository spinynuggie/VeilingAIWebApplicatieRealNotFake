'use client';

import React, { useState } from 'react';
// @ts-ignore:
import './page.css';
import { TextField, InputAdornment, IconButton, Checkbox, Button, Alert } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const endpoint = `${apiBase}/api/Gebruiker/login`;
      const body = { emailadres: email, wachtwoord: password };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Fout bij inloggen');
      else {
        setSuccess('Succesvol ingelogd!');
        router.push('/veilingDisplay')
      }
    } catch (err: any) {
      setError(err.message || 'Er is iets misgegaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/loginAssets/FloraHollandGebouw.png" alt="Royal Flora Holland" className="login-image" />
      </div>
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <img src="/loginAssets/royalLogo.svg" alt="Royal Flora Holland Logo" className="logo" />
          <div className="inloggen-text">Inloggen</div>

          <div className="register-section">
            <span>Nieuwe gebruiker?</span>
            <a href="/register" className="register-btn">Account aanmaken</a>
          </div>

          <div className="input-field">
            <TextField
              label="E-mail adres"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="input-field">
            <TextField
              label="Wachtwoord"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="remember-section">
            <label className="remember-label">
              <Checkbox />
              Herinner mij
            </label>
            <a href="#" className="forgot-link">Wachtwoord vergeten?</a>
          </div>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Button type="submit" variant="contained" className="login-btn" disabled={loading}>
            {loading ? 'Bezig...' : 'Inloggen'}
          </Button>
        </form>
      </div>
    </div>
  );
}
