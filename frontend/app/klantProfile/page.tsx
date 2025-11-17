"use client";

import Image from "next/image";
import backgroundImage from "@/public/loginAssets/FloraHollandGebouw.svg";
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import EditableField from "@/components/EditableField";
import { Box, Typography, Grid, Button } from "@mui/material";
import { useState } from "react";

export default function KlantProfile() {
  const [movedAll, setMovedAll] = useState(false);
  const toggleAll = () => setMovedAll((v) => !v);

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
          transform: movedAll
            ? "translate(-50%, -50%) translateX(350px)"
            : "translate(-50%, -50%)",
          transition: "transform 400ms ease",
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
       
        
        {/* Titel */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 3,
            textAlign: "center",
          }}
        >
          Bedrijf
          <br />
          gegevens
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
              <EditableField label="Bedrijf naam" />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ width: "100%" }}>
              <EditableField label="KvK nummer" />
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
            <Box sx={{ width: "100%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              {/* Keep postcode compact so the right column can sit on the same row */}
              <Box sx={{ width: 260, minWidth: 0 }}>
                <EditableField label="Postcode" />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>


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
          transform: movedAll
            ? "translate(-50%, -50%) translateX(-350px)"
            : "translate(-50%, -50%)",
          transition: "transform 400ms ease",
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
        {/* Button moved next to the Huisnummer field */}
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
            <Box sx={{ width: "100%", display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <EditableField label="Postcode" />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ width: "100%", display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
              {/* Huisnummer compact on the right, button narrow */}
              <Box sx={{ width: 110, minWidth: 0 }}>
                <EditableField label="Huisnummer" />
              </Box>

              <Button
                size="small"
                variant="contained"
                
                onClick={toggleAll}
                sx={{
                  width: '130px',
                  backgroundColor: "#111",
                  borderRadius: "10px",
                  color: "#fff",
                  minWidth: 40,
                  height: 36,
                  mt: '25px',
                  padding: '6px 8px',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                  '&:hover': { backgroundColor: '#000' },
                }}
              >
                {movedAll ? "verkoper X" : "verkoper"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

    </div>

    </div>
    
  );
}
