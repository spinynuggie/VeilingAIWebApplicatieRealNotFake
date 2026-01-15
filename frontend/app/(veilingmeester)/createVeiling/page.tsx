"use client";

import { useState } from "react";
import VeilingForm, { VeilingData } from "@/app/(veilingmeester)/createVeiling/VeilingForm/index";
import RequireAuth from "@/components/(oud)/RequireAuth";
import AppNavbar from "@/features/(NavBar)/AppNavBar";
import { Box as BoxMui } from "@mui/material";
import { Background } from "@/components/Background";
import { useAuth } from "@/components/AuthProvider";

export default function CreateVeilingPage() {
    const { user } = useAuth();

    // HIER IS DE SINGLE SOURCE OF TRUTH
    const [formData, setFormData] = useState<VeilingData>({
        naam: "",
        beschrijving: "",
        image: "",
        starttijd: "",
        eindtijd: "",
        locatieId: "",
        veilingMeesterId: user ? user.gebruikerId : "",
    });

    return (
        <Background>
            <RequireAuth roles={["ADMIN", "VEILINGMEESTER"]}>
                <AppNavbar />

                <BoxMui
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        padding: "60px 40px",
                        maxWidth: "1400px",
                        margin: "0 auto",
                    }}
                >
                    <VeilingForm formData={formData} setFormData={setFormData} />
                </BoxMui>
            </RequireAuth>
        </Background>
    );
}
