import { NextRequest, NextResponse } from "next/server";
import { verifySession, extractBearerToken } from "@/server/auth/session";

export const dynamic = "force-dynamic";

const TEMPLATES = [
  {
    id: "nft-marketplace",
    title: "NFT Marketplace",
    description: "Create a full NFT marketplace with royalties and advanced search.",
    icon: "globe",
    category: "web3",
    prompt:
      "Build a full NFT marketplace on 0G Chain using Next.js and Solidity. Include ERC-721 smart contracts with royalty support (EIP-2981), lazy minting, a listing/auction system, advanced search and filtering by collection, and a React storefront with RainbowKit wallet integration. Use 0G Storage for metadata and images. Database: PostgreSQL for off-chain indexing.",
    tags: ["NFT", "ERC-721", "Marketplace", "Solidity"],
  },
  {
    id: "staking-dapp",
    title: "Staking DApp",
    description: "Build a staking platform with variable rewards and lock periods.",
    icon: "layers",
    category: "defi",
    prompt:
      "Build a staking DApp on 0G Chain using Next.js and Solidity. Include a staking smart contract supporting multiple reward tiers, configurable lock periods (30/90/180 days), auto-compound functionality, and an emergency withdrawal mechanism. Frontend: a React dashboard showing APY, TVL, staked balance, and claimable rewards. Integrate with RainbowKit and use ethers.js for contract interaction.",
    tags: ["Staking", "DeFi", "ERC-20", "Rewards"],
  },
  {
    id: "dao-governance",
    title: "DAO Governance",
    description: "Create a DAO voting system with token-gated access.",
    icon: "shield",
    category: "dao",
    prompt:
      "Build a DAO governance platform on 0G Chain. Include an ERC-20 governance token with delegation, a Governor contract (OpenZeppelin) for on-chain proposals and voting, a timelock controller for proposal execution, and a Next.js frontend with proposal creation, voting UI, and token-gated member dashboard. Store proposal descriptions and discussion threads in 0G Storage.",
    tags: ["DAO", "Governance", "Voting", "OpenZeppelin"],
  },
  {
    id: "defi-dashboard",
    title: "DeFi Dashboard",
    description: "Build a DeFi analytics dashboard with real-time price feeds.",
    icon: "trending-up",
    category: "defi",
    prompt:
      "Build a DeFi analytics dashboard using Next.js and 0G Chain. Integrate Chainlink price feeds for real-time token prices, display portfolio value, P&L, and yield positions across protocols. Include a wallet asset tracker, transaction history, and APY comparison chart. Backend: Node.js API with PostgreSQL for historical data caching. Styling: TailwindCSS with dark mode.",
    tags: ["DeFi", "Analytics", "Price Feeds", "Portfolio"],
  },
  {
    id: "web3-social",
    title: "Web3 Social",
    description: "Decentralised social platform with on-chain posts.",
    icon: "users",
    category: "social",
    prompt:
      "Build a decentralised social media platform on 0G Chain. Posts and profile metadata are stored in 0G Storage (immutable, content-addressed). Smart contracts handle follow relationships, tipping in OG tokens, and content moderation votes. Frontend: Next.js with an infinite-scroll feed, profile pages, and a rich text post editor. Authentication via SIWE wallet sign-in.",
    tags: ["Social", "0G Storage", "SIWE", "Web3"],
  },
  {
    id: "cross-chain-dex",
    title: "Cross-Chain DEX",
    description: "DEX aggregator using 0G infrastructure for bridging.",
    icon: "repeat",
    category: "defi",
    prompt:
      "Build a cross-chain DEX aggregator on 0G Chain. Integrate 0G's cross-chain messaging for asset bridging, aggregate swap routes from multiple AMMs, implement a Solidity router contract with slippage protection, and display a Next.js trading UI with token selector, price impact, and swap history. Use 0G Compute for real-time route optimisation.",
    tags: ["DEX", "Cross-chain", "AMM", "Bridge"],
  },
];

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req.headers.get("Authorization"));
  if (token) {
    await verifySession(token);
  }

  const category = req.nextUrl.searchParams.get("category");
  const filtered = category
    ? TEMPLATES.filter((t) => t.category === category)
    : TEMPLATES;

  return NextResponse.json({ templates: filtered });
}
