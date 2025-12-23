# Plan for Synchronized Dutch Auction (Updated)

## Goals
- All clients see the same countdown and price progression.
- Bidding is only allowed between `Starttijd` and `Eindtijd`.
- Price is computed from time, not per-client timers.
- Live updates via SignalR; state persists in DB.
- Fast feedback (<300ms) for bids and sold-out events.

## High-level Approach
1) **Backend authoritative clock**
   - Compute current price from `Starttijd`, `Eindtijd`, `StartPrijs`, `EindPrijs`.
   - Add a hosted service that broadcasts `PriceTick` to each veiling group every 250–500ms.
   - Add a “current state” query (hub method) so late joiners can instantly sync.

2) **In-memory auction state for speed**
   - Maintain an in-memory cache per veiling/product (current price, remaining quantity, status).
   - On bid, validate against cached state (time window + price + quantity) for <300ms response.
   - Persist bid + product updates to DB asynchronously or within the same request, but **broadcast** the result immediately from cache to all clients.
   - If DB save fails, send a corrective event to clients.

3) **Concurrency / simultaneous bids**
   - Use a per-product lock (e.g., `SemaphoreSlim`) to serialize bids for the same product.
   - First valid bid wins at current price; others receive a clear error (price changed / sold out).

4) **Frontend synchronization**
   - Remove local countdown logic from `VeilingKlok` for live auctions.
   - Drive UI from server tick events (`PriceTick`) + state event on join.
   - Disable bidding UI when status is “not started” or “ended”; show sold-out state when quantity hits 0.

5) **Data wiring**
   - Ensure products in `product_gegevens` have `StartPrijs`, `EindPrijs`, `VeilingId`.
   - Use veiling’s `Starttijd`/`Eindtijd` to drive status.

## Files likely to change
- `backend/Services/` (new hosted service + in-memory auction state)
- `backend/Hubs/AuctionHub.cs`
- `backend/Program.cs` (register hosted service and singleton state)
- `frontend/services/auctionRealtime.ts` (tick/state payloads)
- `frontend/app/veiling/[veiling]/page.tsx`
- `frontend/components/(oud)/VeilingKlok.tsx`

## Notes / Assumptions
- Single VPS instance (no SignalR backplane needed).
- Cache is in-memory; if the server restarts, state is recalculated from DB + time.
- CSRF bypass for `/hubs/*` stays in place.
