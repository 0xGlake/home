import type { Accent } from "./types";

// Data contract + content for the Tokenomics Taxonomy.
//
// Unlike the crypto taxonomy, the leaves here are *concepts*, not protocols:
// there are no icons or prices, the hover affordance is a definition. The four
// tiers form a token's lifecycle — Supply → Distribution → Value → Governance —
// which the swimlane layout renders top-to-bottom in reading order.

// A single leaf concept. `def` is surfaced in the hover tooltip.
export interface Concept {
  name: string;
  def: string;
  // For concepts that also live in another tier (e.g. Governance Rights), a short
  // note rendered as a subtle cross-reference caption.
  crossRef?: string;
  // Pipeline stages list their variants inline beneath the name.
  options?: string[];
}

// A box of related concepts. `kind` drives the small "what / how" badge that
// encodes the recurring policy-vs-mechanism duality.
export interface Category {
  title: string;
  note?: string;
  accent?: Accent; // defaults to the tier accent
  kind?: "policy" | "mechanism";
  span?: "full"; // span the whole tier width (used by the governance pipeline)
  concepts: Concept[];
}

// One horizontal swimlane.
export interface Tier {
  id: string; // anchor target for the lifecycle nav
  label: string; // left-rail heading
  blurb: string; // left-rail one-liner: what this stage of the lifecycle does
  accent: Accent;
  categories: Category[];
}

