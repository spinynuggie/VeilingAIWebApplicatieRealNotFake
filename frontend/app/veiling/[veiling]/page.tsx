  "use client";

  import { useEffect, useState } from "react";
  import { usePathname } from "next/navigation";
  import { Veiling } from '@/types/veiling';
  import { getVeilingen } from "@/services/veilingService";
  import Navbar from "@/components/NavBar";
  import SearchBar from "@/components/SearchBar";
  import royalLogo from "@/public/loginAssets/royalLogo.svg";
  import ProductDisplay from "@/components/ProductDisplay";
  import { getProducts } from "@/services/productService";
  import Profile  from "@/components/Profile";
  import SingleProduct from "@/components/SingleProduct";
  import { Box } from "@mui/material"
  import RequireAuth from "@/components/RequireAuth";
  import ProductCard from "@/components/ProductCard";
  import {VeilingKlok} from "@/components/VeilingKlok";

  export default function VeilingDetailPage() {
    const [veiling, setVeiling] = useState<Veiling | null>(null);
    const [allProducts, setAllProducts] = useState<any[]>([]); // Even hernoemd voor duidelijkheid
    const [error, setError] = useState<string>("");

    const pathname = usePathname();
    const id = parseInt(pathname.split('/').pop() || '0');

    // 1. Producten ophalen
    useEffect(() => {
      getProducts()
        .then(data => {
          console.log("Alle producten geladen:", data); // DEBUG
          setAllProducts(data);
        })
        .catch(console.error);
    }, []);

    // 2. Veiling ophalen
    useEffect(() => {
      if (!id || id === 0) {
        setError("Invalid ID");
        return;
      }
      getVeilingen()
        .then(data => {
          const found = data.find((v: Veiling) => v.veilingId === id);
          if (!found) setError(`No veiling found with id ${id}`);
          else setVeiling(found);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setError(err.message);
        });
    }, [id]);

    if (error) return <p>Error: {error}</p>;
    if (!veiling) return <p>Loading... (looking for id: {id})</p>;

    // --- FILTER LOGICA ---

    // DEBUG: Check hoe het veld heet in het eerste product
    if (allProducts.length > 0) {
      const p = allProducts[0];
      console.log("Check veldnamen van product:", Object.keys(p));
      console.log(`Product veilingId waarde: ${p.veilingId} (Type: ${typeof p.veilingId})`);
      console.log(`Huidige Veiling ID: ${veiling.veilingId} (Type: ${typeof veiling.veilingId})`);
    }

    const filteredProducts = allProducts.filter((p) => {
      // We gebruiken String() conversie voor de zekerheid, dan maakt int/string niet uit
      return String(p.veilingId) === String(veiling.veilingId);
    });

    console.log(`Aantal matches gevonden: ${filteredProducts.length}`);

    return (
      <RequireAuth>
        <div style={{background: "white" }}>
          <Navbar
            style={{ backgroundColor: "#C8FFD6"}}
            left={<img src={royalLogo.src} alt="Logo Royal Flora Holland" width={100}/>}
            center={<SearchBar/>}
            right={<Profile/>}
          />

          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, justifyContent: 'center', paddingY: 4 }}>

            {/* DE SINGLE CARD */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center',}}>
              {filteredProducts.length > 0 ? (
                // Als hier 1+ items zijn, MOET hij de card renderen.
                // Zo niet, dan is er iets mis IN <ProductCard /> zelf.
                <ProductCard mode="display" product={filteredProducts[0]} />
              ) : (
                <p>Geen producten gevonden voor veiling {veiling.veilingId}.</p>
              )}
            </Box>

            <VeilingKlok startPrice={12} endPrice={5} duration={10}/>
            <ProductDisplay product={filteredProducts.slice(1)} />
          </Box>

          <p>naam: {veiling.naam}; veilingId: {veiling.veilingId};</p>
        </div>
      </RequireAuth>
    );
  }
