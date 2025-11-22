"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getLocationEnrichedEarthquakeData } from '@/ai/flows/location-enriched-earthquake-data';
import { MapPin, Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LocationEnhancerProps {
  earthquakeDataJSON: string;
}

export default function LocationEnhancer({ earthquakeDataJSON }: LocationEnhancerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const { toast } = useToast();

  const handleEnhance = async () => {
    setIsLoading(true);
    setAiResponse('');

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

          if (result.enrichedEarthquakeData) {
            setAiResponse(result.enrichedEarthquakeData);
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
        {(isLoading || aiResponse) && (
          <div className="p-4 bg-muted/50 rounded-lg min-h-[120px]">
            {isLoading && !aiResponse && (
              <div className="flex items-center justify-center text-muted-foreground h-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Getting your location and analyzing data...</span>
              </div>
            )}
            {aiResponse && (
              <ScrollArea className="h-48">
                 <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
              </ScrollArea>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
