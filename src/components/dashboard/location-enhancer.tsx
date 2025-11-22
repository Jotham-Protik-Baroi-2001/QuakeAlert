"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getLocationEnrichedEarthquakeData, LocationEnrichedEarthquakeDataOutput } from '@/ai/flows/location-enriched-earthquake-data';
import { MapPin, Loader2, Sparkles, Building, Globe } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countries } from '@/lib/countries';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { TimeAgo } from "@/components/shared/time-ago";

interface LocationEnhancerProps {
  earthquakeDataJSON: string;
}

type AnalysisMode = "geolocation" | "country";

const getMagnitudeVariant = (mag: number | null): "destructive" | "secondary" | "default" => {
    const magnitude = mag || 0;
    if (magnitude >= 4.5) return "destructive";
    if (magnitude >= 2.5) return "secondary";
    return "default";
};

export default function LocationEnhancer({ earthquakeDataJSON }: LocationEnhancerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<LocationEnrichedEarthquakeDataOutput | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("geolocation");
  const { toast } = useToast();

  const handleEnhance = async () => {
    setIsLoading(true);
    setAiResponse(null);

    let latitude: number;
    let longitude: number;

    if (analysisMode === "country") {
      if (!selectedCountry) {
        toast({
          variant: "destructive",
          title: "Country not selected",
          description: "Please select a country for analysis.",
        });
        setIsLoading(false);
        return;
      }
      const countryData = countries.find(c => c.name === selectedCountry);
      if (!countryData) {
        toast({
          variant: "destructive",
          title: "Invalid Country",
          description: "Could not find coordinates for the selected country.",
        });
        setIsLoading(false);
        return;
      }
      latitude = countryData.latitude;
      longitude = countryData.longitude;
      processRequest(latitude, longitude);
    } else { // geolocation
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
        (position) => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          processRequest(latitude, longitude);
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
    }
  };

  const processRequest = async (latitude: number, longitude: number) => {
     try {
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
  }

  const sortedFeatures = aiResponse?.features?.sort((a, b) => (a.proximity_to_user_km || Infinity) - (b.proximity_to_user_km || Infinity));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI-Powered Analysis
        </CardTitle>
        <CardDescription>Use your location or select a country for a personalized seismic summary.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        <RadioGroup value={analysisMode} onValueChange={(value) => setAnalysisMode(value as AnalysisMode)} className='grid grid-cols-2 gap-4'>
            <div>
                <RadioGroupItem value="geolocation" id="geolocation" className="peer sr-only" />
                <Label htmlFor="geolocation" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    <MapPin className="mb-3 h-6 w-6" />
                    My Location
                </Label>
            </div>

            <div>
                <RadioGroupItem value="country" id="country" className="peer sr-only" />
                <Label htmlFor="country" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    <Globe className="mb-3 h-6 w-6" />
                    By Country
                </Label>
            </div>
        </RadioGroup>

        {analysisMode === 'country' && (
          <div className="space-y-2">
            <Label htmlFor="country-select">Country</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger id="country-select">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country.name} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={handleEnhance} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Analyze Proximity to Earthquakes
        </Button>

        {isLoading && !aiResponse && (
            <div className="flex items-center justify-center text-muted-foreground min-h-[120px]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Getting location and analyzing data...</span>
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
                        <TimeAgo time={feature.time} />
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
