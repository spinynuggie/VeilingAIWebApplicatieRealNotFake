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
    IconButton,
    ListSubheader
} from "@mui/material";
import {
    Inventory as InventoryIcon,
    Gavel as GavelIcon,
    Person as PersonIcon,
    Dashboard as DashboardIcon,
    Add as AddIcon,
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

    // --- Helper Components for Link Groups ---

    // 1. Customer Links
    const CustomerLinks = () => (
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
                <ListItemButton component={Link} href="/klantProfile" onClick={onClose}>
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText primary="Profiel" />
                </ListItemButton>
            </ListItem>
        </>
    );

    // 2. Seller Links (excluding Profile to avoid duplicate if combined)
    const SellerLinks = ({ includeProfile = true }: { includeProfile?: boolean }) => (
        <>
            <ListItem disablePadding>
                <ListItemButton component={Link} href="/aanbiederDashboard" onClick={onClose}>
                    <ListItemIcon><DashboardIcon /></ListItemIcon>
                    <ListItemText primary="Aanbieder Dashboard" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton component={Link} href="/createProduct" onClick={onClose}>
                    <ListItemIcon><AddIcon /></ListItemIcon>
                    <ListItemText primary="Product Toevoegen" />
                </ListItemButton>
            </ListItem>
            {includeProfile && (
                <ListItem disablePadding>
                    <ListItemButton component={Link} href="/klantProfile" onClick={onClose}>
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        <ListItemText primary="Profiel" />
                    </ListItemButton>
                </ListItem>
            )}
        </>
    );

    // 3. Auctioneer/Admin Links
    const AuctioneerLinks = () => (
        <>
            <ListItem disablePadding>
                <ListItemButton component={Link} href="/veilingDashboard" onClick={onClose}>
                    <ListItemIcon><DashboardIcon /></ListItemIcon>
                    <ListItemText primary="Veiling Dashboard" />
                </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
                <ListItemButton component={Link} href="/veilingAanmaken" onClick={onClose}>
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

    const renderLinks = () => {
        switch (mode) {
            case 'customer':
                return <CustomerLinks />;

            case 'seller':
                return <SellerLinks />;

            case 'auctioneer':
                // Admin gets everything. Clean organized with headers.
                return (
                    <>
                        <ListSubheader sx={{ fontWeight: 'bold', bgcolor: 'transparent' }}>KLANT & BIEDINGEN</ListSubheader>
                        {/* We use the Customer set but maybe we rely on profile being in one of them or separate? 
                            Let's include Customer set fully first. */}
                        <CustomerLinks />

                        <Divider sx={{ my: 1 }} />
                        <ListSubheader sx={{ fontWeight: 'bold', bgcolor: 'transparent' }}>VERKOPER / AANBIEDER</ListSubheader>
                        {/* Exclude profile here since it's in Customer/Common section */}
                        <SellerLinks includeProfile={false} />

                        <Divider sx={{ my: 1 }} />
                        <ListSubheader sx={{ fontWeight: 'bold', bgcolor: 'transparent' }}>VEILINGMEESTER / ADMIN</ListSubheader>
                        <AuctioneerLinks />
                    </>
                );

            case 'visitor':
            default:
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
                sx: { width: 300 } // Slightly wider to accommodate longer titles or headers
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider />
            <List subheader={<li />}>
                {renderLinks()}
            </List>
        </Drawer>
    );
}
