"use client";

import * as React from "react";
import "@rainbow-me/rainbowkit/styles.css";

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "@/src/client/auth/AuthProvider";

const zeroGTestnet = {
  id: 16602,
  name: "0G Galileo Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "0G",
    symbol: "0G",
  },
  rpcUrls: {
    default: { http: ["https://evmrpc-testnet.0g.ai"] },
    public: { http: ["https://evmrpc-testnet.0g.ai"] },
  },
  blockExplorers: {
    default: { name: "ChainScan", url: "https://chainscan-galileo.0g.ai" },
  },
};

const zeroGMainnet = {
  id: 16661,
  name: "0G Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "0G",
    symbol: "0G",
  },
  rpcUrls: {
    default: { http: ["https://evmrpc.0g.ai"] },
    public: { http: ["https://evmrpc.0g.ai"] },
  },
  blockExplorers: {
    default: { name: "ChainScan", url: "https://chainscan.0g.ai" },
  },
};

const config = getDefaultConfig({
  appName: "0GPilot",
  projectId: "4b971a742ce74f3ffc8fef65c71a33df",
  chains: [zeroGTestnet, zeroGMainnet],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <AuthProvider>{children}</AuthProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
