"use client";

// Force client-side only (disable SSR) for this dynamic auction page
export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
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
import { VeilingKlok } from "@/components/VeilingKlok";
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
  const [remainingQty, setRemainingQty] = useState<number | null>(null);

  // Sequential Auction State
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pauseMessage, setPauseMessage] = useState<string>("");

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
      onBid: (bid: BidEvent) => {
        setLastBid(bid);
        if (bid.remainingQuantity !== undefined) {
          setRemainingQty(bid.remainingQuantity);
        }
      },
      onTick: (tick: PriceTickEvent) => {
        setLivePrice(tick.price);
        // Fallback: if we receive ticks for a product but missed the start event
        if (!activeProductId) {
          console.log("Tick received but no activeProductId. Syncing to:", tick.productId);
          setActiveProductId(tick.productId);
        }
      },
    })
      .then((conn) => {
        if (disposed) {
          stopAuctionConnection(conn);
          return;
        }
        activeConnection = conn;

        // Listen to new Sequential events
        conn.on("ProductStart", (data: any) => {
          console.log("ProductStart", data);
          setActiveProductId(data.productId);
          setLivePrice(data.startPrice);
          setRemainingQty(data.qty);
          setIsPaused(false);
          setPauseMessage("");
          setLastBid(null); // Reset bids for new product
        });

        conn.on("AuctionPaused", (data: any) => {
          console.log("AuctionPaused", data);
          setIsPaused(true);
          setPauseMessage(data.message || "Pauze...");
        });

        conn.on("AuctionEnded", () => {
          console.log("AuctionEnded");
          // Optionally handle end logic here
        });

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
  }, [veiling?.veilingId, auctionStatus]); // Removed activeProductId from deps to avoid reconnect cycles

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      return veiling ? String(p.veilingId) === String(veiling.veilingId) : false;
    });
  }, [allProducts, veiling]);

  // Determine active product object
  const activeProduct = useMemo(() => {
    return activeProductId
      ? (filteredProducts.find(p => p.productId === activeProductId) || allProducts.find(p => p.productId === activeProductId))
      : (filteredProducts.length > 0 && !connection ? filteredProducts[0] : null);
  }, [activeProductId, filteredProducts, allProducts, connection]);

  // Debugging logs
  useEffect(() => {
    if (activeProductId && !activeProduct && allProducts.length > 0) {
      console.warn("Mismatch! activeProductId:", activeProductId, "Available IDs:", allProducts.map(p => p.productId));
      console.log("All Products:", allProducts);
    }
  }, [activeProductId, activeProduct, allProducts]);

  // Sync initial remaining qty if not set
  useEffect(() => {
    if (activeProduct && remainingQty === null) {
      setRemainingQty(activeProduct.hoeveelheid);
    }
  }, [activeProduct, remainingQty]);

  const activeBidClosed = Boolean(
    lastBid &&
    activeProduct &&
    lastBid.productId === activeProduct.productId &&
    remainingQty === 0
  );

  const handleLiveBid = async (price: number, quantity: number) => {
    if (!veiling || auctionStatus !== "active") return;
    if (!activeProduct) {
      setLiveStatus("Geen actief product.");
      return;
    }
    if (!connection) {
      setLiveStatus("Geen live verbinding.");
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

  return (
    <RequireAuth>
      <div style={{ background: "white", minHeight: "100vh" }}>
        <Navbar />

        {/* Auction Info Header - Minimal */}
        <Paper elevation={1} sx={{ padding: 2, backgroundColor: "#f8f9fa", borderRadius: 0, borderBottom: "1px solid #e0e0e0" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", mx: "auto", px: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{veiling.naam}</Typography>
              <Typography variant="caption" color="text.secondary">{formatDateTime(veiling.starttijd)} - {formatDateTime(veiling.eindtijd)}</Typography>
            </Box>
            <Box>
              {/* Potentially add status badge here */}
            </Box>
          </Box>
        </Paper>

        {/* Main Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 4,
            justifyContent: "center",
            alignItems: "flex-start",
            paddingY: 4,
            px: 4,
            maxWidth: "1400px",
            mx: "auto",
            flexWrap: "wrap"
          }}
        >
          {/* Left: Product Details */}
          <Box sx={{ flex: "1 1 400px", maxWidth: "500px" }}>
            {activeProduct ? (
              <ProductCard mode="display" product={activeProduct} />
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 4, border: '1px dashed #ccc' }}>
                <Typography variant="h6" color="text.secondary">
                  {filteredProducts.length === 0 && !connection
                    ? "Veiling is afgelopen."
                    : (connection ? "Wachten op volgend product..." : "Producten laden...")}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Center: Clock */}
          <Box sx={{ flex: "0 0 auto" }}>
            {activeProduct ? (
              <VeilingKlok
                key={activeProduct.productId} /* Reset clock on product change */
                startPrice={Number(activeProduct.startPrijs ?? 0)}
                endPrice={Number(activeProduct.eindPrijs ?? 0)}
                duration={Math.max(1, (new Date(veiling.eindtijd).getTime() - new Date(veiling.starttijd).getTime()) / 1000)}
                productName={activeProduct.productNaam}
                isClosed={activeBidClosed || isPaused}
                closingPrice={lastBid?.amount}
                onBid={handleLiveBid}
                livePrice={livePrice}
                status={auctionStatus}
                countdownText={isPaused ? pauseMessage : (countdown !== null ? formatCountdown(countdown) : undefined)}
                remainingQuantity={remainingQty ?? activeProduct.hoeveelheid}
              />
            ) : (
              /* Placeholder Clock or Empty */
              <Box sx={{ width: 380, height: 400, bgcolor: '#f0f0f0', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>{isPaused ? pauseMessage : "..."}</Typography>
              </Box>
            )}
          </Box>

          {/* Right: Upcoming Products (Queue) */}
          <Box sx={{ flex: "1 1 300px", maxWidth: "400px" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Volgende producten</Typography>
            <ProductDisplay
              product={filteredProducts.filter(p => p.productId !== activeProductId)}
            />
          </Box>
        </Box>

        {/* Live Status Footer */}
        {auctionStatus === "active" && (
          <Box sx={{ textAlign: "center", paddingBottom: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Live status: {liveStatus || "Onbekend"}
            </Typography>
            {isPaused && <Typography variant="h6" color="primary">{pauseMessage}</Typography>}
            {!isPaused && livePrice !== null && (
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
