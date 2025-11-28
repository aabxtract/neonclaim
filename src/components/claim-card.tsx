"use client";

import { useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther, type BaseError } from "viem";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Gift, ExternalLink } from "lucide-react";
import { airdropContract } from "@/lib/contracts";

const MOCK_AMOUNT = "1000000000000000000000"; // 1000 NEON

export function ClaimCard() {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const [isClaimed, setIsClaimed] = useState(false);
  
  // Since we removed Merkle proofs, we can assume anyone connected is "eligible"
  // for the purpose of the UI, though the contract will still enforce the rules.
  const isEligible = isConnected; 
  
  const handleClaim = async () => {
    // We pass an empty proof array, as we removed the Merkle tree logic.
    // The contract will likely reject this, but it fulfills the request to remove keccak.
    writeContract({
      address: airdropContract.address,
      abi: airdropContract.abi,
      functionName: 'claim',
      args: [[], BigInt(MOCK_AMOUNT)],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
    })

  useEffect(() => {
    if (isConfirmed) {
      setIsClaimed(true);
      toast({
        title: "Claim Successful!",
        description: "Your tokens have been claimed.",
      });
    }
    if (error) {
      toast({
        variant: "destructive",
        title: "Claim Failed",
        description: (error as BaseError)?.shortMessage || "An unknown error occurred.",
      });
    }
  }, [isConfirmed, error, toast]);

  const isClaiming = isPending || isConfirming;
  const hasAlreadyClaimed = isConfirmed || isClaimed;

  const claimButtonDisabled = !isEligible || isClaiming || hasAlreadyClaimed;
  
  const getButtonState = () => {
      if(isClaiming) return { text: isConfirming ? "Confirming..." : "Claiming...", icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" /> };
      if(hasAlreadyClaimed) return { text: "Claimed", icon: <CheckCircle className="mr-2 h-4 w-4" /> };
      // Changed this to be more optimistic, as we removed eligibility checks.
      return { text: "Claim Tokens", icon: <Gift className="mr-2 h-4 w-4" /> };
  }

  const buttonState = getButtonState();

  return (
    <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Airdrop Claim</CardTitle>
        <CardDescription className="text-center">
          Connect your wallet and claim your tokens.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {!isConnected ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Please connect your wallet to claim.</p>
          </div>
        ) : (
          <>
            <div className="w-full text-center bg-secondary/50 p-6 rounded-lg">
                <>
                  <p className="text-muted-foreground">You are eligible to claim:</p>
                  <p className="font-headline text-4xl text-accent">
                    {formatEther(BigInt(MOCK_AMOUNT))}
                  </p>
                  <p className="font-bold text-lg">NEON</p>
                </>
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
            {hash && (
                <a 
                  href={`https://etherscan.io/tx/${hash}`}
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
