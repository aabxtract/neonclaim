"use client";

import { useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract, useReadContract } from "wagmi";
import { formatEther, type BaseError } from "viem";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Gift, ExternalLink, ShieldQuestion, Diamond, Sparkles, UserCheck, Lock, Unlock, Hourglass, Twitter } from "lucide-react";
import { airdropContract } from "@/lib/contracts";
import whitelist from "@/lib/whitelist.json";
import { Progress } from "@/components/ui/progress";

type VestingInfo = {
  startTime: string; // ISO 8601 date string
  cliffDuration: number; // in seconds
  totalDuration: number; // in seconds
};

type WhitelistEntry = {
  address: string;
  amount: string;
  tier: string;
  reason: string;
  vesting: VestingInfo | null;
};

const tierIcons: { [key: string]: React.ReactNode } = {
  "Diamond Hands": <Diamond className="w-10 h-10 text-blue-400" />,
  "Active Trader": <Sparkles className="w-10 h-10 text-purple-400" />,
  "Early Adopter": <UserCheck className="w-10 h-10 text-green-400" />,
};

function Countdown({ targetDate, onComplete }: { targetDate: number; onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const interval = setInterval(() => {
      const newTimeLeft = targetDate - Date.now();
      if (newTimeLeft <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        onComplete();
      } else {
        setTimeLeft(newTimeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onComplete, timeLeft]);
  
  if (timeLeft <= 0) {
      return <span>Ready to claim!</span>;
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return <span>{`${days}d ${hours}h ${minutes}m ${seconds}s`}</span>;
}


export function ClaimCard() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  const { data: hash, error, isPending, writeContract } = useWriteContract();

  const [eligibility, setEligibility] = useState<WhitelistEntry | null>(null);
  const [vestingState, setVestingState] = useState<{
    claimableAmount: bigint;
    vestedAmount: bigint;
    lockedAmount: bigint;
    vestingProgress: number;
    cliffEndsAt: number | null;
    isAfterCliff: boolean;
  } | null>(null);
  const [countdownKey, setCountdownKey] = useState(0);

  // Fetch whether the user has already claimed from the contract
  const { data: hasClaimedData, refetch: refetchClaimedStatus } = useReadContract({
    address: airdropContract.address,
    abi: airdropContract.abi,
    functionName: 'claimed',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  const isClaimed = hasClaimedData === true;

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

  useEffect(() => {
    if (!eligibility) {
      setVestingState(null);
      return;
    }

    if (!eligibility.vesting) {
        // No vesting, all tokens are claimable
        setVestingState({
            claimableAmount: BigInt(eligibility.amount),
            vestedAmount: BigInt(eligibility.amount),
            lockedAmount: 0n,
            vestingProgress: 100,
            cliffEndsAt: null,
            isAfterCliff: true,
        });
        return;
    }

    const calculateVesting = () => {
        const { startTime, cliffDuration, totalDuration } = eligibility.vesting!;
        const totalAllocation = BigInt(eligibility.amount);
        const now = Date.now();
        const startTimeMs = new Date(startTime).getTime();
        const cliffEndsAt = startTimeMs + cliffDuration * 1000;
        const vestingEndsAt = startTimeMs + totalDuration * 1000;
        const isAfterCliff = now >= cliffEndsAt;

        let vestedAmount = 0n;
        if (now > startTimeMs) {
            if (now >= vestingEndsAt) {
                vestedAmount = totalAllocation;
            } else {
                const elapsedTime = now - startTimeMs;
                vestedAmount = (totalAllocation * BigInt(elapsedTime)) / BigInt(totalDuration * 1000);
            }
        }
        
        const claimableAmount = isAfterCliff ? vestedAmount : 0n;
        const lockedAmount = totalAllocation - vestedAmount;
        const vestingProgress = totalDuration > 0 ? Math.min(((now - startTimeMs) / (totalDuration * 1000)) * 100, 100) : 100;
        
        setVestingState({
            claimableAmount,
            vestedAmount,
            lockedAmount,
            vestingProgress,
            cliffEndsAt: cliffEndsAt,
            isAfterCliff
        });
    }

    calculateVesting();
    const interval = setInterval(calculateVesting, 1000);
    return () => clearInterval(interval);

  }, [eligibility]);
  
  const handleClaim = async () => {
    if (!eligibility || !vestingState) return;
    const amountToClaim = isClaimed ? (vestingState.vestedAmount - BigInt(eligibility.amount)) : vestingState.claimableAmount;
    
    // For this demo, we assume the contract allows partial claims.
    // The `claim` function on the mock contract takes the full amount.
    // For a real vesting contract, you'd likely call a "release" or "claimVested" function.
    // We are simplifying here by claiming the *total eligible amount* as per the original contract.
    writeContract({
      address: airdropContract.address,
      abi: airdropContract.abi,
      functionName: 'claim',
      args: [[], BigInt(eligibility.amount)], 
    });
  };

  const handleShare = () => {
    const claimAmount = vestingState?.claimableAmount || 0n;
    const text = `I just claimed my $NEON airdrop on #NeonClaim!\n\nI was eligible for the ${eligibility?.tier} tier and claimed ${formatEther(claimAmount)} tokens. Check if you're eligible too!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${window.location.href}`;
    window.open(url, '_blank');
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      refetchClaimedStatus();
      toast({
        title: "Claim Successful!",
        description: "Your tokens have been processed.",
      });
    }
    if (error) {
      toast({
        variant: "destructive",
        title: "Claim Failed",
        description: (error as BaseError)?.shortMessage || "An unknown error occurred.",
      });
    }
  }, [isConfirmed, error, toast, refetchClaimedStatus]);

  const isClaiming = isPending || isConfirming;
  // A real vesting contract would allow multiple claims. For this demo, we simplify to one claim.
  const hasAlreadyClaimed = isClaimed; 
  const claimButtonDisabled = !eligibility || isClaiming || hasAlreadyClaimed || (vestingState?.claimableAmount || 0n) === 0n;
  
  const getButtonState = () => {
      if(isClaiming) return { text: isConfirming ? "Confirming..." : "Claiming...", icon: <Loader2 className="mr-2 h-4 w-4 animate-spin" /> };
      if(hasAlreadyClaimed) return { text: "Claimed", icon: <CheckCircle className="mr-2 h-4 w-4" /> };
      if (eligibility && vestingState && vestingState.claimableAmount > 0n) return { text: `Claim ${formatEther(vestingState.claimableAmount)} NEON`, icon: <Gift className="mr-2 h-4 w-4" /> };
      if (eligibility && vestingState && !vestingState.isAfterCliff) return { text: "Tokens Locked", icon: <Lock className="mr-2 h-4 w-4" /> };
      if (eligibility) return { text: "No Tokens to Claim", icon: <Hourglass className="mr-2 h-4 w-4" /> };
      return { text: "Not Eligible", icon: <ShieldQuestion className="mr-2 h-4 w-4" /> };
  }

  const buttonState = getButtonState();

  const renderVestingInfo = () => {
    if (!eligibility || !vestingState) return null;

    const totalAllocation = BigInt(eligibility.amount);

    return (
      <div className="w-full space-y-4">
        <div className="text-center">
            <p className="text-muted-foreground">Total Allocation:</p>
            <p className="font-headline text-4xl text-white">
              {formatEther(totalAllocation)}
            </p>
            <p className="font-bold text-lg text-primary">NEON</p>
        </div>

        {eligibility.vesting && (
          <div className="space-y-3">
             <div className="text-center">
                <p className="text-sm text-accent">Vesting Schedule Active</p>
                <Progress value={vestingState.vestingProgress} className="w-full h-2 mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Unlock /> Claimable</p>
                    <p className="text-xl font-bold">{formatEther(vestingState.claimableAmount)}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Lock /> Locked</p>
                    <p className="text-xl font-bold">{formatEther(vestingState.lockedAmount)}</p>
                </div>
            </div>

            {!vestingState.isAfterCliff && vestingState.cliffEndsAt && (
                <div className="text-center bg-secondary/30 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Tokens unlock in:</p>
                    <div className="text-lg font-mono text-accent">
                      <Countdown 
                        key={countdownKey}
                        targetDate={vestingState.cliffEndsAt} 
                        onComplete={() => setCountdownKey(prev => prev + 1)} 
                      />
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    );
  }

  const renderActionButtons = () => {
    if (isConfirmed || hasAlreadyClaimed) {
      return (
        <div className="w-full space-y-4">
          <Button
            onClick={handleShare}
            size="lg"
            className="w-full font-bold text-lg bg-[#1DA1F2] hover:bg-[#1A91DA] text-white"
          >
            <Twitter className="mr-2 h-4 w-4" />
            Share on X
          </Button>
          {hash && (
            <a
              href={`https://etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline flex items-center justify-center"
            >
              View on Etherscan <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          )}
        </div>
      );
    }

    return (
      <div className="w-full space-y-4">
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
            className="text-sm text-accent hover:underline flex items-center justify-center"
          >
            View on Etherscan <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        )}
      </div>
    );
  };

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
              <div className="flex justify-center items-center gap-4 mb-4">
                {tierIcons[eligibility.tier] || <Gift />}
                <div>
                    <p className="text-accent font-bold text-xl">{eligibility.tier} Tier</p>
                    <p className="text-sm text-muted-foreground">{eligibility.reason}</p>
                </div>
              </div>
              {renderVestingInfo()}
            </div>
            {renderActionButtons()}
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
