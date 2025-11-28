"use client";

import { useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { formatEther, type BaseError } from "viem";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Gift, ExternalLink, ShieldQuestion, Diamond, Sparkles, UserCheck } from "lucide-react";
import { airdropContract } from "@/lib/contracts";
import whitelist from "@/lib/whitelist.json";

type WhitelistEntry = {
  address: string;
  amount: string;
  tier: string;
  reason: string;
};

const tierIcons: { [key: string]: React.ReactNode } = {
  "Diamond Hands": <Diamond className="w-10 h-10 text-blue-400" />,
  "Active Trader": <Sparkles className="w-10 h-10 text-purple-400" />,
  "Early Adopter": <UserCheck className="w-10 h-10 text-green-400" />,
};

export function ClaimCard() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const [isClaimed, setIsClaimed] = useState(false);
  const [eligibility, setEligibility] = useState<WhitelistEntry | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      const entry = whitelist.find(
        (item) => item.address.toLowerCase() === address.toLowerCase()
      ) as WhitelistEntry | undefined;
      setEligibility(entry || null);
    } else {
      setEligibility(null);
    }
  }, [isConnected, address]);
  
  const handleClaim = async () => {
    if (!eligibility) return;
    writeContract({
      address: airdropContract.address,
      abi: airdropContract.abi,
      functionName: 'claim',
      args: [[], BigInt(eligibility.amount)],
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
        description: "Your tokens have been added to your wallet.",
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

  const claimButtonDisabled = !eligibility || isClaiming || hasAlreadyClaimed;
  
  const getButtonState = () => {
      if(isClaiming) return { text: isConfirming ? "Confirming..." : "Claiming...", icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" /> };
      if(hasAlreadyClaimed) return { text: "Claimed", icon: <CheckCircle className="mr-2 h-4 w-4" /> };
      if (eligibility) return { text: "Claim Tokens", icon: <Gift className="mr-2 h-4 w-4" /> };
      return { text: "Not Eligible", icon: <ShieldQuestion className="mr-2 h-4 w-4" /> };
  }

  const buttonState = getButtonState();

  return (
    <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Airdrop Claim</CardTitle>
        <CardDescription className="text-center">
          {isConnected ? "Check your eligibility and claim your tokens." : "Connect your wallet to check eligibility."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {!isConnected ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Please connect your wallet to claim.</p>
          </div>
        ) : eligibility ? (
          <>
            <div className="w-full text-center bg-secondary/50 p-6 rounded-lg space-y-4">
              <div className="flex justify-center items-center gap-4">
                {tierIcons[eligibility.tier] || <Gift />}
                <div>
                    <p className="text-accent font-bold text-xl">{eligibility.tier} Tier</p>
                    <p className="text-sm text-muted-foreground">{eligibility.reason}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">You are eligible to claim:</p>
                <p className="font-headline text-4xl text-white">
                  {formatEther(BigInt(eligibility.amount))}
                </p>
                <p className="font-bold text-lg text-primary">NEON</p>
              </div>
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
        ) : (
            <div className="w-full text-center bg-destructive/20 p-6 rounded-lg space-y-2">
                <ShieldQuestion className="w-12 h-12 mx-auto text-destructive" />
                <p className="font-headline text-2xl text-white">Not Eligible</p>
                <p className="text-sm text-destructive-foreground/80">
                    This wallet address is not on the whitelist for this airdrop.
                </p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
