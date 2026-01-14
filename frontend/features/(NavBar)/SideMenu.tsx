"use client";

import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    IconButton
} from "@mui/material";
import {
    Inventory as InventoryIcon,
    Gavel as GavelIcon,
    Visibility as VisibilityIcon,
    Person as PersonIcon,
    Dashboard as DashboardIcon,
    Add as AddIcon,
    LocalFlorist as LocalFloristIcon,
    Receipt as ReceiptIcon,
    AddCircle as AddCircleIcon,
    Tune as TuneIcon,
    Place as PlaceIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    Close as CloseIcon
} from "@mui/icons-material";
import Link from "next/link";
import { NavMode } from "./NavBar";

interface SideMenuProps {
    open: boolean;
    onClose: () => void;
    mode: NavMode;
}

export default function SideMenu({ open, onClose, mode }: SideMenuProps) {

    const renderLinks = () => {
        switch (mode) {
            case 'customer':
                return (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/mijnBiedingen" onClick={onClose}>
                                <ListItemIcon><InventoryIcon /></ListItemIcon>
                                <ListItemText primary="Mijn Biedingen" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/veilingDisplay" onClick={onClose}>
                                <ListItemIcon><GavelIcon /></ListItemIcon>
                                <ListItemText primary="Veilingen" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/watchlist" onClick={onClose}>
                                <ListItemIcon><VisibilityIcon /></ListItemIcon>
                                <ListItemText primary="Watchlist" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/klantProfile" onClick={onClose}>
                                <ListItemIcon><PersonIcon /></ListItemIcon>
                                <ListItemText primary="Profiel" />
                            </ListItemButton>
                        </ListItem>
                    </>
                );

            case 'seller':
                return (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/aanbiederDashboard" onClick={onClose}>
                                <ListItemIcon><DashboardIcon /></ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/createProduct" onClick={onClose}>
                                <ListItemIcon><AddIcon /></ListItemIcon>
                                <ListItemText primary="Product Toevoegen" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/myProducts" onClick={onClose}>
                                <ListItemIcon><LocalFloristIcon /></ListItemIcon>
                                <ListItemText primary="Mijn Producten" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/sales" onClick={onClose}>
                                <ListItemIcon><ReceiptIcon /></ListItemIcon>
                                <ListItemText primary="Verkoopoverzicht" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/klantProfile" onClick={onClose}>
                                <ListItemIcon><PersonIcon /></ListItemIcon>
                                <ListItemText primary="Profiel" />
                            </ListItemButton>
                        </ListItem>
                    </>
                );

            case 'auctioneer':
                return (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/veilingDashboard" onClick={onClose}>
                                <ListItemIcon><DashboardIcon /></ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/createVeiling" onClick={onClose}>
                                <ListItemIcon><AddCircleIcon /></ListItemIcon>
                                <ListItemText primary="Veiling Aanmaken" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/specificaties" onClick={onClose}>
                                <ListItemIcon><TuneIcon /></ListItemIcon>
                                <ListItemText primary="Specificaties Beheer" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/locaties" onClick={onClose}>
                                <ListItemIcon><PlaceIcon /></ListItemIcon>
                                <ListItemText primary="Locatie Beheer" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/admin" onClick={onClose}>
                                <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                                <ListItemText primary="Admin Panel" />
                            </ListItemButton>
                        </ListItem>
                    </>
                );

            case 'visitor':
            default:
                // Visitors primarily use the Navbar for Login/Register, but we can show basic links here if needed.
                // For now, returning null or basic Home link as per plan strategy (Auth in Navbar).
                return (
                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/" onClick={onClose}>
                            <ListItemText primary="Home" />
                        </ListItemButton>
                    </ListItem>
                );
        }
    };

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: 280 } // Fixed width for a standard sidebar feel
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider />
            <List>
                {renderLinks()}
            </List>
        </Drawer>
    );
}
