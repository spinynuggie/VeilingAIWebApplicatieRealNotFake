"use client";

import { useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import ProductForm, { ProductData } from "@/app/(Aanbieder)/createProduct/ProductForm/index";
import ProductCard from "@/app/(Aanbieder)/createProduct/ProductCard/index";

export default function Page() {
  // HIER IS DE SINGLE SOURCE OF TRUTH
  const [formData, setFormData] = useState<ProductData>({
    name: "",
    description: "",
    quantity: "",
    price: "",
    specifications: [],
    image: "",
  });

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <AppNavbar />

      <div
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
        <div style={{ flex: "1", minWidth: "500px" }}>
          {/* We geven de data en de update-functie door */}
          <ProductForm formData={formData} setFormData={setFormData} />
        </div>

        {/* RECHTER KANT: De Kaart */}
        <div style={{ flex: "0 0 auto" }}>
          {/* We geven de data door om te lezen */}
          <ProductCard mode="create" product={formData} />
        </div>
      </div>
    </main>
  );
}
