// app/layout.tsx
"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider } from "@/components/(oud)/AuthProvider";
import { appTheme } from "@/styles/theme"; // Imported from your new file
import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

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
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}