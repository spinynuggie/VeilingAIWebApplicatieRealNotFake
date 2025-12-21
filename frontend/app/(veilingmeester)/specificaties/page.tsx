"use client";

import { Box } from "@/components/Box";
import { Box as BoxMui } from "@mui/material";
import { Background } from "@/components/Background";
import AppNavbar from "@/features/(NavBar)/AppNavBar";
import SpecifcatiesCard from "@/features/SpecificatiesCard";
import RequireAuth  from "@/components/(oud)/RequireAuth"

export default function Specificaties() {
  return (
  <RequireAuth roles = {["ADMIN", "VEILINGMEESTER"]}>                            
    <Background>
      <AppNavbar />
      <BoxMui
        sx={{
          display: "flex",
          justifyContent: "center", 
          alignItems: "flex-start", 
          width: "100%",
          pt: 6, 
          px: 2,
        }}
      >
        <Box>
          <SpecifcatiesCard />
        </Box>
      </BoxMui>
    </Background>
  </RequireAuth>
  );
}