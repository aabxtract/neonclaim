"use client";

import { useAccount, useBalance } from "wagmi";
import { neonTokenContract } from "@/lib/contracts";
import { Skeleton } from "./ui/skeleton";

export function TokenBalance() {
  const { address, isConnected } = useAccount();
  const { data: balance, isLoading } = useBalance({
    address: address,
    token: neonTokenContract.address,
    query: {
      enabled: isConnected,
      refetchInterval: 5000,
    }
  });

  if (!isConnected) {
    return null;
  }
  
  if (isLoading) {
    return <Skeleton className="h-7 w-28" />;
  }

  return (
    <div className="hidden sm:flex items-center justify-center text-sm font-medium border border-primary/20 bg-secondary/30 px-3 py-1.5 rounded-lg text-accent">
      {parseFloat(balance?.formatted || "0").toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
      <span className="ml-2 text-white">NEON</span>
    </div>
  );
}
