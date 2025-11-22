"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getLocationEnrichedEarthquakeData, LocationEnrichedEarthquakeDataOutput } from '@/ai/flows/location-enriched-earthquake-data';
import { MapPin, Loader2, Sparkles, Building } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface LocationEnhancerProps {
  earthquakeDataJSON: string;
}

const getMagnitudeVariant = (mag: number | null): "destructive" | "secondary" | "default" => {
    const magnitude = mag || 0;
    if (magnitude >= 4.5) return "destructive";
    if (magnitude >= 2.5) return "secondary";
    return "default";
};

export default function LocationEnhancer({ earthquakeDataJSON }: LocationEnhancerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<LocationEnrichedEarthquakeDataOutput | null>(null);
  const { toast } = useToast();

  const handleEnhance = async () => {
    setIsLoading(true);
    setAiResponse(null);

    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
      });
      setIsLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await getLocationEnrichedEarthquakeData({
            latitude,
            longitude,
            earthquakeData: earthquakeDataJSON,
          });

          if (result && result.features) {
            setAiResponse(result);
          } else {
             toast({
              variant: "destructive",
              title: "AI Analysis Failed",
              description: "Could not get an enriched response from the AI.",
            });
          }
        } catch (error) {
          console.error("AI enrichment error:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "An error occurred during AI analysis.",
          });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        toast({
          variant: "destructive",
          title: "Location Error",
          description: error.message || "Could not get your location. Please enable location services.",
        });
        setIsLoading(false);
      }
    );
  };

  const sortedFeatures = aiResponse?.features?.sort((a, b) => (a.proximity_to_user_km || Infinity) - (b.proximity_to_user_km || Infinity));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI-Powered Analysis
        </CardTitle>
        <CardDescription>Use your location for a personalized seismic activity summary.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleEnhance} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="mr-2 h-4 w-4" />
          )}
          Analyze Proximity to Earthquakes
        </Button>
        {isLoading && !aiResponse && (
            <div className="flex items-center justify-center text-muted-foreground min-h-[120px]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Getting your location and analyzing data...</span>
            </div>
        )}
        {aiResponse && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <p className="text-sm font-medium">{aiResponse.summary}</p>
            <ScrollArea className="h-48">
              <div className="space-y-4 pr-4">
                {sortedFeatures?.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex-grow min-w-0">
                      <p className="font-medium leading-tight truncate">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {feature.time ? formatDistanceToNow(new Date(feature.time), { addSuffix: true }) : "Unknown time"}
                      </p>
                       {feature.proximity_to_user_km != null && (
                         <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Building className="h-3 w-3" />
                            {Math.round(feature.proximity_to_user_km).toLocaleString()} km away
                         </p>
                        )}
                    </div>
                     <div 
                        className={cn(
                            "flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-full font-bold",
                            getMagnitudeVariant(feature.mag) === 'destructive' && 'bg-destructive text-destructive-foreground',
                            getMagnitudeVariant(feature.mag) === 'secondary' && 'bg-secondary text-secondary-foreground',
                            getMagnitudeVariant(feature.mag) === 'default' && 'bg-muted text-muted-foreground'
                        )}
                      >
                        <span>{(feature.mag || 0).toFixed(1)}</span>
                        <span className="text-xs font-medium">M</span>
                      </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
