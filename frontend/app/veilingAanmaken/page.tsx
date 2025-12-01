"use client";

import React, { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getProducts, updateProductAuctionData  } from "@/services/productService";
import ProductSearchBar from "@/components/ProductSearchBar";
import ProductCard from "@/components/ProductCard";

// Dit is het ID van de veiling waar we producten in stoppen (zoals gevraagd: 1)
const CURRENT_VEILING_ID = 1;

const VeilingAanmakenPage = () => {
  // State voor linker kolom (Beschikbaar)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [filteredAvailable, setFilteredAvailable] = useState<Product[]>([]);

  // State voor rechter kolom (In veiling)
  const [auctionProducts, setAuctionProducts] = useState<Product[]>([]);

  // State voor midden (Geselecteerd)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);

  // --- 1. DATA OPHALEN ---
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProducts();

        // Splitsen: Links = ID 0, Rechts = ID 1
        const leftList = data.filter((p) => p.veilingId === 0);
        const rightList = data.filter((p) => p.veilingId === CURRENT_VEILING_ID);

        setAvailableProducts(leftList);
        setFilteredAvailable(leftList);
        setAuctionProducts(rightList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- 2. ZOEKEN (Links) ---
  const handleSearch = (term: string) => {
    const lowerTerm = term.toLowerCase();
    const results = availableProducts.filter((p) =>
      p.productNaam.toLowerCase().includes(lowerTerm)
    );
    setFilteredAvailable(results);
  };

  // --- 3. TOEVOEGEN (Links -> Rechts) ---
  const handleAddToAuction = async (maxPrice: number) => {
    if (!selectedProduct) return;

    try {
        // API Call: Zet veilingId op 1 en sla Max prijs op (als startPrijs)
        await updateProductAuctionData({
            productId: selectedProduct.productId,
            veilingId: CURRENT_VEILING_ID,
            startPrijs: maxPrice, // Max input = Startprijs
            eindPrijs: 0          // Min input (of default)
        });

        // State Update
        const updatedProduct = {
            ...selectedProduct,
            veilingId: CURRENT_VEILING_ID,
            startPrijs: maxPrice
        };

        // Verwijder links
        const newAvailable = availableProducts.filter(p => p.productId !== selectedProduct.productId);
        setAvailableProducts(newAvailable);
        setFilteredAvailable(newAvailable); // Update ook de gefilterde lijst

        // Voeg toe rechts
        setAuctionProducts([...auctionProducts, updatedProduct]);

        // Reset midden
        setSelectedProduct(null);

    } catch (e) {
        console.error("Fout bij toevoegen:", e);
        alert("Er ging iets mis bij het opslaan.");
    }
  };

  // --- 4. VERWIJDEREN (Rechts -> Links) ---
  const handleRemoveFromAuction = async (productToRemove: Product) => {
    try {
        // API Call: Zet veilingId terug naar 0
        await updateProductAuctionData({
            productId: productToRemove.productId,
            veilingId: 0,
            startPrijs: 0, // Reset prijzen optioneel
            eindPrijs: 0
        });

        // State Update
        const resetProduct = { ...productToRemove, veilingId: 0 };

        // Verwijder rechts
        setAuctionProducts(auctionProducts.filter(p => p.productId !== productToRemove.productId));

        // Voeg toe links
        const newAvailable = [...availableProducts, resetProduct];
        setAvailableProducts(newAvailable);
        // Als er niet gezocht wordt, update direct de zichtbare lijst.
        // (Simpelheidshalve resetten we hier de filter of voegen we hem toe aan de huidige filter)
        setFilteredAvailable((prev) => [...prev, resetProduct]);

    } catch (e) {
        console.error("Fout bij verwijderen:", e);
        alert("Kon product niet verwijderen uit veiling.");
    }
  };

  // --- STYLES ---
  const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        padding: "40px 20px",
        gap: "20px",
        backgroundColor: "#F0FDF4",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif"
    },
    column: {
      backgroundColor: "#D1FADF",
      borderRadius: "15px",
      padding: "20px",
      width: "350px",
      height: "80vh",
      display: "flex",
      flexDirection: "column" as const,
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      overflowY: "auto" as const,
    },
    header: {
        textAlign: "center" as const,
        fontWeight: "bold",
        marginBottom: "15px",
        color: "#333"
    },
    cardItem: {
      backgroundColor: "#E0E0E0",
      borderRadius: "10px",
      padding: "15px",
      marginBottom: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: "80px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      cursor: "pointer",
      border: "2px solid transparent"
    },
    actionButton: {
      border: "none",
      color: "white",
      borderRadius: "5px",
      width: "30px",
      height: "50px",
      fontSize: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer"
    },
    footerButtons: {
        marginTop: "auto",
        display: "flex",
        gap: "10px",
        paddingTop: "20px"
    },
    footerBtn: {
        flex: 1,
        padding: "10px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
        backgroundColor: "#AEDCB8"
    }
  };

  return (
    <div style={styles.container}>

      {/* --- KOLOM 1: BESCHIKBAAR --- */}
      <div style={styles.column}>
        <h3 style={styles.header}>Zoek naar producten</h3>
        <ProductSearchBar onSearch={handleSearch} />

        {loading ? <p style={{textAlign:'center'}}>Laden...</p> : (
          <div>
            {filteredAvailable.map((prod) => (
              <div
                key={prod.productId}
                style={{
                    ...styles.cardItem,
                    borderColor: selectedProduct?.productId === prod.productId ? "#90B498" : "transparent"
                }}
              >
                <div style={{ flex: 1, paddingRight: '10px' }}>
                  <strong>{prod.productNaam}</strong><br/>
                  <span style={{fontSize: '12px'}}>Aantal: {prod.hoeveelheid}</span>
                </div>

                <button
                    style={{...styles.actionButton, backgroundColor: "#888"}}
                    onClick={() => setSelectedProduct(prod)}
                >
                    →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- KOLOM 2: DETAIL KAART (Veiling Modus) --- */}
      <div style={{ width: "350px" }}> {/* Wrapper voor vaste breedte */}
        {selectedProduct ? (
            <ProductCard
                mode="auction" // Zorgt dat je alleen MAX kan editen
                onAction={handleAddToAuction}
                product={{
                    title: selectedProduct.productNaam,
                    description: selectedProduct.productBeschrijving,
                    image: selectedProduct.fotos,
                    specifications: [], // of selectedProduct.specificaties
                    price: 0
                }}
            />
        ) : (
            <div style={{
                height: "500px",
                border: "2px dashed #90B498",
                borderRadius: "15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                backgroundColor: "rgba(255,255,255,0.5)"
            }}>
                Selecteer een product links
            </div>
        )}
      </div>

      {/* --- KOLOM 3: IN VEILING (ID 1) --- */}
      <div style={styles.column}>
        <h3 style={styles.header}>Producten in veiling</h3>

        <div style={{flexGrow: 1}}>
            {auctionProducts.length === 0 && <p style={{textAlign:'center', color:'#777', fontSize:'14px'}}>Nog geen producten toegevoegd.</p>}

            {auctionProducts.map((prod) => (
                <div key={prod.productId} style={styles.cardItem}>
                    {/* Verwijder knop (Kruisje) */}
                    <button
                        style={{...styles.actionButton, backgroundColor: "#999", marginRight: "10px"}}
                        onClick={() => handleRemoveFromAuction(prod)}
                    >
                        ✕
                    </button>

                    <div style={{ flex: 1 }}>
                        <strong>{prod.productNaam}</strong><br/>
                        <span style={{fontSize: '12px'}}>
                            Startprijs (Max): €{prod.startPrijs}
                        </span>
                    </div>
                </div>
            ))}
        </div>

        <div style={styles.footerButtons}>
            <button style={styles.footerBtn}>Start</button>
            <button style={styles.footerBtn}>Eind</button>
            <button style={{...styles.footerBtn, backgroundColor: "#90B498", color: "white"}}>Aanmaken</button>
        </div>
      </div>

    </div>
  );
};

export default VeilingAanmakenPage;
