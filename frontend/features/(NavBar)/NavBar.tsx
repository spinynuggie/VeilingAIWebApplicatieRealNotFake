"use client";

import { AppBar, Toolbar, Box, Stack, IconButton } from "@mui/material";
import { Person as PersonIcon,
  Logout as LogoutIcon,
  Gavel as GavelIcon,
  LocalFlorist as FlowerIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  AlignHorizontalLeft as AlignHorizontalIcon,
} from "@mui/icons-material";
import { Button } from "@/components/Buttons/Button"; // Your custom button
import { CreateVeilingButton } from "@/components/Buttons/CreateVeilingButton";
import Link from "next/link";
import { FloraLogo } from "@/components/FloraLogo";
import SearchBar from "@/components/SearchBar";

export type NavMode = 'visitor' | 'customer' | 'seller' | 'auctioneer';

interface NavBarProps {
  mode: NavMode;
  onLogout?: () => void; // Function passed from the logic layer
}

export function NavBar({ mode, onLogout }: NavBarProps) {
  
  const renderActions = () => {
    switch (mode) {
      case 'visitor':
        return (
          <>
            <Button variant="outlined" color="primary" component={Link} href="/login">Login</Button>
            <Button variant="contained" color="primary" component={Link} href="/register">Registreren</Button>
          </>
        );

      case 'customer':
        return (
          <>
            <IconButton color="primary" component={Link} href="/veilingDisplay">
              <GavelIcon />
            </IconButton>
            <IconButton color="primary" component={Link} href="/klantProfile">
             <PersonIcon />
            </IconButton>
            <IconButton onClick={onLogout} color="error">
              <LogoutIcon />
            </IconButton>
          </>
        );

      case 'seller':
        return (
          <>
          <IconButton color="primary" component={Link} href="/createProduct">
            <AddIcon/>
          </IconButton>
          <IconButton color="primary" component={Link} href="/myProducts">
            <FlowerIcon/>
          </IconButton>
          <IconButton color="primary" component={Link} href="/klantProfile">
            <PersonIcon />
          </IconButton>
          <IconButton onClick={onLogout} color="error">
            <LogoutIcon />
          </IconButton>
          </>
        );

      case 'auctioneer':
        return (
          <>
          <CreateVeilingButton/>
            <IconButton color="primary" component={Link} href="/veilingDashboard">
              <GavelIcon />
            </IconButton>
            <IconButton color="primary" component={Link} href="/admin">
              <DashboardIcon />
            </IconButton>
            <IconButton color="primary" component={Link} href="/specificaties">
              <AlignHorizontalIcon/>
            </IconButton>
            <IconButton onClick={onLogout} color="error">
              <LogoutIcon />
            </IconButton>
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
          
          {/* Logo links to landing or home */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <FloraLogo mode='small'/>
          </Link>

          <SearchBar mode="redirect" sx={{ width: '20vw'}}/>

          <Stack direction="row" spacing={2} alignItems="center">
            {renderActions()}
          </Stack>
          
        </Toolbar>
      </AppBar>
    </Box>
  );
}