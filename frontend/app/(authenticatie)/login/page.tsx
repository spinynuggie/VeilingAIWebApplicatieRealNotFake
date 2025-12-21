'use client';

import React, { Suspense, useState } from 'react';
// @ts-ignore:
import { TextField, InputAdornment, IconButton, Checkbox, Button, Alert } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import * as authService from '@/services/authService';

// simpele manier om valid email te checken
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // --- NEW STATE FOR FIELD ERRORS ---
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();

    // Simpele frontend checks voor password en email
    const validateForm = (): boolean => {
        let isValid = true;

        setEmailError(null);
        setPasswordError(null);

        // Email Validation
        if (!email.trim()) {
            setEmailError('E-mailadres is vereist.');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Voer een geldig e-mailadres in.');
            isValid = false;
        }

        // Password Validation
        if (!password) {
            setPasswordError('Wachtwoord is vereist.');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Wachtwoord moet minimaal 6 tekens bevatten.');
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Frontend validatie
        if (!validateForm()) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            // Check backend na login poging
            await authService.login(email, password);
            await refreshUser();

            setSuccess('Succesvol ingelogd!');
            const next = searchParams.get('next');
            router.push(next || '/veilingDisplay');
        } catch (err: any) {
            // Backend errors laten zien
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
                            // --- FRONTEND ERROR PROPS ---
                            error={!!emailError}
                            helperText={emailError}
                            // ----------------------------
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
                            // --- FRONTEND ERROR PROPS ---
                            error={!!passwordError}
                            helperText={passwordError}
                            // ----------------------------
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

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
