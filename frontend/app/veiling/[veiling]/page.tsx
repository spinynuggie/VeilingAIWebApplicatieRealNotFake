"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HubConnection } from "@microsoft/signalr";
import { Veiling } from "@/types/veiling";
import { getVeilingen } from "@/services/veilingService";
import Navbar from "@/features/(NavBar)/AppNavBar";
import ProductDisplay from "@/components/(oud)/ProductDisplay";
import { getProducts } from "@/services/productService";
import { Box, Typography, Paper } from "@mui/material";
import RequireAuth from "@/components/(oud)/RequireAuth";
import ProductCard from "@/features/ProductCard";
import { VeilingKlok } from "@/components/(oud)/VeilingKlok";
import {
  BidEvent,
  PriceTickEvent,
  sendBid,
  startAuctionConnection,
  stopAuctionConnection,
} from "@/services/auctionRealtime";

type AuctionStatus = "pending" | "active" | "ended";

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}u ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function VeilingDetailPage() {
  const [veiling, setVeiling] = useState<Veiling | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [lastBid, setLastBid] = useState<BidEvent | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);

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

  // Calculate auction status
  const getAuctionStatus = (): AuctionStatus => {
    if (!veiling) return "pending";
    const now = Date.now();
    const start = new Date(veiling.starttijd).getTime();
    const end = new Date(veiling.eindtijd).getTime();
    if (now < start) return "pending";
    if (now >= end) return "ended";
    return "active";
  };

  const auctionStatus = getAuctionStatus();

  // Countdown timer for pending auctions
  useEffect(() => {
    if (!veiling || auctionStatus !== "pending") {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const start = new Date(veiling.starttijd).getTime();
      const remaining = Math.max(0, Math.floor((start - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        // Auction just started, trigger re-render
        setVeiling({ ...veiling });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [veiling, auctionStatus]);

  // SignalR connection (only when active)
  useEffect(() => {
    if (!veiling || auctionStatus !== "active") return;

    let disposed = false;
    let activeConnection: HubConnection | null = null;

    setLiveStatus("Verbinden met live veiling...");
    startAuctionConnection(String(veiling.veilingId), {
      onBid: (bid: BidEvent) => setLastBid(bid),
      onTick: (tick: PriceTickEvent) => setLivePrice(tick.price),
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
  }, [veiling?.veilingId, auctionStatus]);

  const handleLiveBid = async (price: number, quantity: number) => {
    if (!veiling || auctionStatus !== "active") return;
    const activeProduct = filteredProducts[0];
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

  if (error) return <p>Error: {error}</p>;
  if (!veiling) return <p>Loading... (looking for id: {id})</p>;

  const filteredProducts = allProducts.filter((p) => {
    return String(p.veilingId) === String(veiling.veilingId);
  });

  const activeProduct = filteredProducts[0];
  const activeBidClosed = Boolean(lastBid && activeProduct && lastBid.productId === activeProduct.productId);

  return (
    <RequireAuth>
      <div style={{ background: "white", minHeight: "100vh" }}>
        <Navbar />

        {/* Auction Info Header */}
        <Box sx={{ textAlign: "center", py: 3, backgroundColor: "#f5f5f5" }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {veiling.naam}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {veiling.beschrijving}
          </Typography>

          {/* Time Display */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Start</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatDateTime(veiling.starttijd)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Einde</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {formatDateTime(veiling.eindtijd)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 4,
            justifyContent: "center",
            alignItems: "flex-start",
            paddingY: 6,
            px: 4,
            maxWidth: "1400px",
            mx: "auto",
            flexWrap: "wrap"
          }}
        >
          {/* Left Side: Product Image/Details */}
          <Box sx={{ flex: "1 1 400px", maxWidth: "500px" }}>
            {filteredProducts.length > 0 ? (
              <ProductCard mode="display" product={filteredProducts[0]} />
            ) : (
              <Typography variant="body1">Geen producten gevonden voor deze veiling.</Typography>
            )}
          </Box>

          {/* Center: VeilingKlok */}
          {activeProduct && (
            <Box sx={{ flex: "0 0 auto" }}>
              <VeilingKlok
                startPrice={Number(activeProduct.startPrijs ?? 0)}
                endPrice={Number(activeProduct.eindPrijs ?? 0)}
                duration={Math.max(1, (new Date(veiling.eindtijd).getTime() - new Date(veiling.starttijd).getTime()) / 1000)}
                productName={activeProduct.productNaam}
                isClosed={activeBidClosed}
                closingPrice={lastBid?.amount}
                onBid={handleLiveBid}
                livePrice={livePrice}
                status={auctionStatus}
                countdownText={countdown !== null ? formatCountdown(countdown) : undefined}
              />
            </Box>
          )}

          {/* Right Side: Other products */}
          <Box sx={{ flex: "1 1 300px", maxWidth: "400px" }}>
            <ProductDisplay product={filteredProducts.slice(1)} />
          </Box>
        </Box>

        {/* Live Status Footer */}
        {auctionStatus === "active" && (
          <Box sx={{ textAlign: "center", paddingBottom: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Live status: {liveStatus || "Onbekend"}
            </Typography>
            {livePrice !== null && (
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Live prijs: € {livePrice.toFixed(2)}
              </Typography>
            )}
            {lastBid && (
              <Typography variant="body2">
                Laatste bod: € {lastBid.amount.toFixed(2)} x{lastBid.quantity} door {lastBid.bidder}
              </Typography>
            )}
          </Box>
        )}
      </div>
    </RequireAuth>
  );
}

