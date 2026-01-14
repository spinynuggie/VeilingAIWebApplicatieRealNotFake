'use client';

import React, { Suspense, useState } from 'react';
import NextLink from 'next/link';
// @ts-ignore:
import {
    Alert,
    Button,
    Checkbox,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Link,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import * as authService from '@/services/authService';
import AuthSplitLayout from '@/components/AuthSplitLayout';
import { BackHand } from '@mui/icons-material';
import { Background } from '@/components/Background';

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
        } else if (password.length < 12) {
            setPasswordError('Wachtwoord moet minimaal 12 tekens bevatten.');
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
        <AuthSplitLayout cardProps={{ component: 'form', onSubmit: handleSubmit }}>

            <Stack spacing={1} alignItems="center">
                <img src="/loginAssets/royalLogo.svg" alt="Royal Flora Holland Logo" width={180} />
                <Typography variant="h5" fontWeight={700} textAlign="center">
                    Inloggen
                </Typography>
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                    Nieuwe gebruiker?
                </Typography>
                <Link
                    component={NextLink}
                    href="/register"
                    underline="hover"
                    color="primary"
                    variant="body2"
                    fontWeight={600}
                >
                    Account aanmaken
                </Link>
            </Stack>

            <Stack spacing={2}>
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
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FormControlLabel control={<Checkbox />} label="Herinner mij" />
                <Link href="#" underline="hover" variant="body2">
                    Wachtwoord vergeten?
                </Link>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
                {loading ? 'Bezig...' : 'Inloggen'}
            </Button>

        </AuthSplitLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
