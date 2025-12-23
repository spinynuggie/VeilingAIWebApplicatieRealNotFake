"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HubConnection } from "@microsoft/signalr";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Veiling } from "@/types/veiling";
import { getVeilingen } from "@/services/veilingService";
import Navbar from "@/features/(NavBar)/AppNavBar";
import SearchBar from "@/features/(NavBar)/AppNavBar";
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import ProductDisplay from "@/components/(oud)/ProductDisplay";
import { getProducts } from "@/services/productService";
import Profile from "@/components/(oud)/Profile";
import RequireAuth from "@/components/(oud)/RequireAuth";
import ProductCard from "@/features/ProductCard";
import { VeilingKlok } from "@/components/(oud)/VeilingKlok";
import {
  AuctionStateEvent,
  BidEvent,
  sendBid,
  startAuctionConnection,
  stopAuctionConnection,
} from "@/services/auctionRealtime";
import { getPriceHistory } from "@/services/priceHistoryService";
import { HistoricalPricePoint, HistoricalPriceResponse } from "@/types/priceHistory";

export default function VeilingDetailPage() {
  const [veiling, setVeiling] = useState<Veiling | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [lastBid, setLastBid] = useState<BidEvent | null>(null);
  const [liveState, setLiveState] = useState<AuctionStateEvent | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>("");
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string>("");
  const [priceHistory, setPriceHistory] = useState<HistoricalPriceResponse | null>(null);

  const pathname = usePathname();
  const id = parseInt(pathname.split("/").pop() || "0");

  useEffect(() => {
    getProducts()
      .then((data) => setAllProducts(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!id || id === 0) {
      setError("Invalid ID");
      return;
    }
    getVeilingen()
      .then((data) => {
        const found = data.find((v: Veiling) => v.veilingId === id);
        if (!found) setError(`No veiling found with id ${id}`);
        else setVeiling(found);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
      });
  }, [id]);

  useEffect(() => {
    if (!veiling) return;

    let disposed = false;
    let activeConnection: HubConnection | null = null;

    setLiveStatus("Verbinden met live veiling...");
    startAuctionConnection(String(veiling.veilingId), {
      onBid: (bid: BidEvent) => {
        setLastBid(bid);
        setLiveState((prev) =>
          prev
            ? {
                ...prev,
                currentPrice: bid.amount,
                lastBidPrice: bid.amount,
                remainingQuantity: bid.remainingQuantity ?? prev.remainingQuantity,
                status: bid.status ?? prev.status,
              }
            : prev
        );
      },
      onTick: (tick: AuctionStateEvent) => setLiveState(tick),
      onState: (state: AuctionStateEvent) => setLiveState(state),
    })
      .then((conn) => {
        if (disposed) {
          stopAuctionConnection(conn);
          return;
        }
        activeConnection = conn;
        setConnection(conn);
        setLiveStatus("Live verbonden");
      })
      .catch((err) => {
        console.error("Kon geen live verbinding maken:", err);
        setLiveStatus("Live verbinding mislukt");
      });

    return () => {
      disposed = true;
      setConnection(null);
      stopAuctionConnection(activeConnection);
    };
  }, [veiling?.veilingId]);

  if (error) return <p>Error: {error}</p>;
  if (!veiling) return <p>Loading... (looking for id: {id})</p>;

  const filteredProducts = allProducts.filter((p) => {
    return String(p.veilingId) === String(veiling.veilingId);
  });

  const activeProductId = liveState?.activeProductId ?? veiling.actiefProductId ?? null;
  const activeProduct = activeProductId
    ? filteredProducts.find((p) => p.productId === activeProductId) ?? filteredProducts[0]
    : filteredProducts[0];
  const secondaryProducts = activeProduct
    ? filteredProducts.filter((p) => p.productId !== activeProduct.productId)
    : filteredProducts.slice(1);

  const clockStatus = liveState?.status ?? (activeProduct ? "not_started" : "no_active_product");
  const clockPrice = liveState?.currentPrice ?? Number(activeProduct?.startPrijs ?? 0);
  const lastBidPrice = liveState?.lastBidPrice ?? (lastBid?.amount ?? null);
  const remainingQuantity = liveState?.remainingQuantity ?? activeProduct?.hoeveelheid;
  const startTime = liveState?.starttijd ?? veiling.starttijd;
  const endTime = liveState?.eindtijd ?? veiling.eindtijd;

  const handleLiveBid = async (price: number, quantity: number) => {
    if (!veiling) return;
    if (!activeProduct) {
      setLiveStatus("Geen actief product gevonden.");
      return;
    }
    if (!connection) {
      setLiveStatus("Geen live verbinding, probeer te refreshen.");
      return;
    }

    setLiveStatus("Bod versturen...");
    try {
      await sendBid(connection, String(veiling.veilingId), activeProduct.productId, price, quantity);
      setLiveStatus("Bod verstuurd");
    } catch (err) {
      console.error("Bod mislukt:", err);
      setLiveStatus("Bod mislukt");
    }
  };

  useEffect(() => {
    if (!historyOpen) return;

    if (!activeProduct) {
      setHistoryError("Geen actief product om prijzen op te halen.");
      setPriceHistory(null);
      return;
    }

    setHistoryLoading(true);
    setHistoryError("");
    setPriceHistory(null);

    getPriceHistory(activeProduct.productId)
      .then((data) => setPriceHistory(data))
      .catch((err) => {
        console.error("Kon prijshistorie niet ophalen:", err);
        setHistoryError(err.message || "Kon prijshistorie niet ophalen.");
      })
      .finally(() => setHistoryLoading(false));
  }, [historyOpen, activeProduct?.productId]);

  const renderPriceList = (items: HistoricalPricePoint[]) => {
    if (items.length === 0) {
      return <Typography color="text.secondary">Geen prijzen gevonden.</Typography>;
    }

    return items.map((item, index) => (
      <Typography key={`${item.createdAt}-${index}`} variant="body2">
        € {item.prijs.toFixed(2)} • {new Date(item.createdAt).toLocaleString()}
      </Typography>
    ));
  };

  return (
    <RequireAuth>
      <div style={{ background: "white" }}>
        <Navbar
          style={{ backgroundColor: "#C8FFD6" }}
          left={<img src={royalLogo.src} alt="Logo Royal Flora Holland" width={100} />}
          center={<SearchBar />}
          right={<Profile />}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            justifyContent: "center",
            paddingY: 4,
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
            {activeProduct ? (
              <ProductCard mode="display" product={activeProduct} />
            ) : (
              <p>Geen producten gevonden voor veiling {veiling.veilingId}.</p>
            )}
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
            {activeProduct ? (
              <VeilingKlok
                productName={activeProduct.productNaam}
                currentPrice={clockPrice}
                lastBidPrice={lastBidPrice}
                status={clockStatus}
                serverTime={liveState?.serverTime}
                startTime={startTime}
                endTime={endTime}
                remainingQuantity={remainingQuantity}
                onBid={handleLiveBid}
              />
            ) : (
              <p>Geen actief product om op te bieden.</p>
            )}
            <Button
              variant="outlined"
              onClick={() => setHistoryOpen(true)}
              disabled={!activeProduct}
              sx={{ textTransform: "none" }}
            >
              Historische prijzen
            </Button>
          </Box>

          <ProductDisplay product={secondaryProducts} />
        </Box>

        <Box sx={{ textAlign: "center", paddingBottom: 3 }}>
          <p>Live status: {liveStatus || "Onbekend"}</p>
          {liveState && <p>Live prijs: € {liveState.currentPrice.toFixed(2)}</p>}
          {lastBid && (
            <p>
              Laatste bod: € {lastBid.amount.toFixed(2)} x{lastBid.quantity} door {lastBid.bidder}
            </p>
          )}
          <p>naam: {veiling.naam}; veilingId: {veiling.veilingId};</p>
        </Box>

        <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Historische prijzen</DialogTitle>
          <DialogContent dividers>
            {historyLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", paddingY: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            {historyError && <Typography color="error">{historyError}</Typography>}
            {!historyLoading && !historyError && priceHistory && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle1">
                  Gemiddelde prijs: {priceHistory.averagePrice !== null ? `€ ${priceHistory.averagePrice.toFixed(2)}` : "Geen data"}
                </Typography>

                <Box>
                  <Typography variant="subtitle2">Laatste 10 prijzen (huidige aanvoerder)</Typography>
                  {renderPriceList(priceHistory.last10CurrentSupplier)}
                </Box>

                <Box>
                  <Typography variant="subtitle2">Laatste 10 prijzen (alle aanvoerders)</Typography>
                  {renderPriceList(priceHistory.last10AllSuppliers)}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHistoryOpen(false)}>Sluiten</Button>
          </DialogActions>
        </Dialog>
      </div>
    </RequireAuth>
  );
}
