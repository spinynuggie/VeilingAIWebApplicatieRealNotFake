// app/(admin)/locaties/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Box as BoxMui, Grid } from "@mui/material";
import { Box } from "@/components/Box";
import { Background } from "@/components/Background";
import AppNavbar from "@/features/(NavBar)/AppNavBar";
import RequireAuth from "@/components/(oud)/RequireAuth";
import LocatieFormCard from "@/features/LocatieBeheer/LocatieFormCard";
import LocatieListCard from "@/features/LocatieBeheer/LocatieListCard";
import { getLocaties, Locatie } from "@/services/locatieService";

export default function LocatiePage() {
  const [locaties, setLocaties] = useState<Locatie[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocaties = async () => {
    setLoading(true);
    try {
      const data = await getLocaties();
      setLocaties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocaties();
  }, []);

  return (
    <RequireAuth roles={["ADMIN", "VEILINGMEESTER"]}>
      <Background>
        <AppNavbar />
        <BoxMui sx={{ display: "flex", justifyContent: "center", width: "100%", pt: 6, px: 4 }}>
          <Grid container spacing={4} sx={{ maxWidth: "1200px" }}>
            {/* Links: Het Formulier in een Box */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <LocatieFormCard onSuccess={fetchLocaties} />
              </Box>
            </Grid>

            {/* Rechts: De Lijst in een Box */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <LocatieListCard locaties={locaties} loading={loading} />
              </Box>
            </Grid>
          </Grid>
        </BoxMui>
      </Background>
    </RequireAuth>
  );
}