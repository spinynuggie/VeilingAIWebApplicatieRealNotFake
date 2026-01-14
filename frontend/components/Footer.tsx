"use client";

import { Box, Container, Typography, Stack, Link as MuiLink } from "@mui/material";
import Link from "next/link";

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) => theme.palette.background.default,
                borderTop: '1px solid #e0e0e0',
            }}
        >
            <Container maxWidth="lg">
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={4}
                    justifyContent="center"
                    alignItems="center"
                >
                    <MuiLink component={Link} href="/privacy" underline="hover" color="text.secondary">
                        Privacy
                    </MuiLink>
                    <MuiLink component={Link} href="/voorwaarden" underline="hover" color="text.secondary">
                        Algemene Voorwaarden
                    </MuiLink>
                    <MuiLink component={Link} href="/toegankelijkheid" underline="hover" color="text.secondary">
                        Toegankelijkheid
                    </MuiLink>
                </Stack>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                    © {new Date().getFullYear()} Flora Veiling. Alle rechten voorbehouden.
                </Typography>
            </Container>
        </Box>
    );
}
