"use client";

import { useState } from "react";
import ProductForm, { ProductData } from "@/app/(Aanbieder)/createProduct/ProductForm/index";
import ProductCard from "@/features/ProductCard";
import RequireAuth from "@/components/(oud)/RequireAuth";
import AppNavbar from "@/features/(NavBar)/AppNavBar";
import { Box as BoxMui } from "@mui/material"
import { Background } from "@/components/Background";

export default function Page() {
  // HIER IS DE SINGLE SOURCE OF TRUTH
  const [formData, setFormData] = useState<ProductData>({
    name: "",
    description: "",
    quantity: "",
    price: "",
    specifications: [],    // For ProductCard (Strings)
    specificationIds: [],  // For Backend (Numbers)
    image: "",
    locationId: "",
  });

  return (
    <Background>
      <RequireAuth roles={["ADMIN", "VERKOPER"]}>
        <AppNavbar />

        <BoxMui
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "60px",
            padding: "60px 40px",
            maxWidth: "1400px",
            margin: "0 auto",
            flexWrap: "wrap",
          }}
        >
          {/* LINKER KANT: Het Formulier */}
          <BoxMui >
            <ProductForm formData={formData} setFormData={setFormData} />
          </BoxMui>

          {/* RECHTER KANT: De Kaart */}
          <BoxMui style={{ flex: "0 0 auto" }}>
            <ProductCard mode="create" product={formData} />
          </BoxMui>
        </BoxMui>
      </RequireAuth>
    </Background>
  );
}