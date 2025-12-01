"use client";

import ProductSearchBar from "@/components/ProductSearchBar";
import ProductCard from "@/components/ProductCard";
import { useVeilingAanmaken } from "@/hooks/useVeilingAanmaken";
// Importeer de CSS Module
import styles from "./veilingAanmaken.module.css";

const VeilingAanmakenPage = () => {
  const {
    loading,
    // availableProducts, (niet direct nodig in render, filtered wel)
    auctionProducts,
    selectedProduct,
    setSelectedProduct,
    handleSearch,
    handleAddToAuction,
    handleRemoveFromAuction,
    filteredAvailable
  } = useVeilingAanmaken();

  return (
    <div className={styles.container}>

      {/* --- KOLOM 1: BESCHIKBAAR --- */}
      <div className={styles.column}>
        <h3 className={styles.header}>Zoek naar producten</h3>
        <ProductSearchBar onSearch={handleSearch} />

        {loading ? (
          <p style={{ textAlign: 'center' }}>Laden...</p>
        ) : (
          <div>
            {filteredAvailable.map((prod) => (
              <div
                key={prod.productId}
                className={styles.cardItem}
                // We gebruiken inline style ALLEEN voor dynamische dingen (zoals de border kleur)
                style={{
                  borderColor: selectedProduct?.productId === prod.productId ? "#90B498" : "transparent"
                }}
              >
                <div style={{ flex: 1, paddingRight: '10px' }}>
                  <strong>{prod.productNaam}</strong><br />
                  <span style={{ fontSize: '12px' }}>Aantal: {prod.hoeveelheid}</span>
                </div>

                <button
                  className={styles.actionButton}
                  style={{ backgroundColor: "#888" }} // Specifieke kleur overschrijven
                  onClick={() => setSelectedProduct(prod)}
                >
                  →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- KOLOM 2: DETAIL KAART --- */}
      <div style={{ width: "350px" }}>
        {selectedProduct ? (
          <ProductCard
            mode="auction"
            onAction={handleAddToAuction}
            product={{
              title: selectedProduct.productNaam,
              description: selectedProduct.productBeschrijving,
              image: selectedProduct.fotos,
              specifications: [],
              price: 0
            }}
          />
        ) : (
          <div className={styles.placeholder}>
            Selecteer een product links
          </div>
        )}
      </div>

      {/* --- KOLOM 3: IN VEILING --- */}
      <div className={styles.column}>
        <h3 className={styles.header}>Producten in veiling</h3>
        <ProductSearchBar onSearch={handleSearch} />

        <div style={{ flexGrow: 1 }}>
          {auctionProducts.length === 0 && (
            <p style={{ textAlign: 'center', color: '#777', fontSize: '14px' }}>
              Nog geen producten toegevoegd.
            </p>
          )}

          {auctionProducts.map((prod) => (
            <div key={prod.productId} className={styles.cardItem}>
              <button
                className={styles.actionButton}
                style={{ backgroundColor: "#999", marginRight: "10px" }}
                onClick={() => handleRemoveFromAuction(prod)}
              >
                ✕
              </button>

              <div style={{ flex: 1 }}>
                <strong>{prod.productNaam}</strong><br />
                <span style={{ fontSize: '12px' }}>
                  Startprijs (Max): €{prod.startPrijs}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footerButtons}>
          <button className={styles.footerBtn}>Start</button>
          <button className={styles.footerBtn}>Eind</button>
          {/* Combineer basis class met specifieke createBtn class */}
          <button className={`${styles.footerBtn} ${styles.createBtn}`}>
            Aanmaken
          </button>
        </div>
      </div>

    </div>
  );
};

export default VeilingAanmakenPage;
