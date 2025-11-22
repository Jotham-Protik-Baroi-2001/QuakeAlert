'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import SensorStatus from '@/components/dashboard/sensor-status';
import EarthquakeFeed from '@/components/dashboard/earthquake-feed';
import Settings from '@/components/dashboard/settings';
import type { UsgsEarthquakeResponse } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { countries } from '@/lib/countries';

export const earthquakeFeedSources = [
  {
    name: 'Past Hour (All)',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
    id: 'all_hour',
  },
  {
    name: 'Past Day (All)',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
    id: 'all_day',
  },
  {
    name: 'Past 7 Days (M2.5+)',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson',
    id: '2.5_week',
  },
  {
    name: 'Past 30 Days (M4.5+)',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson',
    id: '4.5_month',
  },
  {
    name: 'Significant (Past 30 Days)',
    url: 'https://earthquake.usg.gov/earthquakes/feed/v1.0/summary/significant_month.geojson',
    id: 'significant_month',
  },
];


export default function Home() {
  const [earthquakeData, setEarthquakeData] = useState<UsgsEarthquakeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFeedUrl, setCurrentFeedUrl] = useState(earthquakeFeedSources[0].url);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);

  const fetchEarthquakeData = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from USGS: ${response.statusText}`);
      }
      let data: UsgsEarthquakeResponse = await response.json();
      
      if (selectedCountry) {
        const country = countries.find(c => c.name === selectedCountry);
        if (country) {
          data.features = data.features.filter(feature => {
            const place = feature.properties.place?.toLowerCase() || "";
            return place.includes(selectedCountry.toLowerCase());
          });
        }
      }

      setEarthquakeData(data);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarthquakeData(currentFeedUrl);
  }, [currentFeedUrl, selectedCountry]);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Fetching Data</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-1 flex flex-col gap-6">
              <SensorStatus />
              <Settings 
                  currentFeedUrl={currentFeedUrl}
                  onFeedSourceChange={setCurrentFeedUrl}
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
              />
            </div>
            <div className="md:col-span-1 lg:col-span-2 flex flex-col gap-6">
              {isLoading ? (
                 <Card className="flex-1 h-full">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/5" />
                    <Skeleton className="h-4 w-2/5" />
                  </CardHeader>
                  <CardContent className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                        <span className="mt-2 block">Loading feed...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : earthquakeData && (
                <EarthquakeFeed initialData={earthquakeData} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}