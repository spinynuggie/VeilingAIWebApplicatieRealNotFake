import { Button } from "@/components/Button";
import { AppBar, Toolbar, Box, Stack, Typography } from "@mui/material";

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
              <Button variant="outlined" color="primary">Login</Button>
              <Button variant="outlined" color="primary">Registreren</Button>
            </>
      );
      case 'customer':
        return(
          <Button>customer</Button>
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
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            FLORA
          </Typography>

          <Stack direction="row" spacing={2}>
            {renderActions()}
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

