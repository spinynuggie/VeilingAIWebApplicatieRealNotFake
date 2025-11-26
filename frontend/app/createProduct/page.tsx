"use client";

import AppNavbar from "@/components/AppNavbar";
import ProductForm from "@/components/ProductForm";
import ProductCard from "@/components/ProductCard";

export default function Page() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {/* De Header staat bovenaan */}
      <AppNavbar />

      {/* De Layout Container */}
      <div
        style={{
          display: "flex",            // Zet items naast elkaar
          justifyContent: "center",   // Centreert alles horizontaal op het scherm
          alignItems: "flex-start",   // Zorgt dat ze allebei aan de bovenkant beginnen
          gap: "60px",                // De ruimte tussen het formulier en de kaart
          padding: "60px 40px",       // Ruimte aan de boven/onder en zijkanten
          maxWidth: "1400px",         // Maximale breedte zodat het niet te wijd wordt op grote schermen
          margin: "0 auto",           // Centreert de container zelf
          flexWrap: "wrap",           // Als het scherm te klein is (mobiel), gaan ze onder elkaar
        }}
      >
        {/* LINKER KANT: Het Formulier */}
        {/* flex: 1 betekent: neem alle overgebleven ruimte in */}
        <div style={{ flex: "1", minWidth: "500px" }}>
          <ProductForm />
        </div>

        {/* RECHTER KANT: De Kaart */}
        {/* flex: 0 0 auto betekent: groei niet, krimp niet, behoud je eigen breedte */}
        <div style={{ flex: "0 0 auto" }}>
          <ProductCard />
        </div>
      </div>
    </main>
  );
}