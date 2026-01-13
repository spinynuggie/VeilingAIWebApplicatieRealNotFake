// app/layout.tsx
"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider } from "@/components/AuthProvider";
import { appTheme } from "@/styles/theme";
import ChatWidget from "@/components/Chat/ChatWidget";
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
            {children}
            <ChatWidget />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}