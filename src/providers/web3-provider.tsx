"use client";

import React, { type ReactNode } from 'react';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "d818a3583563969ab8997577536640c5";

if (!projectId || projectId === "YOUR_PROJECT_ID") {
    console.warn("Warning: Using default WalletConnect project ID. Please set NEXT_PUBLIC_WC_PROJECT_ID in your .env.local file for production use.");
}

const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected({
        shimDisconnect: true,
    }),
    walletConnect({
      projectId,
      metadata: {
        name: 'NeonClaim',
        description: 'Airdrop claim dApp with a futuristic vibe.',
        url: 'https://neon-claim.vercel.app',
        icons: ['https://neon-claim.vercel.app/icon.png']
      }
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
