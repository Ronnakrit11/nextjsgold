import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AssetSkeleton() {
  return (
    <div className="space-y-6">
      {/* Account Value Card Skeleton */}
      <Card className="md:col-span-3">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Balance Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <Skeleton className="h-8 w-36 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          </CardContent>
        </Card>

        {/* Asset Distribution Card Skeleton */}
        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Holdings Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <div className="flex justify-between">
                  <div>
                    <Skeleton className="h-4 w-36 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}