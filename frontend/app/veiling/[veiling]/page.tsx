"use client";

// Force client-side only (disable SSR) for this dynamic auction page
export const dynamic = "force-dynamic";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { Veiling } from "@/types/veiling";
import { getVeilingen } from "@/services/veilingService";
import Navbar from "@/features/(NavBar)/AppNavBar";
import ProductDisplay from "@/components/(oud)/ProductDisplay";
import { getProducts } from "@/services/productService";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import ProductCard from "@/features/ProductCard";
import nextDynamic from "next/dynamic";
import { PriceHistoryDialog } from "@/components/PriceHistoryDialog";
// Memoize VeilingKlok to prevent re-renders on parent updates if props are same
const VeilingKlok = nextDynamic(() => import("@/components/VeilingKlok").then(mod => mod.VeilingKlok), { ssr: false });

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

// Memoized wrapper for ProductCard to avoid unnecessary re-renders
const MemoizedProductCard = React.memo(ProductCard);

export default function VeilingDetailPage() {
  const [veiling, setVeiling] = useState<Veiling | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  // Use a Ref for the connection to ensure we don't depend on state updates for existence checks
  const connectionRef = useRef<HubConnection | null>(null);
  // Track if we are currently connecting to prevent race conditions
  const isConnectingRef = useRef<boolean>(false);

  const [lastBid, setLastBid] = useState<BidEvent | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [remainingQty, setRemainingQty] = useState<number | null>(null);

  // Status is now state, initialized to pending
  const [auctionStatus, setAuctionStatus] = useState<AuctionStatus>("pending");

  // Sequential Auction State
  const [activeProductId, setActiveProductId] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pauseMessage, setPauseMessage] = useState<string>("");
  const [currentDuration, setCurrentDuration] = useState<number>(30);
  const [transitionCountdown, setTransitionCountdown] = useState<number | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

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
        else {
          setVeiling(found);
          // Initial status check
          checkStatus(found);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
      });
  }, [id]);

  // Helper to determine status
  const checkStatus = (v: Veiling) => {
    if (!v) return;

    // SECURITY: If we already determined it's ended (via SignalR), don't flip back to pending/active based on local clock
    if (auctionStatus === "ended") return;

    const now = Date.now();
    const start = new Date(v.starttijd).getTime();
    let newStatus: AuctionStatus = "pending";

    if (v.eindtijd && now >= new Date(v.eindtijd).getTime()) {
      newStatus = "ended";
    } else if (now >= start) {
      newStatus = "active";
    } else {
      newStatus = "pending";
    }

    setAuctionStatus(prev => {
      if (prev === 'ended' && newStatus !== 'ended') return prev;
      return newStatus;
    });
  };

  // Timer Effect: Updates countdown AND checks status
  useEffect(() => {
    // Transition Countdown Logic
    let transitionInterval: NodeJS.Timeout | null = null;
    if (transitionCountdown !== null && transitionCountdown > 0) {
      transitionInterval = setInterval(() => {
        setTransitionCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    if (!veiling || auctionStatus === "ended") {
      setCountdown(null);
      if (transitionInterval) clearInterval(transitionInterval);
      return;
    }

    const interval = setInterval(() => {
      checkStatus(veiling); // Periodically check if we should switch to active or ended

      if (auctionStatus === "pending") {
        const start = new Date(veiling.starttijd).getTime();
        const remaining = Math.max(0, Math.floor((start - Date.now()) / 1000));
        setCountdown(remaining);
      } else {
        setCountdown(null);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (transitionInterval) clearInterval(transitionInterval);
    };
  }, [veiling, auctionStatus, transitionCountdown]);

  // SignalR connection management
  useEffect(() => {
    if (!veiling || auctionStatus !== "active") return;

    // cleanup previous connection if exists (sanity check)
    if (connectionRef.current && connectionRef.current.state === HubConnectionState.Connected) {
      return; // Already connected
    }

    if (isConnectingRef.current) return; // Already connecting

    let mounted = true;
    isConnectingRef.current = true;

    setLiveStatus("Verbinden met live veiling...");

    startAuctionConnection(String(veiling.veilingId), {
      onBid: (bid: BidEvent) => {
        setLastBid(bid);
        if (bid.remainingQuantity !== undefined) {
          setRemainingQty(bid.remainingQuantity);
        }
      },
      onTick: (tick: PriceTickEvent) => {
        // STRICT ID CHECK: Prevent ghost updates from previous products
        if (activeProductId && tick.productId !== activeProductId) {
          console.warn(`Ignored tick for product ${tick.productId} while active is ${activeProductId}`);
          return;
        }

        // If we receive a tick, the auction is running, so unpause if needed
        setIsPaused(false);
        setPauseMessage("");
        setTransitionCountdown(null); // Clear manual countdown

        setLivePrice(tick.price);

        // Fallback: if we receive ticks for a product but missed the start event
        if (!activeProductId && tick.productId) {
          setActiveProductId(prev => prev ?? tick.productId);
        }
      },
    })
      .then((conn) => {
        if (!mounted) {
          stopAuctionConnection(conn);
          return;
        }
        connectionRef.current = conn;
        isConnectingRef.current = false;

        conn.on("ProductStart", (data: any) => {
          setActiveProductId(data.productId);
          setLivePrice(data.startPrice);
          setRemainingQty(data.qty);
          if (data.duration) setCurrentDuration(data.duration);
          setIsPaused(false);
          setPauseMessage("");
          setTransitionCountdown(null);
          setLastBid(null);
        });

        conn.on("AuctionPaused", (data: any) => {
          setIsPaused(true);
          setPauseMessage(data.message || "Pauze...");
          if (data.durationMs) {
            setTransitionCountdown(Math.ceil(data.durationMs / 1000));
          }
        });

        conn.on("AuctionEnded", () => {
          setAuctionStatus("ended");
          setIsPaused(false);
          setTransitionCountdown(null);
        });

        setLiveStatus("Live verbonden");
      })
      .catch((err) => {
        console.error("Kon geen live verbinding maken:", err);
        if (mounted) {
          setLiveStatus("Live verbinding mislukt");
          isConnectingRef.current = false;
        }
      });

    return () => {
      mounted = false;
      if (connectionRef.current) {
        stopAuctionConnection(connectionRef.current);
        connectionRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, [veiling?.veilingId, auctionStatus, activeProductId]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      return veiling ? String(p.veilingId) === String(veiling.veilingId) : false;
    });
  }, [allProducts, veiling]);

  // Determine active product object
  const activeProduct = useMemo(() => {
    return activeProductId
      ? (filteredProducts.find(p => p.productId === activeProductId) || allProducts.find(p => p.productId === activeProductId))
      : null; // Don't default to first product anymore, wait for SignalR
  }, [activeProductId, filteredProducts, allProducts]);

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
    (remainingQty === 0)
  );

  const handleLiveBid = useCallback(async (price: number, quantity: number) => {
    if (!veiling || auctionStatus !== "active") return;
    if (!activeProductId) { // Check ID instead of object for speed
      setLiveStatus("Geen actief product.");
      return;
    }
    if (!connectionRef.current) {
      setLiveStatus("Geen live verbinding.");
      return;
    }

    setLiveStatus("Bod versturen...");
    try {
      await sendBid(connectionRef.current, String(veiling.veilingId), activeProductId, price, quantity);
      setLiveStatus("Bod verstuurd");
    } catch (err) {
      console.error("Bod mislukt:", err);
      setLiveStatus("Bod mislukt");
    }
  }, [veiling, auctionStatus, activeProductId]); // removed connection from deps, use ref

  if (error) return <p>Error: {error}</p>;
  if (!veiling) return <p>Loading... (looking for id: {id})</p>;

  // Format the helper text for the clock
  const getClockText = () => {
    if (auctionStatus === "pending" && countdown !== null) return formatCountdown(countdown);
    if (isPaused) {
      return `${pauseMessage} ${transitionCountdown !== null && transitionCountdown > 0 ? `(${transitionCountdown})` : ""}`;
    }
    return "Wachten...";
  };

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      <Navbar />

        {/* Auction Info Header - Minimal */}
        <Paper elevation={1} sx={{ padding: 2, backgroundColor: "#f8f9fa", borderRadius: 0, borderBottom: "1px solid #e0e0e0" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", mx: "auto", px: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{veiling.naam}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(veiling.starttijd)} - {veiling.eindtijd ? formatDateTime(veiling.eindtijd) : "Onbekend"}
              </Typography>
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
              <MemoizedProductCard mode="display" product={activeProduct} />
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa', borderRadius: 4, border: '1px dashed #ccc' }}>
                <Typography variant="h6" color="text.secondary">
                  {auctionStatus === "pending"
                    ? "Deze veiling is nog niet gestart."
                    : (filteredProducts.length === 0 && !connectionRef.current
                      ? "Veiling is afgelopen."
                      : (connectionRef.current ? "Wachten op volgend product..." : "Producten laden..."))}
                </Typography>
                {auctionStatus === "active" && !connectionRef.current && (
                  <Typography variant="caption" color="error">Geen verbinding met server...</Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Center: Clock */}
          <Box sx={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            {activeProduct && (
              <IconButton
                size="small"
                onClick={() => setHistoryOpen(true)}
                aria-label="Prijsinformatie"
              >
                <InfoIcon fontSize="small" color="primary" />
              </IconButton>
            )}
            {activeProduct ? (
              <VeilingKlok
                key={`${activeProduct.productId}-${activeProduct.remainingQty}`} // Force reset when qty changes (reset) or product changes
                startPrice={activeProduct ? activeProduct.startPrijs : (veiling.producten?.[0]?.startPrijs || 10)}
                endPrice={activeProduct ? activeProduct.eindPrijs : (veiling.producten?.[0]?.eindPrijs || 1)}
                duration={currentDuration}
                productName={activeProduct?.productNaam}
                remainingQuantity={remainingQty ?? activeProduct?.hoeveelheid}
                livePrice={livePrice}
                closingPrice={undefined} // HIDE FINAL PRICE SCREEN
                status={auctionStatus === "ended" ? "ended" : (auctionStatus === "pending" || isPaused ? "pending" : "active")}
                countdownText={getClockText()}
                onBid={handleLiveBid}
                isClosed={false} // HIDE FINAL PRICE SCREEN
              />
            ) : (
              /* Placeholder Clock or Empty */
              <Box sx={{ width: 380, height: 400, bgcolor: '#f0f0f0', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 3 }}>
                <Typography color="text.secondary">
                  {auctionStatus === "pending"
                    ? `Veiling begint over ${countdown !== null ? formatCountdown(countdown) : "..."}`
                    : (isPaused ? pauseMessage : "Wachten op start...")}
                </Typography>
              </Box>
            )}
            {activeProduct && (
              <PriceHistoryDialog
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                productId={activeProduct.productId}
                verkoperId={activeProduct.verkoperId}
                productNaam={activeProduct.productNaam}
              />
            )}
          </Box>

          {/* Right: Upcoming Products (Queue) */}
          <Box sx={{ flex: "1 1 300px", maxWidth: "400px" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Volgende producten</Typography>
            <ProductDisplay
              product={filteredProducts.filter(p => !activeProduct || p.productId > activeProduct.productId)}
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
  );
}
