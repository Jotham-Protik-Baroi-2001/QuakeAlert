'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import SensorStatus from '@/components/dashboard/sensor-status';
import EarthquakeFeed from '@/components/dashboard/earthquake-feed';
import LocationEnhancer from '@/components/dashboard/location-enhancer';
import Settings from '@/components/dashboard/settings';
import type { UsgsEarthquakeResponse } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Country, countries } from '@/lib/countries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

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
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson',
    id: 'significant_month',
  },
];

export default function Home() {
  const [earthquakeData, setEarthquakeData] = useState<UsgsEarthquakeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFeedUrl, setCurrentFeedUrl] = useState(earthquakeFeedSources[0].url);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(countries.find(c => c.name === 'United States'));

  const fetchEarthquakeData = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from USGS: ${response.statusText}`);
      }
      const data: UsgsEarthquakeResponse = await response.json();
      setEarthquakeData(data);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarthquakeData(currentFeedUrl);
  }, [currentFeedUrl]);
  
  const handleCountryChange = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    setSelectedCountry(country);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Fetching Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SensorStatus />
            <Settings 
                currentFeedUrl={currentFeedUrl}
                onFeedSourceChange={setCurrentFeedUrl}
                selectedCountry={selectedCountry}
                onCountryChange={handleCountryChange}
            />
          </div>
          <div className="flex flex-col gap-6">
            {isLoading ? (
               <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-3/5" />
                  <Skeleton className="h-4 w-2/5" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[120px] text-muted-foreground">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <span>Loading feed...</span>
                  </div>
                </CardContent>
              </Card>
            ) : earthquakeData && (
              <>
                <LocationEnhancer earthquakeDataJSON={JSON.stringify(earthquakeData)} selectedCountry={selectedCountry} />
                <EarthquakeFeed initialData={earthquakeData} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
