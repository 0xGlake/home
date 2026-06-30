import { NextResponse } from "next/server";
import {
  coingeckoIds,
  coingeckoNftIds,
} from "@/app/components/taxonomy/tokenList";

// Server-side price proxy for the taxonomy watchlist. Keeps the CoinGecko key off
// the client and returns one map keyed by each asset's priceKey:
//  • fungible coins via a single simple/price call (USD price + 24h % change),
//  • NFT collections via /nfts/{id} (floor price + 24h floor change), one call each.
//
// Freshness: a single explicit in-memory cache with a hard 60s TTL. We deliberately
// avoid Next's route/data cache and any stale-while-revalidate — those serve stale
// data on the first hit after idle and refetch in the background, which is exactly
// the "had to manually refresh" bug. Here a request past the TTL refetches CoinGecko
// synchronously before responding, so callers always get data ≤60s old. Concurrent
// requests coalesce onto one upstream call; on upstream failure we fall back to the
// last good snapshot rather than erroring.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const TTL_MS = 60_000;

export interface PriceEntry {
  usd: number | null;
  usd_24h_change: number | null;
}

export type PriceMap = Record<string, PriceEntry>;

const SIMPLE_PRICE = "https://api.coingecko.com/api/v3/simple/price";
const NFTS = "https://api.coingecko.com/api/v3/nfts/";

interface NftResponse {
  floor_price?: { usd?: number };
  floor_price_24h_percentage_change?: { usd?: number };
}

let cache: { data: PriceMap; at: number } | null = null;
let inflight: Promise<PriceMap> | null = null;

async function fetchPrices(): Promise<PriceMap> {
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers: Record<string, string> = apiKey
    ? { "x-cg-demo-api-key": apiKey }
    : {};

  const params = new URLSearchParams({
    ids: coingeckoIds.join(","),
    vs_currencies: "usd",
    include_24hr_change: "true",
  });

  // Tokens (one call) and NFT floors (one call each) in parallel. `no-store`
  // bypasses Next's Data Cache so each upstream hit is genuinely live.
  const [tokenRes, ...nftResults] = await Promise.all([
    fetch(`${SIMPLE_PRICE}?${params}`, { headers, cache: "no-store" }),
    ...coingeckoNftIds.map((id) =>
      fetch(`${NFTS}${id}`, { headers, cache: "no-store" })
        .then((r) => (r.ok ? (r.json() as Promise<NftResponse>) : null))
        .then((data) => ({ id, data }))
        .catch(() => ({ id, data: null })),
    ),
  ]);

  if (!tokenRes.ok) {
    throw new Error(`CoinGecko responded ${tokenRes.status}`);
  }

  const out = (await tokenRes.json()) as PriceMap;

  for (const { id, data } of nftResults) {
    if (!data) continue;
    out[id] = {
      usd: data.floor_price?.usd ?? null,
      usd_24h_change: data.floor_price_24h_percentage_change?.usd ?? null,
    };
  }

  return out;
}

function getPrices(): Promise<PriceMap> {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return Promise.resolve(cache.data);
  }
  // Coalesce concurrent refetches onto one upstream round-trip.
  if (!inflight) {
    inflight = fetchPrices()
      .then((data) => {
        cache = { data, at: Date.now() };
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export async function GET() {
  // Never let the browser or a CDN hold this response: the client polls on its own
  // cadence and the freshness guarantee lives in the in-memory cache above.
  const noStore = { "Cache-Control": "no-store, max-age=0" };
  try {
    const data = await getPrices();
    return NextResponse.json(data, { headers: noStore });
  } catch {
    // Upstream failed — serve the last good snapshot if we have one.
    if (cache) {
      return NextResponse.json(cache.data, { headers: noStore });
    }
    return NextResponse.json(
      { error: "Failed to reach CoinGecko" },
      { status: 502, headers: noStore },
    );
  }
}
