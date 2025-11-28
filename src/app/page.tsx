import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { ClaimCard } from "@/components/claim-card";
import { AirdropStats } from "@/components/airdrop-stats";
import { Suspense } from "react";
import { AirdropStatsSkeleton } from "@/components/airdrop-stats-skeleton";
import { TokenBalance } from "@/components/token-balance";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold font-headline text-primary">
          NeonClaim
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <TokenBalance />
          <ConnectWalletButton />
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4 space-y-8">
        <ClaimCard />
        <Suspense fallback={<AirdropStatsSkeleton />}>
          <AirdropStats />
        </Suspense>
      </main>
      <footer className="text-center p-4 text-xs text-muted-foreground">
        <p>Built for the future of airdrops.</p>
      </footer>
    </div>
  );
}
