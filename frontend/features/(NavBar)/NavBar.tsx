"use client";

import { AppBar, Toolbar, Box, Stack, IconButton, Button as MuiButton } from "@mui/material";
import {
  Person as PersonIcon,
  Menu as MenuIcon
} from "@mui/icons-material";
import { Button } from "@/components/Buttons/Button";
import Link from "next/link";
import { FloraLogo } from "@/components/FloraLogo";
import SearchBar from "@/components/SearchBar";
import { useState } from "react";
import SideMenu from "./SideMenu";

export type NavMode = 'visitor' | 'customer' | 'seller' | 'auctioneer';

interface NavBarProps {
  mode: NavMode;
  onLogout?: () => void;
}

export function NavBar({ mode, onLogout }: NavBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setDrawerOpen(newOpen);
  };

  const renderActions = () => {
    switch (mode) {
      case 'visitor':
        return (
          <>
            <Button variant="outlined" color="primary" component={Link} href="/login">Login</Button>
            <Button variant="contained" color="primary" component={Link} href="/register">Registreren</Button>
          </>
        );

      // Grouped all logged-in roles as they share similar right-side structure now
      case 'customer':
      case 'seller':
      case 'auctioneer':
        return (
          <>
            <IconButton color="primary" component={Link} href="/klantProfile">
              <PersonIcon />
            </IconButton>
            <MuiButton onClick={onLogout} color="error" variant="text" sx={{ fontWeight: 'bold' }}>
              LOGUIT
            </MuiButton>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="secondary" sx={{ boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>

          <Stack direction="row" alignItems="center" spacing={1}>
            {/* Hamburger Menu for Sidebar */}
            {mode !== 'visitor' && (
              <IconButton
                size="large"
                edge="start"
                color="primary"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo links to landing or home */}
            <Link href="/veilingDisplay" style={{ display: 'flex', alignItems: 'center' }}>
              <FloraLogo mode='small' />
            </Link>
          </Stack>

          <SearchBar mode="redirect" sx={{ width: '20vw', mx: 2 }} />

          <Stack direction="row" spacing={2} alignItems="center">
            {renderActions()}
          </Stack>

        </Toolbar>
      </AppBar>

      <SideMenu
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        mode={mode}
      />
    </Box>
  );
}
