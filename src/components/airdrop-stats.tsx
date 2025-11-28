"use client";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatEther } from "viem";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { airdropContract } from "@/lib/contracts";

// Define the total airdrop pool
const TOTAL_AIRDROP_POOL = 1_000_000_000n * 10n ** 18n; // 1 Billion NEON

type AirdropStatsData = {
  totalClaimed: bigint;
  uniqueClaimers: number;
};

export function AirdropStats() {
  const [stats, setStats] = useState<AirdropStatsData | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    async function fetchStats() {
      if (!publicClient) return;
      try {
        const logs = await publicClient.getContractEvents({
          address: airdropContract.address,
          abi: airdropContract.abi,
          eventName: 'Claimed',
          fromBlock: 0n,
          toBlock: 'latest'
        });

        const uniqueAddresses = new Set<string>();
        let totalClaimed = 0n;

        logs.forEach(log => {
          if (log.args.user) {
            uniqueAddresses.add(log.args.user);
          }
          if (log.args.amount) {
            totalClaimed += log.args.amount;
          }
        });

        setStats({
          totalClaimed: totalClaimed,
          uniqueClaimers: uniqueAddresses.size,
        });

      } catch (error) {
        console.error("Failed to fetch airdrop stats:", error);
      }
    }

    fetchStats();
    
    // Set up a listener for new claims to update stats in real-time
    if(publicClient) {
        const unwatch = publicClient.watchContractEvent({
            address: airdropContract.address,
            abi: airdropContract.abi,
            eventName: 'Claimed',
            onLogs: (logs) => {
                logs.forEach(log => {
                    setStats(prevStats => {
                        if (!prevStats) return null;
                        const newTotalClaimed = prevStats.totalClaimed + (log.args.amount || 0n);
                        // This is a simplified way to update claimers; a Set would be better for large numbers.
                        // For this UI, we just refetch for simplicity on new events.
                        fetchStats();
                        return prevStats; // returning old state until fetch completes
                    });
                });
            }
        });

        return () => unwatch();
    }

  }, [publicClient]);

  if (!stats) {
    return (
        <Card className="w-full max-w-md bg-card/30 backdrop-blur-lg border-primary/10">
            <CardHeader>
                <CardTitle className="text-xl text-center">Live Airdrop Stats</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-24">
                <p>Loading stats...</p>
            </CardContent>
        </Card>
    );
  }

  const percentageClaimed = Number((stats.totalClaimed * 10000n) / TOTAL_AIRDROP_POOL) / 100;
  const formattedTotalClaimed = formatEther(stats.totalClaimed);

  return (
    <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Live Airdrop Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <div className="flex justify-between mb-1 text-sm">
                <span className="text-muted-foreground">Claim Progress</span>
                <span className="font-medium text-accent">{percentageClaimed.toFixed(2)}%</span>
            </div>
            <Progress value={percentageClaimed} className="w-full h-2" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Claimed</p>
            <p className="text-2xl font-bold font-headline">{Number(formattedTotalClaimed).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unique Claimers</p>
            <p className="text-2xl font-bold font-headline">{stats.uniqueClaimers.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}