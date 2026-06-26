import type { Group } from "./types";

// The full crypto taxonomy, with this cycle's additions merged in.
// `isNew: true` highlights an entry/box so you can spot the deltas at a glance —
// strip those flags once you've reconciled the graphic.
//
// Leaf circles are empty placeholders for now. To wire one up later:
//   { name: "Uniswap", url: "https://x.com/Uniswap", img: "/icons/uniswap.svg" }
// Items with a `url` are already clickable.

export const taxonomy: Group[] = [
  {
    title: "Communication",
    accent: "blue",
    children: [
      {
        title: "Oracle",
        caption: "external data <> blockchain",
        items: ["Chainlink", "UMA", "Pyth"],
      },
      {
        title: "Bridge",
        caption: "blockchain <> blockchain",
        items: ["Wormhole", "GardenFinance"],
      },
      { title: "RPC", items: ["Alchemy", "Infura", "Helius"] },
      { title: "Indexer", items: ["The Graph"] },
      {
        title: "Aggregator",
        accent: "blue",
        children: [
          {
            title: "Wallets",
            items: ["Metamask", "Phantom", "Rabby", "Backpack", "Trezor"],
          },
          {
            title: "Order Flow Aggregators",
            dashed: true,
            children: [
              { title: "Spot", items: ["Jupiter", "Cowswap", "Titan"] },
              { title: "NFT", items: ["Blur", "Tensor"] },
              { title: "Perps", items: ["Rage Trade", "Ranger Finance"] },
            ],
          },
          {
            title: "Trading Terminals",
            caption: "front-ends wrapping order flow + UI",
            isNew: true,
            children: [
              {
                title: "Spot",
                isNew: true,
                items: ["Axiom", "GMGN", "FOMO", "PvP"],
              },
              {
                title: "Perp",
                isNew: true,
                items: [
                  "Pear Protocol",
                  { name: "Tread", url: "https://x.com/tread_fi" },
                ],
              },
              {
                title: "Prediction",
                isNew: true,
                items: [{ name: "Hunch", url: "https://x.com/tradeonhunch" }],
              },
            ],
          },
          {
            title: "Information Aggregators",
            items: [
              "DeFi Llama",
              "Tree Terminal",
              "Etherscan",
              "Dune Analytics",
              "Nansen",
              "Arkham",
            ],
          },
          {
            title: "Research Aggregators",
            items: ["Messari", "Ahboyash reads", { name: "Delphi", isNew: true }],
          },
          {
            title: "AI Analyst Agents",
            isNew: true,
            items: ["DefiLlama Agent", "Artemis Agent", "aixbt"],
          },
        ],
      },
      {
        title: "Account Abstraction",
        items: ["TipLink", "Ready", "Privy"],
      },
      {
        title: "Identity & Reputation",
        items: ["ENS", "Gitcoin Passport", "WorldCoin", "POAP", "Kaito"],
      },
      {
        title: "Information Markets / DePIN Data",
        items: [
          "Hivemapper",
          "DIMO",
          "Grass",
          "Streamr",
          "RaadLabs",
          { name: "Kled", isNew: true },
        ],
      },
    ],
  },

  {
    title: "On-Chain Protocols",
    accent: "teal",
    children: [
      {
        title: "Basic Usages",
        accent: "purple",
        children: [
          {
            title: "Tokens",
            children: [
              {
                title: "Shitcoin",
                caption: "cult communities, hyper-financialised narrative",
              },
              { title: "Revenue Sharing", caption: "securities" },
              { title: "Governance", caption: "all DeFi tokens" },
              { title: "DATs", caption: "Digital Asset Treasury" },
              {
                title: "NFT",
                accent: "pink",
                caption: "milady",
                children: [
                  {
                    title: "Revenue Accruing",
                    caption: "Music NFT, Tokenised Front End",
                  },
                ],
              },
              {
                title: "RWA",
                caption: "legal claims to off-chain assets, 1:1",
                children: [
                  { title: "Fiat backed stables", items: ["USDC", "USDT"] },
                  { title: "Commodity backed stables", items: ["PAXG"] },
                  {
                    title: "Physical Asset",
                    caption: "real estate, wrapped bonds/shares, cards, skins",
                    items: [
                      {
                        name: "Superstate",
                        url: "https://x.com/SuperstateInc",
                        isNew: true,
                      },
                    ],
                  },
                ],
              },
              {
                title: "Synthetics",
                accent: "teal",
                caption: "on-chain exposure without owning underlying",
                children: [
                  { title: "Delta Neutral Stables", items: ["Ethena"] },
                  { title: "Crypto Over Collateralised", items: ["DAI via Maker"] },
                  {
                    title: "Algo Stables",
                    caption: "FRAX historically, Terra UST",
                  },
                  {
                    title: "Yield-Bearing Stablecoins",
                    items: ["sDAI", "sUSDe", "aUSDC"],
                  },
                  { title: "Bridged Assets", items: ["bridged BTC"] },
                ],
              },
            ],
          },
          {
            title: "Transferring of Tokens",
            caption: "batch sending, burning, primary usage",
            children: [
              {
                title: "Privacy Payment",
                items: [
                  "Tornado",
                  "Light",
                  "Railway",
                  "Umbra",
                  {
                    name: "Husher Exchange",
                    url: "https://x.com/HusherExchange",
                    isNew: true,
                  },
                ],
              },
              {
                title: "Agentic / Machine Payments",
                isNew: true,
                items: ["x402"],
              },
            ],
          },
          {
            title: "Mining/Staking",
            caption: "this all needs to run somehow",
            children: [{ title: "Restaking", items: ["EigenLayer"] }],
          },
          { title: "Intellectual Property", items: ["Story Protocol"] },
        ],
      },

      {
        title: "Exchanges (Volume)",
        accent: "purple",
        children: [
          {
            title: "Spot",
            accent: "teal",
            children: [
              { title: "AMM", items: ["Uniswap", "Curve", "Raydium", "Aerodrome"] },
              { title: "CLOB", items: ["Openbook", "Hyperliquid"] },
              { title: "Dark AMM/Prop AMM", items: ["Lifinity", "SolFi"] },
              { title: "RFQ", items: ["UniswapX", "CoW"] },
              { title: "Dark Pool", items: ["Renegade"] },
            ],
          },
          { title: "NFT", items: ["OpenSea", "Tensor"] },
          {
            title: "Derivatives",
            accent: "teal",
            children: [
              {
                title: "Options",
                items: ["Dopex", "Derive", { name: "Hypercall", isNew: true }],
              },
              {
                title: "Perpetuals",
                children: [
                  {
                    title: "Dark AMM/Prop AMM",
                    caption: "Velocity adding",
                    items: [
                      { name: "Phoenix Perps", isNew: true },
                      { name: "JTX", isNew: true },
                    ],
                  },
                  {
                    title: "CLOB",
                    items: [
                      "Hyperliquid",
                      "DyDx",
                      "Aster",
                      "Extended",
                      "Bullet",
                      { name: "Bulk Trade", isNew: true },
                      {
                        name: "Meridian",
                        url: "https://x.com/meridiandotxyz",
                        isNew: true,
                      },
                      {
                        name: "BlinkTrade",
                        url: "https://x.com/blinktrade",
                        isNew: true,
                        description:
                          "Layer 2 ZK-rollup for spot and perpetual trading",
                      },
                    ],
                    children: [
                      {
                        title: "Cross-Margin / Multi-Asset",
                        caption: "tentative — margin-engine axis",
                        isNew: true,
                        items: [
                          "Hyperliquid",
                          { name: "GRVT", url: "https://x.com/grvt_io" },
                        ],
                      },
                    ],
                  },
                  { title: "Oracle-based Pool", items: ["GMX", "Jupiter"] },
                  {
                    title: "Martingale LP Pool",
                    caption: "unique matching engine",
                    isNew: true,
                    items: ["Papertrade"],
                  },
                  {
                    title: "RFQ",
                    isNew: true,
                    items: [
                      { name: "Variational", url: "https://x.com/variational_io" },
                    ],
                  },
                  { title: "Dark Pool", caption: "in development", items: ["Defx"] },
                  {
                    title: "Hybrid",
                    caption: "DLOB + dAMM + JIT/RFQ (formerly Drift)",
                    items: ["Velocity"],
                  },
                ],
              },
            ],
          },
          {
            title: "Multiverse Markets",
            caption: "perp x prediction hybrid — new primitive",
            isNew: true,
            items: [{ name: "ProofMarkets", url: "https://x.com/ProofMarkets" }],
          },
          { title: "Insurance", items: ["Nexus Mutual"] },
          {
            title: "Prediction Markets",
            items: [
              "Polymarket",
              "Augur",
              "Azuro",
              { name: "Melee Markets", isNew: true },
              { name: "HIP-4", isNew: true },
            ],
            children: [
              {
                title: "Parlays",
                caption: "collateral engine for combined outcomes",
                isNew: true,
                items: [{ name: "ParlayIt", url: "https://x.com/ParlayItGG" }],
              },
              {
                title: "Supporting Infra",
                caption: "margin for prediction markets",
                isNew: true,
                items: [
                  { name: "Lattica Finance", url: "https://x.com/LatticaFinance" },
                ],
              },
            ],
          },
          {
            title: "Gamified Trading / Degen Gambling",
            isNew: true,
            children: [
              {
                title: "Options",
                isNew: true,
                items: [{ name: "Euphoria", url: "https://x.com/Euphoria_fi" }],
              },
              {
                title: "Perps",
                isNew: true,
                items: [{ name: "hit.one", url: "https://x.com/hitdotone" }],
              },
            ],
          },
          { title: "Provably Fair Casino", items: ["Rollbit"] },
          {
            title: "Yield Trading / Rate Swaps",
            items: ["Pendle", { name: "RateX", isNew: true }],
          },
          { title: "Credit Markets", items: ["LoopScale"] },
        ],
      },

      {
        title: "Asset Management",
        accent: "purple",
        children: [
          { title: "Yield Aggregator", items: ["Yearn", "Lulo"] },
          {
            title: "Indexes",
            caption: "Spot/Deriv Index",
            items: [
              { name: "alt.fun", url: "https://x.com/altdotfun", isNew: true },
              {
                name: "Cleopetra",
                url: "https://x.com/cleopetrafun",
                isNew: true,
              },
            ],
          },
          {
            title: "Governance",
            items: ["Convex", "Butterfly"],
            children: [
              { title: "Voting and Tooling", caption: "Futarchy", items: ["Metadao"] },
            ],
          },
          { title: "Treasury Management", items: ["Squads"] },
          { title: "Token Launchers", items: ["Pump.fun"] },
          {
            title: "Structured Products",
            caption: "automated strategy vaults",
            items: ["Ribbon"],
          },
          {
            title: "Prime Brokerage / Unified Margin",
            isNew: true,
            items: ["Project 0"],
          },
          {
            title: "Prop Trading Firms",
            isNew: true,
            items: [{ name: "ProprXYZ", url: "https://x.com/ProprXYZ" }],
          },
        ],
      },

      {
        title: "Bank (TVL)",
        accent: "green",
        children: [
          { title: "Collateralised Debt Position", items: ["Maker"] },
          {
            title: "Collateralised Lending",
            caption: "Margin Trading — user custody",
            items: ["Aave", "Blend (NFT)"],
            children: [
              {
                title: "Composable Leverage",
                caption: "protocol custody",
                items: ["Gearbox"],
              },
            ],
          },
          { title: "Liquid staking", items: ["Lido", "Jito", "LSD"] },
          { title: "Uncollateralised Flash Loans", items: ["Aave"] },
          {
            title: "Credit/Undercollateralized Lending",
            items: [
              "Maple",
              {
                name: "APYX",
                url: "https://x.com/apyx_fi",
                isNew: true,
              },
            ],
          },
          {
            title: "Fixed Rate",
            items: [
              "Notional Finance",
              { name: "Morpho", url: "https://x.com/Morpho", isNew: true },
            ],
          },
          { title: "Reserve Currency", items: ["Olympus DAO"] },
        ],
      },

      {
        title: "Alternate Network Types",
        accent: "teal",
        children: [
          { title: "Storage", items: ["FileCoin", "Arweave", "bittorrent"] },
          { title: "Privacy", items: ["Monero", "Zcash"] },
          {
            title: "Networking",
            caption: "Helium (internet), DoubleZero (HPC)",
            items: ["Helium", "DoubleZero"],
          },
          { title: "Social", items: ["Urbit", "Farcaster"] },
          {
            title: "L2/Rollups",
            items: ["Starknet", "Arbitrum", "Lightning Network", "zkSync"],
          },
          { title: "Data Availability Layers", items: ["Celestia"] },
          {
            title: "Compute",
            children: [
              {
                title: "Encrypted Computation",
                caption: "ZKPs",
                items: ["Arcium"],
              },
              { title: "Decentralised Compute", items: ["Bittensor"] },
            ],
          },
        ],
      },
    ],
  },
];

export default taxonomy;
