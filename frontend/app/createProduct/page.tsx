"use client";
import AppNavbar from "@/components/AppNavbar";
import ProductForm from "@/components/ProductForm";

export default function Page() {
  return (
    <main>
      <AppNavbar />
      <div style={{ marginTop: '20px' }}> 
        <ProductForm />
      </div>
    </main>
  );
}

