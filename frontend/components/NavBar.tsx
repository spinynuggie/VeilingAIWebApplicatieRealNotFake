import { Button } from "@/components/Button";
import { AppBar, Toolbar, Box, Stack, Typography, IconButton, } from "@mui/material";
import { Person, Person as PersonIcon } from "@mui/icons-material";
import { FloraLogo } from "./FloraLogo";
import Link from "next/link";

type NavMode = 'visitor' | 'customer' | 'seller' | 'auctioneer';
interface NavBarProps {
  mode: NavMode; 
}

export function NavBar({mode}: NavBarProps) {
  const renderActions = () => {
    switch (mode) {
      case 'visitor':
          return (
            <>
              <Button variant="outlined" color="primary" component={Link} href="/login">Login</Button>
              <Button variant="outlined" color="primary" component={Link} href="/register">Registreren</Button>
            </>
      );
      case 'customer':
        return(
          <IconButton size="medium" color="primary" component={Link} href="klantProfile">
            <PersonIcon/>
          </IconButton>
        );
      case 'seller':
        return(
          <Button>seller</Button>
        )
      case 'auctioneer':
        return(
          <Button>auctioneer</Button>
        )
      default:
        return null;
    }
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="secondary" sx={{ boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box component={Link} href="/landing" sx={{ display: 'flex', alignItems: 'center' }}>
            <FloraLogo mode='small'/>
          </Box>
          <Stack direction="row" spacing={2}>
            {renderActions()}
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

