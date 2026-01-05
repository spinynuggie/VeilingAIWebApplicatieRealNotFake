import { Product } from "@/types/product";
import ProductSearchBar from "@/components/(oud)/ProductSearchBar"

interface Props {
  loading: boolean;
  products: Product[];
  selectedId?: number;
  onSearch: (term: string) => void;
  onSelect: (product: Product) => void;
}

export function AvailableColumn({ loading, products, selectedId, onSearch, onSelect }: Props) {
  return (
    <div >
      <h3 >Zoek naar producten</h3>
      <ProductSearchBar onSearch={onSearch} />

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>Laden...</p>
      ) : (
        <div style={{ marginTop: '10px' }}>
          {products.map((prod) => (
            <div
              key={prod.productId}
              style={{
                borderColor: selectedId === prod.productId ? "#000" : "transparent"
              }}
            >
              <div style={{ flex: 1, paddingRight: '10px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{prod.productNaam}</div>
                <div style={{ fontSize: '13px', color: '#333' }}>Aantal: {prod.hoeveelheid}</div>
              </div>

              <button
                style={{ backgroundColor: "#90B498" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(prod);
                }}
              >
                →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
