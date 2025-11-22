"use client";

import type { UsgsEarthquakeResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rss, Globe } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { TimeAgo } from "@/components/shared/time-ago";

interface EarthquakeFeedProps {
  initialData: UsgsEarthquakeResponse;
}

const getMagnitudeVariant = (mag: number | null): "destructive" | "secondary" | "default" => {
    const magnitude = mag || 0;
    if (magnitude >= 4.5) return "destructive";
    if (magnitude >= 2.5) return "secondary";
    return "default";
};

export default function EarthquakeFeed({ initialData }: EarthquakeFeedProps) {
  const sortedFeatures = [...initialData.features].sort((a, b) => (b.properties.time || 0) - (a.properties.time || 0));

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <Rss className="h-6 w-6" />
              Real-time Earthquake Feed
            </CardTitle>
            <CardDescription>
              Live data from the selected USGS feed.
            </CardDescription>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
            <Globe className="h-4 w-4" />
            <span>{initialData.metadata.count} events</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-6 pt-0">
            {sortedFeatures.length > 0 ? (
              sortedFeatures.map((feature) => (
                <a 
                  key={feature.id} 
                  href={feature.properties.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50"
                >
                  <div 
                    className={cn(
                        "flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-full font-bold text-base",
                        getMagnitudeVariant(feature.properties.mag) === 'destructive' && 'bg-destructive text-destructive-foreground',
                        getMagnitudeVariant(feature.properties.mag) === 'secondary' && 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
                        getMagnitudeVariant(feature.properties.mag) === 'default' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    <span>{(feature.properties.mag || 0).toFixed(1)}</span>
                    <span className="text-xs font-medium opacity-80">M</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-medium leading-tight truncate">{feature.properties.place || "Unknown location"}</p>
                    <p className="text-sm text-muted-foreground">
                      <TimeAgo time={feature.properties.time} />
                    </p>
                  </div>
                </a>
              ))
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px]">
                <p className="text-center text-muted-foreground">No recent earthquakes in this feed.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
