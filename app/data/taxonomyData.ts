import type { Group } from "./types";

// The full crypto taxonomy, with this cycle's additions merged in.
// `isNew: true` highlights an entry/box so you can spot the deltas at a glance —
// strip those flags once you've reconciled the graphic.
//
// Leaf circles pull their avatar from the X handle in `url` (via unavatar.io),
// or from an explicit `img`. Items with a `url` are clickable.

export const taxonomy: Group[] = [
  {
    title: "Communication",
    accent: "blue",
    children: [
      {
        title: "Oracle",
        caption: "external data <> blockchain",
        items: [
          { name: "Chainlink", url: "https://x.com/chainlink" },
          { name: "UMA", url: "https://x.com/UMAprotocol" },
          { name: "Pyth", url: "https://x.com/PythNetwork" },
        ],
      },
      {
        title: "Bridge",
        caption: "blockchain <> blockchain",
        items: [
          { name: "Wormhole", url: "https://x.com/wormhole" },
          { name: "GardenFinance", url: "https://x.com/gardenfi" },
        ],
      },
      {
        title: "RPC",
        items: [
          { name: "Alchemy", url: "https://x.com/Alchemy" },
          { name: "Infura", url: "https://x.com/infura_io" },
          { name: "Helius", url: "https://x.com/Helius" },
        ],
      },
      {
        title: "Indexer",
        items: [{ name: "The Graph", url: "https://x.com/graphprotocol" }],
      },
      {
        title: "Aggregator",
        accent: "blue",
        children: [
          {
            title: "Wallets",
            items: [
              { name: "Metamask", url: "https://x.com/metamask" },
              { name: "Phantom", url: "https://x.com/phantom" },
              { name: "Rabby", url: "https://x.com/Rabby_io" },
              { name: "Backpack", url: "https://x.com/backpack" },
              { name: "Trezor", url: "https://x.com/Trezor" },
            ],
          },
          {
            title: "Order Flow Aggregators",
            dashed: true,
            children: [
              {
                title: "Spot",
                items: [
                  { name: "Jupiter", url: "https://x.com/JupiterExchange" },
                  { name: "Cowswap", url: "https://x.com/CoWSwap" },
                  { name: "Titan", url: "https://x.com/Titan_Exchange" },
                ],
              },
              {
                title: "NFT",
                items: [
                  { name: "Blur", url: "https://x.com/blur_io" },
                  { name: "Tensor", url: "https://x.com/tensor_hq" },
                ],
              },
              {
                title: "Perps",
                items: [
                  { name: "Rage Trade", url: "https://x.com/rage_trade" },
                  { name: "Ranger Finance", url: "https://x.com/ranger_finance" },
                ],
              },
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
                items: [
                  { name: "Axiom", url: "https://x.com/AxiomExchange" },
                  { name: "GMGN", url: "https://x.com/gmgnai" },
                  { name: "FOMO", url: "https://x.com/fomo" },
                  { name: "PvP", url: "https://x.com/pvpterminal" },
                  { name: "JTX", url: "https://x.com/jtx_trade", isNew: true },
                ],
              },
              {
                title: "Perp",
                isNew: true,
                items: [
                  { name: "Pear Protocol", url: "https://x.com/pear_protocol" },
                  { name: "Tread", url: "https://x.com/tread_fi" },
                  { name: "LorisTools", url: "https://x.com/LorisTools", isNew: true },
                ],
              },
              {
                title: "Prediction",
                isNew: true,
                items: [{ name: "Hunch", url: "https://x.com/tradeonhunch" }],
              },
              {
                title: "Gamified Trading",
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
            ],
          },
          {
            title: "Information Aggregators",
            items: [
              { name: "DeFi Llama", url: "https://x.com/DefiLlama" },
              { name: "Tree Terminal", url: "https://x.com/TreeNewsFeed" },
              { name: "Etherscan", url: "https://x.com/etherscan" },
              { name: "Dune Analytics", url: "https://x.com/Dune" },
              { name: "Nansen", url: "https://x.com/nansen_ai" },
              { name: "Arkham", url: "https://x.com/Arkham" },
              { name: "Artemis", url: "https://x.com/artemis", isNew: true },
            ],
          },
          {
            title: "Research Aggregators",
            items: [
              { name: "Messari", url: "https://x.com/MessariCrypto" },
              { name: "Ahboyash reads", url: "https://x.com/ahboyash" },
              { name: "Delphi", url: "https://x.com/Delphi_Digital", isNew: true },
            ],
          },
          {
            title: "AI Analyst Agents",
            isNew: true,
            items: [
              { name: "DefiLlama Agent", url: "https://x.com/DefiLlama" },
              { name: "Artemis Agent", url: "https://x.com/Artemis" },
              { name: "aixbt", url: "https://x.com/aixbt_agent" },
            ],
          },
        ],
      },
      {
        title: "Account Abstraction",
        items: [
          { name: "Fin", url: "https://x.com/Fin" },
          { name: "Ready", url: "https://x.com/ready_co" },
          { name: "Privy", url: "https://x.com/privy_io" },
        ],
      },
      {
        title: "Identity & Reputation",
        items: [
          { name: "ENS", url: "https://x.com/ensdomains" },
          { name: "Gitcoin Passport", url: "https://x.com/gitcoin" },
          { name: "WorldCoin", url: "https://x.com/worldnetwork" },
          { name: "POAP", url: "https://x.com/poapxyz" },
          { name: "Kaito", url: "https://x.com/KaitoAI" },
        ],
      },
      {
        title: "Information Markets / DePIN Data",
        items: [
          { name: "Hivemapper", url: "https://x.com/Hivemapper" },
          { name: "DIMO", url: "https://x.com/DIMO_Network" },
          { name: "Grass", url: "https://x.com/grass" },
          { name: "Streamr", url: "https://x.com/streamr" },
          { name: "RaadLabs", url: "https://x.com/RaadLabs" },
          { name: "Kled", url: "https://x.com/useKled", isNew: true },
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
              {
                title: "Governance",
                caption: "Token rights for holders to control protocol",
              },
              { title: "DATs", caption: "Digital Asset Treasury" },
              {
                title: "NFT",
                accent: "pink",
                items: [{ name: "Milady", url: "https://x.com/miladymaker" }],
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
                  {
                    title: "Fiat backed stables",
                    items: [
                      { name: "USDC", url: "https://x.com/USDC" },
                      { name: "USDT", url: "https://x.com/USDT0_to" },
                    ],
                  },
                  {
                    title: "Commodity backed stables",
                    items: [{ name: "PAXG", url: "https://x.com/Paxos" }],
                  },
                  {
                    title: "Physical Asset",
                    caption: "real estate, wrapped bonds/shares, cards, skins",
                    items: [
                      {
                        name: "Superstate",
                        url: "https://x.com/SuperstateInc",
                        isNew: true,
                        description: "tokenized equities w/ full shareholder rights",
                      },
                      {
                        name: "Collector Crypt",
                        url: "https://x.com/Collector_Crypt",
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
                  {
                    title: "Delta Neutral Stables",
                    items: [{ name: "Ethena", url: "https://x.com/ethena" }],
                  },
                  {
                    title: "Crypto Over Collateralised",
                    items: [
                      { name: "DAI via Maker", url: "https://x.com/SkyEcosystem" },
                    ],
                  },
                  {
                    title: "Algo Stables",
                    items: [
                      { name: "Frax", url: "https://x.com/fraxfinance" },
                      { name: "Terra", url: "https://x.com/terra_money" },
                    ],
                  },
                  {
                    title: "Yield-Bearing Stablecoins",
                    caption: "sDAI, sUSDe, aUSDC",
                  },
                  { title: "Bridged Assets", caption: "bridged BTC" },
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
                  { name: "Tornado", url: "https://x.com/TornadoCash" },
                  { name: "Light", url: "https://x.com/LightProtocol" },
                  { name: "Railway", url: "https://x.com/RAILGUN_Project" },
                  { name: "Umbra", url: "https://x.com/UmbraCash" },
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
                items: [{ name: "x402", url: "https://x.com/x402" }],
              },
            ],
          },
          {
            title: "Mining/Staking",
            caption: "this all needs to run somehow",
            children: [
              {
                title: "Restaking",
                items: [{ name: "EigenLayer", url: "https://x.com/eigen_da" }],
              },
            ],
          },
          {
            title: "Intellectual Property",
            items: [{ name: "DATA Network", url: "https://x.com/datafdn" }],
          },
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
              {
                title: "AMM",
                items: [
                  { name: "Uniswap", url: "https://x.com/Uniswap" },
                  { name: "Curve", url: "https://x.com/CurveFinance" },
                  { name: "Raydium", url: "https://x.com/Raydium" },
                  { name: "Aerodrome", url: "https://x.com/aerodromefi" },
                ],
              },
              {
                title: "CLOB",
                items: [
                  { name: "Openbook", url: "https://x.com/OpenBookDEX" },
                  { name: "Hyperliquid", url: "https://x.com/HyperliquidX" },
                ],
              },
              {
                title: "Dark AMM/Prop AMM",
                items: [
                  { name: "Lifinity", url: "https://x.com/Lifinity_io" },
                  { name: "SolFi", url: "https://x.com/ellipsis_labs" },
                ],
              },
              {
                title: "RFQ",
                items: [
                  { name: "UniswapX", url: "https://x.com/Uniswap" },
                  { name: "CoW", url: "https://x.com/CoWSwap" },
                ],
              },
              {
                title: "Dark Pool",
                items: [{ name: "Renegade", url: "https://x.com/renegade_fi" }],
              },
            ],
          },
          {
            title: "NFT",
            items: [
              { name: "OpenSea", url: "https://x.com/opensea" },
              { name: "Tensor", url: "https://x.com/tensor_hq" },
            ],
          },
          {
            title: "Derivatives",
            accent: "teal",
            children: [
              {
                title: "Options",
                items: [
                  { name: "Stryke", url: "https://x.com/stryke_xyz" },
                  { name: "Derive", url: "https://x.com/derivexyz" },
                  {
                    name: "Hypercall",
                    url: "https://x.com/SynapseProtocol",
                    isNew: true,
                  },
                ],
              },
              {
                title: "Perpetuals",
                children: [
                  {
                    title: "Prop AMM",
                    items: [
                      {
                        name: "Phoenix Perps",
                        url: "https://x.com/PhoenixTrade",
                        isNew: true,
                      },
                    ],
                  },
                  {
                    title: "CLOB",
                    items: [
                      { name: "DyDx", url: "https://x.com/dYdX" },
                      { name: "Aster", url: "https://x.com/Aster_DEX" },
                      { name: "Extended", url: "https://x.com/extendedapp" },
                      { name: "Bullet", url: "https://x.com/Bulletxyz" },
                      { name: "Bulk Trade", url: "https://x.com/BulkTrade", isNew: true },
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
                        isNew: true,
                        items: [
                          { name: "Hyperliquid", url: "https://x.com/HyperliquidX" },
                          { name: "GRVT", url: "https://x.com/grvt_io" },
                        ],
                      },
                    ],
                  },
                  {
                    title: "Oracle-based Pool",
                    items: [
                      { name: "GMX", url: "https://x.com/GMX_IO" },
                      { name: "Jupiter", url: "https://x.com/JupiterExchange" },
                    ],
                  },
                  {
                    title: "Martingale LP Pool",
                    isNew: true,
                    items: [
                      { name: "Papertrade", url: "https://x.com/papertrade_xyz" },
                    ],
                  },
                  {
                    title: "RFQ",
                    isNew: true,
                    items: [
                      { name: "Variational", url: "https://x.com/variational_io" },
                    ],
                  },
                  {
                    title: "Dark Pool",
                    caption: "in development",
                  },
                ],
              },
              {
                title: "Multiverse Markets",
                isNew: true,
                items: [
                  {
                    name: "ProofMarkets",
                    url: "https://x.com/ProofMarkets",
                    description: "perp x prediction hybrid — new primitive",
                  },
                ],
              },
            ],
          },
          {
            title: "Insurance",
            items: [{ name: "Nexus Mutual", url: "https://x.com/NexusMutual" }],
          },
          {
            title: "Prediction Markets",
            items: [
              { name: "Polymarket", url: "https://x.com/Polymarket" },
              { name: "Augur", url: "https://x.com/AugurProject" },
              { name: "Azuro", url: "https://x.com/AzuroProtocol" },
              { name: "Melee Markets", url: "https://x.com/meleemarkets", isNew: true },
              { name: "HIP-4", url: "https://x.com/HyperliquidX", isNew: true },
            ],
            children: [
              {
                title: "Parlays",
                isNew: true,
                items: [
                  {
                    name: "ParlayIt",
                    url: "https://x.com/ParlayItGG",
                    description: "collateral engine for combined outcomes",
                  },
                ],
              },
              {
                title: "Supporting Infra",
                isNew: true,
                items: [
                  {
                    name: "Lattica Finance",
                    url: "https://x.com/LatticaFinance",
                    description: "margin/leverage for prediction markets",
                  },
                ],
              },
            ],
          },
          {
            title: "Provably Fair Casino",
            items: [{ name: "Rollbit", url: "https://x.com/rollbit" }],
          },
          {
            title: "Yield Trading / Rate Swaps",
            items: [
              { name: "Pendle", url: "https://x.com/pendle_fi" },
              { name: "RateX", url: "https://x.com/RateX_Dex", isNew: true },
              { name: "Exponent", url: "https://x.com/ExponentFinance", isNew: true },
            ],
          },
          {
            title: "Credit Markets",
            items: [{ name: "LoopScale", url: "https://x.com/LoopScale" }],
          },
        ],
      },

      {
        title: "Asset Management",
        accent: "purple",
        children: [
          {
            title: "Yield Aggregator",
            items: [
              { name: "Yearn", url: "https://x.com/yearnfi" },
              { name: "Lulo", url: "https://x.com/uselulo" },
            ],
          },
          {
            title: "Indexes",
            items: [
              {
                name: "alt.fun",
                url: "https://x.com/altdotfun",
                isNew: true,
                description: "perp positions",
              },
              {
                name: "Cleopetra",
                url: "https://x.com/cleopetrafun",
                isNew: true,
                description: "prediction outcomes",
              },
            ],
          },
          {
            title: "Governance",
            items: [
              { name: "Convex", url: "https://x.com/ConvexFinance" },
              {
                name: "Butterfly",
                img: "https://s2.coinmarketcap.com/static/img/coins/64x64/16236.png",
              },
            ],
            children: [
              {
                title: "Voting and Tooling",
                items: [
                  {
                    name: "Metadao",
                    url: "https://x.com/MetaDAOProject",
                    description: "Futarchy",
                  },
                ],
              },
            ],
          },
          {
            title: "Treasury Management",
            items: [{ name: "Squads", url: "https://x.com/SquadsLabs" }],
          },
          {
            title: "Token Launchers",
            items: [{ name: "Pump.fun", url: "https://x.com/Pumpfun" }],
          },
          {
            title: "Structured Products",
            caption: "automated strategy vaults",
            items: [
              {
                name: "Ribbon",
                url: "https://x.com/RibbonFinance",
                description: "Defunct",
              },
            ],
          },
          {
            title: "Prime Brokerage / Unified Margin",
            isNew: true,
            items: [{ name: "Project 0", url: "https://x.com/project0" }],
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
          {
            title: "Collateralised Debt Position",
            items: [{ name: "Sky", url: "https://x.com/SkyEcosystem" }],
          },
          {
            title: "Collateralised Lending",
            caption: "Margin Trading — user custody",
            items: [{ name: "Aave", url: "https://x.com/aave" }],
            children: [
              {
                title: "Composable Leverage",
                caption: "protocol custody",
                items: [{ name: "Gearbox", url: "https://x.com/GearboxProtocol" }],
              },
            ],
          },
          {
            title: "Liquid staking",
            items: [
              { name: "Lido", url: "https://x.com/LidoFinance" },
              { name: "Jito", url: "https://x.com/jito_sol" },
            ],
          },
          {
            title: "Uncollateralised Flash Loans",
            items: [{ name: "Aave", url: "https://x.com/aave" }],
          },
          {
            title: "Credit / Undercollateralized Lending",
            items: [
              { name: "Maple", url: "https://x.com/maplefinance" },
              {
                name: "APYX",
                url: "https://x.com/apyx_fi",
                isNew: true,
                description: "Digital Credit Yield",
              },
            ],
          },
          {
            title: "Fixed Rate",
            items: [
              { name: "Notional Finance", url: "https://x.com/NotionalFinance" },
              {
                name: "Morpho",
                url: "https://x.com/Morpho",
                isNew: true,
                description: "also collateralised lending",
              },
            ],
          },
          {
            title: "Reserve Currency",
            items: [{ name: "Olympus DAO", url: "https://x.com/OlympusDAO" }],
          },
        ],
      },

      {
        title: "L1",
        accent: "teal",
        items: [
          { name: "Bitcoin", url: "https://x.com/Bitcoin" },
          { name: "Ethereum", url: "https://x.com/ethereum" },
          { name: "Solana", url: "https://x.com/solana" },
          { name: "Plasma", url: "https://x.com/Plasma", isNew: true },
        ],
      },

      {
        title: "Alternate Network Types",
        accent: "teal",
        children: [
          {
            title: "Storage",
            items: [
              { name: "FileCoin", url: "https://x.com/Filecoin" },
              { name: "Arweave", url: "https://x.com/ArweaveEco" },
              { name: "bittorrent", url: "https://x.com/BitTorrent" },
            ],
          },
          {
            title: "Privacy",
            items: [
              { name: "Monero", url: "https://x.com/monero" },
              { name: "Zcash", url: "https://x.com/Zcash" },
            ],
          },
          {
            title: "Networking",
            items: [
              { name: "Helium", url: "https://x.com/helium" },
              { name: "DoubleZero", url: "https://x.com/doublezero" },
            ],
          },
          {
            title: "Social",
            items: [
              { name: "Urbit", url: "https://x.com/urbit" },
              { name: "Farcaster", url: "https://x.com/farcaster_xyz" },
            ],
          },
          {
            title: "L2/Rollups",
            items: [
              { name: "Starknet", url: "https://x.com/Starknet" },
              { name: "Arbitrum", url: "https://x.com/arbitrum" },
              { name: "Lightning Network", url: "https://x.com/lightning" },
              { name: "zkSync", url: "https://x.com/zksync" },
            ],
          },
          {
            title: "Data Availability Layers",
            items: [{ name: "Celestia", url: "https://x.com/Celestia" }],
          },
          {
            title: "Compute",
            children: [
              {
                title: "Encrypted Computation",
                caption: "ZKPs",
                items: [{ name: "Arcium", url: "https://x.com/Arcium" }],
              },
              {
                title: "Decentralised Compute",
                items: [{ name: "Bittensor", url: "https://x.com/bittensor" }],
              },
            ],
          },
        ],
      },
    ],
  },
];

export default taxonomy;
