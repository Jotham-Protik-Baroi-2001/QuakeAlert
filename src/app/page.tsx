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

async function getEarthquakeData(
  url: string
): Promise<UsgsEarthquakeResponse | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every minute
    });
    if (!res.ok) {
      console.error('Failed to fetch earthquake data: ', res.statusText);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('Failed to fetch earthquake data:', error);
    return null;
  }
}

export default function Home() {
  const [earthquakeData, setEarthquakeData] =
    useState<UsgsEarthquakeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedSourceUrl, setFeedSourceUrl] = useState(earthquakeFeedSources[0].url);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const data = await getEarthquakeData(feedSourceUrl);
      if (data) {
        setEarthquakeData(data);
      } else {
        setError(
          'Could not load earthquake data from the selected source. Please try again later.'
        );
      }
      setIsLoading(false);
    };

    fetchData();
  }, [feedSourceUrl]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (earthquakeData) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <SensorStatus />
            <Settings
              currentFeedUrl={feedSourceUrl}
              onFeedSourceChange={setFeedSourceUrl}
            />
          </div>
          <div className="flex flex-col gap-6">
            <LocationEnhancer
              earthquakeDataJSON={JSON.stringify(earthquakeData)}
            />
            <EarthquakeFeed initialData={earthquakeData} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}
