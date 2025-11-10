'use client';

import React, { useState } from 'react';
// @ts-ignore
import './page.css';
import { TextField, InputAdornment, IconButton, Button, Alert } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    emailadres: '',
    wachtwoord: '',
    repeatWachtwoord: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.wachtwoord !== form.repeatWachtwoord) {
      setError('Wachtwoorden komen niet overeen.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/Gebruiker/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emailadres: form.emailadres, wachtwoord: form.wachtwoord }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Fout bij registreren');
      setSuccess('Account succesvol aangemaakt!');
      setForm({ emailadres: '', wachtwoord: '', repeatWachtwoord: '' });
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
          <div className="inloggen-text">Registreren</div>
          <div className="register-section">
            <span>Al een gebruiker?</span>
            <a href="/login" className="register-btn">Inloggen</a>
          </div>

          <div className="input-field">
            <TextField label="E-mail adres" name="emailadres" variant="outlined" fullWidth value={form.emailadres} onChange={handleChange}
              InputProps={{ startAdornment: (<InputAdornment position="start"><MailOutlineIcon /></InputAdornment>) }} />
          </div>

          <div className="input-field">
            <TextField label="Wachtwoord" name="wachtwoord" type={showPassword ? 'text' : 'password'} variant="outlined" fullWidth value={form.wachtwoord} onChange={handleChange}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><LockOutlinedIcon /></InputAdornment>),
                endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>),
              }} />
          </div>

          <div className="input-field">
            <TextField label="Herhaal wachtwoord" name="repeatWachtwoord" type={showPassword ? 'text' : 'password'} variant="outlined" fullWidth value={form.repeatWachtwoord} onChange={handleChange}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><LockOutlinedIcon /></InputAdornment>),
                endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>),
              }} />
          </div>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Button type="submit" variant="contained" className="login-btn" disabled={loading}>
            {loading ? 'Bezig...' : 'Account aanmaken'}
          </Button>
        </form>
      </div>
    </div>
  );
}
