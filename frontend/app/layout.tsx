// app/layout.tsx
"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import { appTheme } from "@/styles/theme";
import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          <AuthProvider>
            <Toaster position="top-right" />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              {children}
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}