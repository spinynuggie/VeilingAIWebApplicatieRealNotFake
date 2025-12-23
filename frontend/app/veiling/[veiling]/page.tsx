"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { HubConnection } from "@microsoft/signalr";
import { Veiling } from "@/types/veiling";
import { getVeilingen } from "@/services/veilingService";
import Navbar from "@/features/(NavBar)/AppNavBar";
import SearchBar from "@/features/(NavBar)/AppNavBar";
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import ProductDisplay from "@/components/(oud)/ProductDisplay";
import { getProducts } from "@/services/productService";
import Profile from "@/components/(oud)/Profile";
import { Box } from "@mui/material";
import RequireAuth from "@/components/(oud)/RequireAuth";
import ProductCard from "@/components/(oud)/ProductCard/index";
import { VeilingKlok } from "@/components/(oud)/VeilingKlok";
import {
  BidEvent,
  PriceTickEvent,
  sendBid,
  startAuctionConnection,
  stopAuctionConnection,
} from "@/services/auctionRealtime";

export default function VeilingDetailPage() {
  const [veiling, setVeiling] = useState<Veiling | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [lastBid, setLastBid] = useState<BidEvent | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>("");

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
  }, [veiling?.veilingId]);

  const handleLiveBid = async (price: number, quantity: number) => {
    if (!veiling) return;
    if (!connection) {
      setLiveStatus("Geen live verbinding, probeer te refreshen.");
      return;
    }

    setLiveStatus("Bod versturen...");
    try {
      await sendBid(connection, String(veiling.veilingId), price, quantity);
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
            {filteredProducts.length > 0 ? (
              <ProductCard mode="display" product={filteredProducts[0]} />
            ) : (
              <p>Geen producten gevonden voor veiling {veiling.veilingId}.</p>
            )}
          </Box>

          <VeilingKlok startPrice={12} endPrice={5} duration={10} onBid={handleLiveBid} />
          <ProductDisplay product={filteredProducts.slice(1)} />
        </Box>

        <Box sx={{ textAlign: "center", paddingBottom: 3 }}>
          <p>Live status: {liveStatus || "Onbekend"}</p>
          {livePrice !== null && <p>Live prijs: € {livePrice.toFixed(2)}</p>}
          {lastBid && (
            <p>
              Laatste bod: € {lastBid.amount.toFixed(2)} x{lastBid.quantity} door {lastBid.bidder}
            </p>
          )}
          <p>naam: {veiling.naam}; veilingId: {veiling.veilingId};</p>
        </Box>
      </div>
    </RequireAuth>
  );
}
