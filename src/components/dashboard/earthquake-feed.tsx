"use client";

import { useState, useEffect } from "react";
import type { UsgsEarthquakeResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Rss, Globe, Building } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface EarthquakeFeedProps {
  initialData: UsgsEarthquakeResponse;
}

const getMagnitudeVariant = (mag: number | null): "destructive" | "secondary" | "default" => {
    const magnitude = mag || 0;
    if (magnitude >= 4.5) return "destructive";
    if (magnitude >= 2.5) return "secondary";
    return "default";
};

// Client-side component to prevent hydration mismatch
const TimeAgo = ({ time }: { time: number | null }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !time) {
    return <span>Unknown time</span>;
  }

  return <span>{formatDistanceToNow(new Date(time), { addSuffix: true })}</span>;
};


export default function EarthquakeFeed({ initialData }: EarthquakeFeedProps) {
  const sortedFeatures = [...initialData.features].sort((a, b) => (b.properties.time || 0) - (a.properties.time || 0));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <Rss className="h-6 w-6" />
              Real-time Earthquake Feed
            </CardTitle>
            <CardDescription>
              Live data from USGS for the past hour.
            </CardDescription>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>{initialData.metadata.count} events</span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px]">
          <div className="space-y-6 pr-4">
            {sortedFeatures.length > 0 ? (
              sortedFeatures.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between gap-4">
                  <div 
                    className={cn(
                        "flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-full font-bold text-lg",
                        getMagnitudeVariant(feature.properties.mag) === 'destructive' && 'bg-destructive text-destructive-foreground',
                        getMagnitudeVariant(feature.properties.mag) === 'secondary' && 'bg-secondary text-secondary-foreground',
                        getMagnitudeVariant(feature.properties.mag) === 'default' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    <span>{(feature.properties.mag || 0).toFixed(1)}</span>
                    <span className="text-xs font-medium">M</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-medium leading-tight truncate">{feature.properties.place || "Unknown location"}</p>
                    <p className="text-sm text-muted-foreground">
                      <TimeAgo time={feature.properties.time} />
                    </p>
                    {/* @ts-ignore */}
                    {feature.properties.proximity_to_user_km != null && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Building className="h-3 w-3" />
                        {/* @ts-ignore */}
                        {Math.round(feature.properties.proximity_to_user_km).toLocaleString()} km away
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full pt-16">
                <p className="text-center text-muted-foreground">No recent earthquakes in the past hour.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
