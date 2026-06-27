import { NextResponse } from "next/server";
import {
  coingeckoIds,
  coingeckoNftIds,
} from "@/app/components/taxonomy/tokenList";

// Server-side price proxy for the taxonomy watchlist. Keeps the CoinGecko key off
// the client and returns one map keyed by each asset's priceKey:
//  • fungible coins via a single simple/price call (USD price + 24h % change),
//  • NFT collections via /nfts/{id} (floor price + 24h floor change), one call each.
// Cached for 60s so rapid panel toggles don't hammer the demo-tier rate limit.

export const revalidate = 60;

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

export async function GET() {
  const apiKey = process.env.COINGECKO_API_KEY;
  const headers: Record<string, string> = apiKey
    ? { "x-cg-demo-api-key": apiKey }
    : {};

  const params = new URLSearchParams({
    ids: coingeckoIds.join(","),
    vs_currencies: "usd",
    include_24hr_change: "true",
  });

  try {
    // Tokens (one call) and NFT floors (one call each) in parallel.
    const [tokenRes, ...nftResults] = await Promise.all([
      fetch(`${SIMPLE_PRICE}?${params}`, { headers, next: { revalidate } }),
      ...coingeckoNftIds.map((id) =>
        fetch(`${NFTS}${id}`, { headers, next: { revalidate } })
          .then((r) => (r.ok ? (r.json() as Promise<NftResponse>) : null))
          .then((data) => ({ id, data }))
          .catch(() => ({ id, data: null })),
      ),
    ]);

    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: `CoinGecko responded ${tokenRes.status}` },
        { status: 502 },
      );
    }

    const out = (await tokenRes.json()) as PriceMap;

    for (const { id, data } of nftResults) {
      if (!data) continue;
      out[id] = {
        usd: data.floor_price?.usd ?? null,
        usd_24h_change: data.floor_price_24h_percentage_change?.usd ?? null,
      };
    }

    return NextResponse.json(out, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach CoinGecko" },
      { status: 502 },
    );
  }
}
