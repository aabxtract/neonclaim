"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { formatEther, type BaseError } from "viem";
import { getAllocationForAddress } from "@/lib/merkle";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Gift, ExternalLink } from "lucide-react";

export function ClaimCard() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const allocation = useMemo(() => {
    if (isConnected && address) {
      return getAllocationForAddress(address);
    }
    return null;
  }, [isConnected, address]);

  const isEligible = allocation !== null;
  
  // MOCK: This would use wagmi's useReadContract in a real app
  // For now, we just use local state `isClaimed`
  const hasAlreadyClaimed = isClaimed;

  const handleClaim = async () => {
    if (!allocation) return;

    setIsClaiming(true);

    // MOCK: This simulates a contract write call
    console.log("Claiming with proof:", allocation.proof);
    console.log("Amount:", allocation.amount);

    try {
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate a random transaction hash
      const mockTxHash = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setTxHash(mockTxHash);
      
      setIsClaimed(true);
      toast({
        title: "Claim Successful!",
        description: "Your tokens are on their way.",
      });

    } catch (error) {
      const err = error as BaseError;
      toast({
        variant: "destructive",
        title: "Claim Failed",
        description: err.shortMessage || "An unknown error occurred.",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const claimButtonDisabled = !isEligible || isClaiming || hasAlreadyClaimed;
  
  const getButtonState = () => {
      if(isClaiming) return { text: "Claiming...", icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" /> };
      if(hasAlreadyClaimed) return { text: "Claimed", icon: <CheckCircle className="mr-2 h-4 w-4" /> };
      if(!isEligible) return { text: "Not Eligible", icon: <XCircle className="mr-2 h-4 w-4" /> };
      return { text: "Claim Tokens", icon: <Gift className="mr-2 h-4 w-4" /> };
  }

  const buttonState = getButtonState();

  return (
    <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Airdrop Claim</CardTitle>
        <CardDescription className="text-center">
          Check your eligibility and claim your tokens.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {!isConnected ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Please connect your wallet to check eligibility.</p>
          </div>
        ) : (
          <>
            <div className="w-full text-center bg-secondary/50 p-6 rounded-lg">
              {isEligible ? (
                <>
                  <p className="text-muted-foreground">You are eligible to claim:</p>
                  <p className="font-headline text-4xl text-accent">
                    {formatEther(BigInt(allocation.amount))}
                  </p>
                  <p className="font-bold text-lg">NEON</p>
                </>
              ) : (
                <p className="font-headline text-2xl text-muted-foreground">
                  Sorry, you are not eligible for this airdrop.
                </p>
              )}
            </div>
            <Button
              onClick={handleClaim}
              disabled={claimButtonDisabled}
              size="lg"
              className="w-full font-bold text-lg"
            >
              {buttonState.icon}
              {buttonState.text}
            </Button>
            {txHash && (
                <a 
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline flex items-center"
                >
                    View on Etherscan <ExternalLink className="ml-1 h-4 w-4" />
                </a>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
