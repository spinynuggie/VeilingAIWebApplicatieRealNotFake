'use client';

import React, { useState } from 'react';
// @ts-ignore
import './page.css';
import { TextField, InputAdornment, IconButton, Button, Alert } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import * as authService from '@/services/authService';

// Simpele manier om valid email te checken
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

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
    const router = useRouter();
    const { refreshUser } = useAuth();

    // States voor field-specifieke errors
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [repeatPasswordError, setRepeatPasswordError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Simpele frontend checks voor password en email
    const validateForm = (): boolean => {
        let isValid = true;

        // Reset field errors
        setEmailError(null);
        setPasswordError(null);
        setRepeatPasswordError(null);

        // --- Email Validation ---
        if (!form.emailadres.trim()) {
            setEmailError('E-mailadres is vereist.');
            isValid = false;
        } else if (!validateEmail(form.emailadres)) {
            setEmailError('Voer een geldig e-mailadres in.');
            isValid = false;
        }

        // --- Password Validation ---
        if (!form.wachtwoord) {
            setPasswordError('Wachtwoord is vereist.');
            isValid = false;
        } else if (form.wachtwoord.length < 12) {
            setPasswordError('Wachtwoord moet minimaal 12 tekens bevatten.');
            isValid = false;
        }

        // --- Repeat Password Validation ---
        if (!form.repeatWachtwoord) {
            setRepeatPasswordError('Herhaal het wachtwoord.');
            isValid = false;
        }

        // Check for password match (should be done before setting loading)
        if (form.wachtwoord && form.repeatWachtwoord && form.wachtwoord !== form.repeatWachtwoord) {
            setRepeatPasswordError('Wachtwoorden komen niet overeen.');
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        // Frontend validatie
        if (!validateForm()) {
            setLoading(false);
            return;
        }

        // De wachtwoord-match check is nu in validateForm(), dus hier weggehaald.
        // De loading state blijft op true staan na succesvolle validatie.

        try {
            await authService.register(form.emailadres, form.wachtwoord);
            setSuccess('Account succesvol aangemaakt!');
            setForm({ emailadres: '', wachtwoord: '', repeatWachtwoord: '' });

            // Automatically log in the user after successful registration
            await authService.login(form.emailadres, form.wachtwoord);
            await refreshUser();
            router.push('/veilingDisplay');
        } catch (err: any) {
            // Display backend errors
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
                            error={!!emailError}
                            helperText={emailError}
                            InputProps={{ startAdornment: (<InputAdornment position="start"><MailOutlineIcon /></InputAdornment>) }}
                        />
                    </div>

                    <div className="input-field">
                        <TextField label="Wachtwoord" name="wachtwoord" type={showPassword ? 'text' : 'password'} variant="outlined" fullWidth value={form.wachtwoord} onChange={handleChange}
                            error={!!passwordError}
                            helperText={passwordError}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><LockOutlinedIcon /></InputAdornment>),
                                endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>),
                            }} />
                    </div>

                    <div className="input-field">
                        <TextField label="Herhaal wachtwoord" name="repeatWachtwoord" type={showPassword ? 'text' : 'password'} variant="outlined" fullWidth value={form.repeatWachtwoord} onChange={handleChange}
                            error={!!repeatPasswordError} // 💡 FIX: Gebruik de nieuwe error state
                            helperText={repeatPasswordError} // 💡 FIX: Gebruik de nieuwe error state
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
