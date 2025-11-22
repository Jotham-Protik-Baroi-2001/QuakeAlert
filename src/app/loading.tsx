import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            {/* Sensor Status Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-2/5" />
                <Skeleton className="h-4 w-4/5" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            {/* Settings Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-2/5" />
                <Skeleton className="h-4 w-4/5" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-8 w-full" />
                </div>
                <Skeleton className="h-[1px] w-full" />
                <div className="space-y-4">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Location Enhancer Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-2/5" />
                <Skeleton className="h-4 w-4/5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            {/* Earthquake Feed Skeleton */}
            <Card>
              <CardHeader>
                 <Skeleton className="h-6 w-3/5" />
                 <Skeleton className="h-4 w-2/5" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
