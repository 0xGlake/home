import type { Group } from "./types";

// The full crypto taxonomy.
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
          { name: "Chainlink", coingeckoId: "chainlink", ticker: "LINK", url: "https://x.com/chainlink" },
          { name: "UMA", coingeckoId: "uma", ticker: "UMA", url: "https://x.com/UMAprotocol" },
          { name: "Pyth", coingeckoId: "pyth-network", ticker: "PYTH", url: "https://x.com/PythNetwork" },
        ],
      },
      {
        title: "Bridge",
        caption: "blockchain <> blockchain",
        items: [
          { name: "Wormhole", coingeckoId: "wormhole", ticker: "W", url: "https://x.com/wormhole" },
          { name: "GardenFinance", coingeckoId: "garden-finance", ticker: "SEED", url: "https://x.com/gardenfi" },
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
        items: [{ name: "The Graph", coingeckoId: "the-graph", ticker: "GRT", url: "https://x.com/graphprotocol" }],
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
                  { name: "Jupiter", coingeckoId: "jupiter", ticker: "JUP", url: "https://x.com/JupiterExchange" },
                  { name: "Cowswap", coingeckoId: "cow-protocol", ticker: "COW", url: "https://x.com/CoWSwap" },
                  { name: "Titan", url: "https://x.com/Titan_Exchange" },
                ],
              },
              {
                title: "NFT",
                items: [
                  { name: "Blur", coingeckoId: "blur", ticker: "BLUR", url: "https://x.com/blur_io" },
                  { name: "Tensor", coingeckoId: "tensor", ticker: "TNSR", url: "https://x.com/tensor_hq" },
                ],
              },
              {
                title: "Perps",
                items: [
                  { name: "Ranger Finance", coingeckoId: "ranger", ticker: "RNGR", url: "https://x.com/ranger_finance" },
                ],
              },
            ],
          },
          {
            title: "Trading Terminals",
            caption: "front-ends wrapping order flow + UI",
            children: [
              {
                title: "Spot",
                items: [
                  { name: "Axiom", url: "https://x.com/AxiomExchange" },
                  { name: "GMGN", url: "https://x.com/gmgnai" },
                  { name: "FOMO", url: "https://x.com/fomo" },
                  { name: "PvP", url: "https://x.com/pvpterminal" },
                  { name: "JTX", coingeckoId: "jito-governance-token", ticker: "JTO", url: "https://x.com/jtx_trade" },
                ],
              },
              {
                title: "Perp",
                items: [
                  { name: "Pear Protocol", coingeckoId: "pear-protocol", ticker: "PEAR", url: "https://x.com/pear_protocol" },
                  { name: "Tread", url: "https://x.com/tread_fi" },
                  { name: "LorisTools", url: "https://x.com/LorisTools" },
                ],
              },
              {
                title: "Prediction",
                items: [{ name: "Hunch", url: "https://x.com/tradeonhunch" }],
              },
              {
                title: "Gamified Trading",
                children: [
                  {
                    title: "Options",
                    items: [{ name: "Euphoria", url: "https://x.com/Euphoria_fi" }],
                  },
                  {
                    title: "Perps",
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
              { name: "Tree Terminal", coingeckoId: "tree", ticker: "TREE", url: "https://x.com/TreeNewsFeed" },
              { name: "Etherscan", url: "https://x.com/etherscan" },
              { name: "Dune Analytics", url: "https://x.com/Dune" },
              { name: "Nansen", url: "https://x.com/nansen_ai" },
              { name: "Arkham", coingeckoId: "arkham", ticker: "ARKM", url: "https://x.com/Arkham" },
              { name: "Artemis", url: "https://x.com/artemis" },
              { name: "Coingecko", url: "https://x.com/coingecko" },
              { name: "TapeSurf", url: "https://x.com/TapeSurfApp" },
            ],
          },
          {
            title: "Research Aggregators",
            items: [
              { name: "Messari", url: "https://x.com/MessariCrypto" },
              { name: "Ahboyash reads", url: "https://x.com/ahboyash" },
              { name: "Delphi", url: "https://x.com/Delphi_Digital" },
            ],
          },
          {
            title: "AI Analyst Agents",
            items: [
              { name: "DefiLlama Agent", url: "https://x.com/DefiLlama" },
              { name: "Artemis Agent", url: "https://x.com/Artemis" },
              { name: "aixbt", coingeckoId: "aixbt", ticker: "AIXBT", url: "https://x.com/aixbt_agent" },
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
          { name: "ENS", coingeckoId: "ethereum-name-service", ticker: "ENS", url: "https://x.com/ensdomains" },
          { name: "Gitcoin Passport", coingeckoId: "gitcoin", ticker: "GTC", url: "https://x.com/gitcoin" },
          { name: "WorldCoin", coingeckoId: "worldcoin-wld", ticker: "WLD", url: "https://x.com/worldnetwork" },
          { name: "POAP", url: "https://x.com/poapxyz" },
          { name: "Kaito", coingeckoId: "kaito", ticker: "KAITO", url: "https://x.com/KaitoAI" },
        ],
      },
      {
        title: "Information Markets / DePIN Data",
        items: [
          { name: "Hivemapper", coingeckoId: "hivemapper", ticker: "HONEY", url: "https://x.com/Hivemapper" },
          { name: "DIMO", coingeckoId: "dimo", ticker: "DIMO", url: "https://x.com/DIMO_Network" },
          { name: "Grass", coingeckoId: "grass", ticker: "GRASS", url: "https://x.com/grass" },
          { name: "Streamr", coingeckoId: "streamr", ticker: "DATA", url: "https://x.com/streamr" },
          { name: "RaadLabs", url: "https://x.com/RaadLabs" },
          { name: "Kled", coingeckoId: "kled-ai", ticker: "KLED", url: "https://x.com/useKled" },
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
                items: [{ name: "Milady", coingeckoNftId: "milady-maker", url: "https://x.com/MiladyMaker333" }],
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
                      { name: "USDC", coingeckoId: "usd-coin", ticker: "USDC", url: "https://x.com/USDC" },
                      { name: "USDT", coingeckoId: "tether", ticker: "USDT", url: "https://x.com/USDT0_to" },
                    ],
                  },
                  {
                    title: "Commodity backed stables",
                    items: [{ name: "PAXG", coingeckoId: "pax-gold", ticker: "PAXG", url: "https://x.com/Paxos" }],
                  },
                  {
                    title: "Physical Asset",
                    caption: "real estate, wrapped bonds/shares, cards, skins",
                    items: [
                      {
                        name: "Superstate",
                        url: "https://x.com/SuperstateInc",
                        description: "tokenized equities w/ full shareholder rights",
                      },
                      {
                        name: "Collector Crypt", coingeckoId: "collector-crypt", ticker: "CARDS",
                        url: "https://x.com/Collector_Crypt",
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
                    items: [{ name: "Ethena", coingeckoId: "ethena", ticker: "ENA", url: "https://x.com/ethena" }],
                  },
                  {
                    title: "Crypto Over Collateralised",
                    items: [
                      { name: "DAI via Maker", coingeckoId: "dai", ticker: "DAI", url: "https://x.com/MakerDaiBot" },
                    ],
                  },
                  {
                    title: "Algo Stables",
                    items: [
                      { name: "Frax", coingeckoId: "frax", ticker: "FRAX", url: "https://x.com/fraxfinance" },
                      { name: "Terra", coingeckoId: "terra-luna-2", ticker: "LUNA", url: "https://x.com/terra_money" },
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
                  { name: "Tornado", coingeckoId: "tornado-cash", ticker: "TORN", url: "https://x.com/TornadoCash" },
                  { name: "Light", url: "https://x.com/LightProtocol" },
                  { name: "Railway", coingeckoId: "railgun", ticker: "RAIL", url: "https://x.com/RAILGUN_Project" },
                  { name: "Umbra", coingeckoId: "umbra", ticker: "UMBRA", url: "https://x.com/UmbraCash" },
                  {
                    name: "Husher Exchange",
                    url: "https://x.com/HusherExchange",
                  },
                ],
              },
              {
                title: "Agentic / Machine Payments",
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
                items: [{ name: "EigenLayer", coingeckoId: "eigenlayer", ticker: "EIGEN", url: "https://x.com/eigen_da" }],
              },
            ],
          },
          {
            title: "Intellectual Property",
            items: [
              { name: "DATA Network", coingeckoId: "data-network", ticker: "DATA", url: "https://x.com/datafdn" },
            ],
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
                  { name: "Uniswap", coingeckoId: "uniswap", ticker: "UNI", url: "https://x.com/Uniswap" },
                  { name: "Curve", coingeckoId: "curve-dao-token", ticker: "CRV", url: "https://x.com/CurveFinance" },
                  { name: "Raydium", coingeckoId: "raydium", ticker: "RAY", url: "https://x.com/Raydium" },
                  { name: "Aerodrome", coingeckoId: "aerodrome-finance", ticker: "AERO", url: "https://x.com/aerodromefi" },
                ],
              },
              {
                title: "CLOB",
                items: [
                  { name: "Openbook", url: "https://x.com/OpenBookDEX" },
                  { name: "Hyperliquid", coingeckoId: "hyperliquid", ticker: "HYPE", url: "https://x.com/HyperliquidX" },
                ],
              },
              {
                title: "Dark AMM/Prop AMM",
                items: [
                  { name: "Lifinity", coingeckoId: "lifinity", ticker: "LFNTY", url: "https://x.com/Lifinity_io" },
                  { name: "SolFi", url: "https://x.com/ellipsis_labs" },
                ],
              },
              {
                title: "RFQ",
                items: [
                  { name: "UniswapX", coingeckoId: "uniswap", ticker: "UNI", url: "https://x.com/Uniswap" },
                  { name: "CoW", coingeckoId: "cow-protocol", ticker: "COW", url: "https://x.com/CoWSwap" },
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
              { name: "Tensor", coingeckoId: "tensor", ticker: "TNSR", url: "https://x.com/tensor_hq" },
            ],
          },
          {
            title: "Derivatives",
            accent: "teal",
            children: [
              {
                title: "Options",
                items: [
                  { name: "Stryke", coingeckoId: "stryke", ticker: "SYK", url: "https://x.com/stryke_xyz" },
                  { name: "Derive", coingeckoId: "derive", ticker: "DRV", url: "https://x.com/derivexyz" },
                  {
                    name: "Hypercall", coingeckoId: "synapse-2", ticker: "SYN",
                    url: "https://x.com/SynapseProtocol",
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
                      },
                    ],
                  },
                  {
                    title: "CLOB",
                    items: [
                      { name: "DyDx", coingeckoId: "dydx-chain", ticker: "DYDX", url: "https://x.com/dYdX" },
                      { name: "Lighter", coingeckoId: "lighter", ticker: "LIT", url: "https://x.com/Lighter_xyz" },
                      { name: "Aster", coingeckoId: "aster-2", ticker: "ASTER", url: "https://x.com/Aster_DEX" },
                      { name: "Extended", url: "https://x.com/extendedapp" },
                      { name: "Bullet", coingeckoId: "zeta", ticker: "ZEX", url: "https://x.com/Bulletxyz" },
                      { name: "Bulk Trade", url: "https://x.com/BulkTrade" },
                      {
                        name: "Meridian",
                        url: "https://x.com/meridiandotxyz",
                      },
                      {
                        name: "BlinkTrade",
                        url: "https://x.com/blinktrade",
                        description:
                          "Layer 2 ZK-rollup for spot and perpetual trading",
                      },
                    ],
                    children: [
                      {
                        title: "Cross-Margin",
                        items: [
                          { name: "Hyperliquid", coingeckoId: "hyperliquid", ticker: "HYPE", url: "https://x.com/HyperliquidX" },
                          { name: "GRVT", url: "https://x.com/grvt_io" },
                        ],
                      },
                    ],
                  },
                  {
                    title: "Oracle-based Pool",
                    items: [
                      { name: "GMX", coingeckoId: "gmx", ticker: "GMX", url: "https://x.com/GMX_IO" },
                      { name: "Jupiter", coingeckoId: "jupiter", ticker: "JUP", url: "https://x.com/JupiterExchange" },
                      { name: "Ostium", url: "https://x.com/Ostium" },
                    ],
                  },
                  {
                    title: "Martingale LP Pool",
                    items: [
                      { name: "Papertrade", url: "https://x.com/papertrade_xyz" },
                    ],
                  },
                  {
                    title: "RFQ",
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
            items: [{ name: "Nexus Mutual", coingeckoId: "nxm", ticker: "NXM", url: "https://x.com/NexusMutual" }],
          },
          {
            title: "Prediction Markets",
            items: [
              { name: "Polymarket", url: "https://x.com/Polymarket" },
              { name: "Augur", coingeckoId: "augur", ticker: "REP", url: "https://x.com/AugurProject" },
              { name: "Azuro", coingeckoId: "azuro-protocol", ticker: "AZUR", url: "https://x.com/AzuroProtocol" },
              { name: "Melee Markets", url: "https://x.com/meleemarkets" },
              { name: "HIP-4", coingeckoId: "hyperliquid", ticker: "HYPE", url: "https://x.com/HyperliquidX" },
            ],
            children: [
              {
                title: "Parlays",
                items: [
                  {
                    name: "ParlayIt",
                    url: "https://x.com/ParlayItGG",
                    description: "collateral engine for combined outcomes",
                  },
                ],
              },
              {
                title: "Margin Trading",
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
            items: [{ name: "Rollbit", coingeckoId: "rollbit-coin", ticker: "RLB", url: "https://x.com/rollbit" }],
          },
          {
            title: "Yield Trading / Rate Swaps",
            items: [
              { name: "Pendle", coingeckoId: "pendle", ticker: "PENDLE", url: "https://x.com/pendle_fi" },
              { name: "RateX", url: "https://x.com/RateX_Dex" },
              { name: "Exponent", url: "https://x.com/ExponentFinance" },
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
              { name: "Yearn", coingeckoId: "yearn-finance", ticker: "YFI", url: "https://x.com/yearnfi" },
              { name: "Lulo", url: "https://x.com/uselulo" },
            ],
          },
          {
            title: "Indexes",
            items: [
              {
                name: "alt.fun",
                url: "https://x.com/altdotfun",
                description: "perp positions",
              },
              {
                name: "Cleopetra",
                url: "https://x.com/cleopetrafun",
                description: "prediction outcomes",
              },
            ],
          },
          {
            title: "Governance",
            items: [
              { name: "Convex", coingeckoId: "convex-finance", ticker: "CVX", url: "https://x.com/ConvexFinance" },
              {
                name: "Butterfly", coingeckoId: "redacted-cartel", ticker: "BTRFLY",
                img: "https://s2.coinmarketcap.com/static/img/coins/64x64/16236.png",
              },
            ],
            children: [
              {
                title: "Voting and Tooling",
                items: [
                  {
                    name: "Metadao", coingeckoId: "meta-2", ticker: "META",
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
            items: [
              { name: "Pump.fun", coingeckoId: "pump-fun", ticker: "PUMP", url: "https://x.com/Pumpfun" },
            ],
          },
          {
            title: "Structured Products",
            caption: "automated strategy vaults",
            items: [
              {
                name: "Ribbon", coingeckoId: "aevo", ticker: "AEVO",
                url: "https://x.com/RibbonFinance",
                description: "Defunct",
              },
            ],
          },
          {
            title: "Prime Brokerage / Unified Margin",
            items: [{ name: "Project 0", url: "https://x.com/project0" }],
          },
          {
            title: "Prop Trading Firms",
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
            items: [{ name: "Sky", coingeckoId: "sky", ticker: "SKY", url: "https://x.com/SkyEcosystem" }],
          },
          {
            title: "Collateralised Lending",
            caption: "Margin Trading — user custody",
            items: [{ name: "Aave", coingeckoId: "aave", ticker: "AAVE", url: "https://x.com/aave" }],
            children: [
              {
                title: "Composable Leverage",
                caption: "protocol custody",
                items: [{ name: "Gearbox", coingeckoId: "gearbox", ticker: "GEAR", url: "https://x.com/GearboxProtocol" }],
              },
            ],
          },
          {
            title: "Liquid staking",
            items: [
              { name: "Lido", coingeckoId: "lido-dao", ticker: "LDO", url: "https://x.com/LidoFinance" },
              { name: "Jito", coingeckoId: "jito-governance-token", ticker: "JTO", url: "https://x.com/jito_sol" },
            ],
          },
          {
            title: "Uncollateralised Flash Loans",
            items: [{ name: "Aave", coingeckoId: "aave", ticker: "AAVE", url: "https://x.com/aave" }],
          },
          {
            title: "Credit / Undercollateralized Lending",
            items: [
              { name: "Maple", coingeckoId: "maple-finance", ticker: "SYRUP", url: "https://x.com/maplefinance" },
              {
                name: "APYX",
                url: "https://x.com/apyx_fi",
                description: "Digital Credit Yield",
              },
            ],
          },
          {
            title: "Fixed Rate",
            items: [
              { name: "Notional Finance", coingeckoId: "notional-finance", ticker: "NOTE", url: "https://x.com/NotionalFinance" },
              {
                name: "Morpho", coingeckoId: "morpho", ticker: "MORPHO",
                url: "https://x.com/Morpho",
                description: "also collateralised lending",
              },
            ],
          },
          {
            title: "Reserve Currency",
            items: [{ name: "Olympus DAO", coingeckoId: "olympus", ticker: "OHM", url: "https://x.com/OlympusDAO" }],
          },
        ],
      },

      {
        title: "L1",
        accent: "teal",
        items: [
          { name: "Bitcoin", coingeckoId: "bitcoin", ticker: "BTC", url: "https://x.com/Bitcoin" },
          { name: "Ethereum", coingeckoId: "ethereum", ticker: "ETH", url: "https://x.com/ethereum" },
          { name: "Solana", coingeckoId: "solana", ticker: "SOL", url: "https://x.com/solana" },
          { name: "Plasma", coingeckoId: "plasma", ticker: "XPL", url: "https://x.com/Plasma" },
        ],
      },

      {
        title: "Alternate Network Types",
        accent: "teal",
        children: [
          {
            title: "Storage",
            items: [
              { name: "FileCoin", coingeckoId: "filecoin", ticker: "FIL", url: "https://x.com/Filecoin" },
              { name: "Arweave", coingeckoId: "arweave", ticker: "AR", url: "https://x.com/ArweaveEco" },
              { name: "bittorrent", coingeckoId: "bittorrent", ticker: "BTT", url: "https://x.com/BitTorrent" },
            ],
          },
          {
            title: "Privacy",
            items: [
              { name: "Monero", coingeckoId: "monero", ticker: "XMR", url: "https://x.com/monero" },
              { name: "Zcash", coingeckoId: "zcash", ticker: "ZEC", url: "https://x.com/Zcash" },
            ],
          },
          {
            title: "Networking",
            items: [
              { name: "Helium", coingeckoId: "helium", ticker: "HNT", url: "https://x.com/helium" },
              { name: "DoubleZero", coingeckoId: "doublezero", ticker: "2Z", url: "https://x.com/doublezero" },
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
              { name: "Starknet", coingeckoId: "starknet", ticker: "STRK", url: "https://x.com/Starknet" },
              { name: "Arbitrum", coingeckoId: "arbitrum", ticker: "ARB", url: "https://x.com/arbitrum" },
              { name: "Lightning Network", url: "https://x.com/lightning" },
              { name: "zkSync", coingeckoId: "zksync", ticker: "ZK", url: "https://x.com/zksync" },
            ],
          },
          {
            title: "Data Availability Layers",
            items: [{ name: "Celestia", coingeckoId: "celestia", ticker: "TIA", url: "https://x.com/Celestia" }],
          },
          {
            title: "Compute",
            children: [
              {
                title: "Encrypted Computation",
                caption: "ZKPs",
                items: [{ name: "Arcium", coingeckoId: "arcium", ticker: "ARX", url: "https://x.com/Arcium" }],
              },
              {
                title: "Decentralised Compute",
                items: [{ name: "Bittensor", coingeckoId: "bittensor", ticker: "TAO", url: "https://x.com/bittensor" }],
              },
            ],
          },
        ],
      },
    ],
  },
];

export default taxonomy;
