import Image from "next/image";
import backgroundImage from "@/public/loginAssets/FloraHollandGebouw.svg";
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import EditableField from "@/components/EditableField";
import { Box, Typography, Grid } from "@mui/material";

export default function KlantProfile() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Achtergrondafbeelding */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      >
        <Image
          src={backgroundImage}
          alt="achtergrondfoto van floraholland hoofdkantoor"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          quality={100}
          priority
        />
      </div>

      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxSizing: "border-box",
          width: "650px",
          maxWidth: "90vw",
          background: "linear-gradient(to bottom, #ffffff, #E2FFE9);",
          borderRadius: "16px",
          padding: "40px 52px",
          boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Image
          src={royalLogo}
          alt="Royal Flora Holland Logo"
          width={160}
          height={65}
          style={{ marginBottom: "12px" }}
        />

        {/* Titel */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 3,
            textAlign: "center",
          }}
        >
          Klantgegevens
        </Typography>

        {/* Velden */}
        <Grid
          container
          spacing={2.5}
          sx={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Grid item xs={12} sm={6}>
            <Box sx={{ width: "100%" }}>
              <EditableField label="Naam" />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ width: "100%" }}>
              <EditableField label="Email" />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ width: "100%" }}>
              <EditableField label="Woonplaats" />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ width: "100%" }}>
              <EditableField label="Straat" />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ width: "100%" }}>
              <EditableField label="Huisnummer" />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ width: "100%" }}>
              <EditableField label="Postcode" />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}
