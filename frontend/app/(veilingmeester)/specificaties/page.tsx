"use Client"

import { Box } from "@/components/Box"
import { Box as BoxMui } from "@mui/material";
import { Background } from "@/components/Background";
import AppNavbar from "@/features/(NavBar)/AppNavBar";
import SpecifcatiesCard from "@/features/SpecificatiesCard/SpecificatiesCard"

export default function Specificaties(){
  return(
    <>
    <AppNavbar/>
    <BoxMui sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 2, 
        p: 4, 
        justifyContent: 'center', 
        alignItems: 'flex-start', 
        width: '100%',
        mt: 4
      }}>
    <Box>
      <SpecifcatiesCard/>
    </Box>
    </BoxMui>
    </>
  )
}