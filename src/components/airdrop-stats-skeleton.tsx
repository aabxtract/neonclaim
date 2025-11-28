import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AirdropStatsSkeleton() {
  return (
    <Card className="w-full max-w-md bg-card/50 backdrop-blur-lg border-primary/20 shadow-lg shadow-primary/10">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Live Airdrop Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <Skeleton className="h-5 w-20 mx-auto mb-1" />
            <Skeleton className="h-8 w-28 mx-auto" />
          </div>
          <div>
            <Skeleton className="h-5 w-24 mx-auto mb-1" />
            <Skeleton className="h-8 w-16 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
