import React from "react";
import { Grid, Button, Typography } from "@mui/material";
import floraHollandKantoor from "./assets/loginAssets/floraHollandKantoor.png";
import royalLogo from "./assets/loginAssets/royalLogo.png";

function App() {
  const handleClick = () => {
    console.log("Button clicked!");
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left half - Image */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          width: {md: "50vw"},
        }}
      >
        <img
        src={floraHollandKantoor}
        alt="floraholland hoofdkantoor"
        style={{
        width: "100%",           // scale to fill the column width
        height: "100%",          // scale to fill the column height
        objectFit: "cover",      // crop excess, maintain aspect ratio
    }}
  />
      </Grid>

      {/* Right half - Text and Buttons */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          width: {md: "50vw"},
          background: "linear-Gradient(to top, #E2FFE9 0%, #E2FFE9 70% , #FFFFFF 100%)",
        }}
      >
        <img
          src={royalLogo}
          alt="royalFloraHolland Logo"
          style={{    
        }}
      />
          <Typography variant="h3" gutterBottom>
          Welcome
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleClick}
          sx={{ marginTop: 2 }}
        >
          Click Me I wont Explore
        </Button>
      </Grid>
    </Grid>
  );
}

export default App;
