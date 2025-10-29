'use client';

import React, { useState } from 'react';
// @ts-ignore - CSS side-effect import typing not declared
import './page.css';
import { TextField, InputAdornment, IconButton, Checkbox, Button } from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/loginAssets/FloraHollandGebouw.png" alt="Royal Flora Holland" className="login-image" />
      </div>
      <div className="login-right">
        <div className="login-form">
          <img src="/loginAssets/royalLogo.svg" alt="Royal Flora Holland Logo" className="logo" />
           <div className="inloggen-text">Inloggen</div> 

          <div className="register-section">
            <span>Nieuwe gebruiker?</span>
            <button className="register-btn">Account aanmaken</button>
          </div>

          <div className="input-field">
            <TextField
              label="E-mail adres"
              variant="outlined"
              fullWidth
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

          <Button variant="contained" className="login-btn">Inloggen</Button>
        </div>
      </div>
    </div>
  );
}