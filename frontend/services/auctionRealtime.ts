import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

export type BidEvent = {
  veilingId: string;
  productId: number;
  amount: number;
  quantity: number;
  bidder: string;
  timestamp: string;
  remainingQuantity?: number;
};

export type PriceTickEvent = {
  veilingId: string;
  productId: number;
  price: number;
  timestamp: string;
};

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

if (!apiBase) {
  throw new Error("NEXT_PUBLIC_BACKEND_LINK is not defined.");
}

type AuctionHandlers = {
  onBid?: (bid: BidEvent) => void;
  onTick?: (tick: PriceTickEvent) => void;
};

export async function startAuctionConnection(
  veilingId: string,
  handlers: AuctionHandlers = {}
): Promise<HubConnection> {
  const connection = new HubConnectionBuilder()
    .withUrl(`${apiBase}/hubs/auction`, {
      withCredentials: true, // reuse auth cookies
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  if (handlers.onBid) {
    connection.on("BidPlaced", handlers.onBid);
  }
  if (handlers.onTick) {
    connection.on("PriceTick", handlers.onTick);
  }

  await connection.start();
  await connection.invoke("JoinAuction", veilingId);
  return connection;
}

export async function stopAuctionConnection(
  connection: HubConnection | null
): Promise<void> {
  if (!connection) return;
  try {
    await connection.stop();
  }
  catch {
    // ignore clean-up failures
  }
}

export function sendBid(
  connection: HubConnection | null,
  veilingId: string,
  productId: number,
  amount: number,
  quantity: number
): Promise<void> {
  if (!connection) {
    return Promise.reject(new Error("Geen actieve live verbinding."));
  }

  return connection.invoke("PlaceBid", veilingId, productId, amount, quantity);
}
