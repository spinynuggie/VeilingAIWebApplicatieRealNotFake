"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Veiling } from '@/types/veiling';
import { getVeilingen } from "@/services/veilingService"; // <-- Added necessary import
import Navbar from "@/components/NavBar";
import SearchBar from "@/components/SearchBar";
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import ProductDisplay from "@/components/ProductDisplay";
import { getProducts } from "@/services/productService";
import { Product } from "@/types/product";
import Profile  from "@/components/Profile";

export default function VeilingDetailPage() {
  const [veiling, setVeiling] = useState<Veiling | null>(null);
  const [product, setProduct] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  // Get ID from URL path
  const pathname = usePathname();
  const id = parseInt(pathname.split('/').pop() || '0');

  useEffect(() => {
    getProducts()
      .then(setProduct)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!id || id === 0) {
      setError("Invalid ID");
      return;
    }

    getVeilingen()
      .then(data => {
        const found = data.find((v: Veiling) => v.veilingId === id);

        if (!found) {
          setError(`No veiling found with id ${id}`);
        } else {
          setVeiling(found);
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError(err.message);
      });
  }, [id]);

  if (error) return <p>Error: {error}</p>;
  if (!veiling) return <p>Loading... (looking for id: {id})</p>;

  return (
    <div style={{background: "white" }}>
      <Navbar
        style={{ backgroundColor: "#C8FFD6"}}
        left={
          <img src={royalLogo.src} alt="Logo Royal Flora Holland" width={100}/>
        }
        center={
          <SearchBar/>
        }
        right={
          <Profile/>
        }
        ></Navbar>
      <p>naam: {veiling.naam}; veilingId: {veiling.veilingId};</p>
      <ProductDisplay product={product}/>
    </div>
  );
}