export const tokenomics: Tier[] = [
  {
    id: "supply",
    label: "Supply",
    blurb: "How many tokens exist, and how that number changes over time.",
    accent: "teal",
    categories: [
      {
        title: "Supply Policy",
        note: "the rule that governs total supply",
        kind: "policy",
        concepts: [
          { name: "Fixed Supply", def: "A hard cap set at genesis; no new tokens are ever minted (e.g. Bitcoin's 21M)." },
          { name: "Inflationary", def: "Supply grows over time — usually to fund emissions or rewards — diluting existing holders." },
          { name: "Deflationary", def: "Supply contracts over time, typically via burns, raising scarcity per token." },
          { name: "Event Triggered", def: "Supply changes are conditioned on events (milestones, price thresholds, votes) rather than a fixed schedule." },
        ],
      },
      {
        title: "Issuance Mechanisms",
        note: "the machinery that mints or removes supply",
        kind: "mechanism",
        concepts: [
          { name: "Bonding Curves", def: "Price is a deterministic function of supply; minting and burning move along the curve." },
          { name: "Rebase / Elastic Supply", def: "Every wallet's balance expands or contracts algorithmically to steer toward a target price." },
          { name: "Algorithmic Stabilisation", def: "The protocol mints or burns to defend a peg or target without holding full reserves." },
          { name: "Reserve Backed Supply", def: "New tokens are issued only against collateral held in reserve." },
        ],
      },
    ],
  },
  {
    id: "distribution",
    label: "Distribution",
    blurb: "Who receives the tokens, and through what channel they arrive.",
    accent: "sky",
    categories: [
      {
        title: "Allocation Policy",
        note: "who the supply is earmarked for",
        kind: "policy",
        concepts: [
          { name: "Founder / Team Allocation", def: "Share reserved for founders and core contributors, almost always vested." },
          { name: "Treasury / Ecosystem Allocation", def: "Tokens held by the protocol to fund grants, incentives and operations." },
          { name: "Community Allocation", def: "Portion earmarked for users, contributors and broad public ownership." },
          { name: "Investor Allocations", def: "Tranches sold to seed / strategic investors, typically under lockups." },
        ],
      },
      {
        title: "Delivery Mechanisms",
        note: "how tokens actually reach wallets",
        kind: "mechanism",
        concepts: [
          { name: "Mining / Stake / Validation", def: "Tokens earned by securing the network through work, stake or validation." },
          { name: "Initial Sale", def: "Public or private sale events (ICO / IDO / IEO) exchanging tokens for capital." },
          { name: "Airdrops", def: "Free distribution to targeted wallets to bootstrap ownership and usage." },
          { name: "Vesting / Unlocks", def: "Scheduled release of locked allocations over time to limit sell pressure." },
        ],
      },
    ],
  },
  {
    id: "value",
    label: "Value",
    blurb: "Why the token is worth holding — the demand and cash-flow side.",
    accent: "amber",
    categories: [
      {
        title: "Supply-Driven Scarcity",
        note: "value from shrinking the float",
        concepts: [
          { name: "Burn Mechanisms", def: "Permanently removing tokens from circulation to reduce supply." },
          { name: "Buyback Programs", def: "The protocol uses revenue to repurchase its token from the open market." },
        ],
      },
      {
        title: "Yield Distribution",
        note: "value from protocol cash flows",
        concepts: [
          { name: "Fee Capture", def: "Protocol revenue routed to token holders or stakers." },
          { name: "Staking Yields", def: "Rewards paid for locking tokens to secure or support the protocol." },
          { name: "MEV Redistribution", def: "Returning extracted MEV back to holders or users instead of validators alone." },
        ],
      },
      {
        title: "Utility Driven Demand",
        note: "value from needing the token to do things",
        concepts: [
          { name: "Access and Usage", def: "The token is required to use, pay for, or unlock protocol features." },
          { name: "Collateral and Locking", def: "The token is posted as collateral or locked to access functionality." },
          { name: "Governance Rights", def: "Holding the token grants voting power over the protocol.", crossRef: "see Governance ↓" },
        ],
      },
      {
        title: "Treasury Claims",
        note: "value from a claim on protocol assets",
        concepts: [
          { name: "Liquidation Waterfall Rights", def: "Priority order in which claimants are paid out from a liquidation." },
          { name: "Treasury Backed Floor", def: "A redemption value backed by the treasury that sets a soft price floor." },
          { name: "Index Token Redemption", def: "The token is redeemable for a basket of underlying assets." },
          { name: "Surplus Distribution", def: "Excess treasury value paid out to token holders." },
        ],
      },
    ],
  },
  {
    id: "governance",
    label: "Governance",
    blurb: "Who holds power, how decisions are made, and where the limits are. power → process → incentives → boundaries",
    accent: "purple",
    categories: [
      {
        title: "Power Models",
        note: "how voting weight is assigned",
        concepts: [
          { name: "Token Weighted", def: "One token, one vote — influence scales linearly with holdings." },
          { name: "Quadratic Voting", def: "Vote cost rises with the square of votes cast, dampening whale dominance." },
          { name: "Conviction Voting", def: "Voting power on a proposal grows the longer you continuously back it." },
          { name: "Delegated Voting", def: "Holders delegate their voting power to representatives who vote on their behalf." },
          { name: "Ve-Tokenomics", def: "Vote-escrowed tokens: lock for longer to gain more voting power and rewards." },
          { name: "Exit Rights", def: "Mechanisms (e.g. ragequit) that let dissenters withdraw their share rather than be outvoted." },
        ],
      },
      {
        title: "Economic Layer",
        note: "the markets that form around votes",
        concepts: [
          { name: "Vote Incentives", def: "Bribe markets paying holders to vote a particular way." },
          { name: "Gauge Wars", def: "Competition to steer emissions via gauge-weight votes (popularised by Curve)." },
          { name: "Futarchy & Holographic", def: "Decisions driven by prediction markets (futarchy) or by surfacing proposals likely to pass (holographic consensus)." },
          { name: "Meta Governance", def: "Using one protocol's tokens to govern another protocol it holds positions in." },
          { name: "Governance Extractable Value", def: "Value captured by exploiting governance power itself (the governance analogue of MEV)." },
        ],
      },
      {
        title: "Pipeline",
        note: "Proposal → Vote → Execution",
        span: "full",
        concepts: [
          { name: "Gating", def: "Who is allowed to submit a proposal in the first place.", options: ["permissionless", "token-gated", "reputation-gated", "delegate-only"] },
          { name: "Voting Methods", def: "How votes are tallied and what threshold counts as passing.", options: ["simple majority", "supermajority", "quorum", "ranked choice", "approval", "shielded / ZK"] },
          { name: "On-Chain vs Off-Chain", def: "Where the vote lives and whether it binds.", options: ["Snapshot signaling (non-binding)", "on-chain proposals (auto-execute)"] },
          { name: "Execution", def: "How a passed proposal is actually enacted.", options: ["timelock delay", "optimistic w/ veto window", "multisig", "autonomous on-chain"] },
          { name: "Emergency Overrides", def: "Escape hatches for crises that bypass the normal pipeline.", options: ["guardian veto", "security council", "circuit breakers"] },
          { name: "Scope Ranges", def: "What governance is even allowed to touch, from least to most consequential.", options: ["parameter tuning", "treasury allocation", "protocol upgrades", "changing voting rules"] },
        ],
      },
    ],
  },
];
