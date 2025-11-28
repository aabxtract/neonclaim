import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { ClaimCard } from "@/components/claim-card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-4 px-4 sm:px-6 md:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline text-primary">
          NeonClaim
        </h1>
        <ConnectWalletButton />
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <ClaimCard />
      </main>
      <footer className="text-center p-4 text-xs text-muted-foreground">
        <p>Built for the future of airdrops.</p>
      </footer>
    </div>
  );
}
