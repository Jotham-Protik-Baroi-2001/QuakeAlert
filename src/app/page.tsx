import { Header } from '@/components/layout/header';
import SensorStatus from '@/components/dashboard/sensor-status';
import EarthquakeFeed from '@/components/dashboard/earthquake-feed';
import LocationEnhancer from '@/components/dashboard/location-enhancer';
import Settings from '@/components/dashboard/settings';
import type { UsgsEarthquakeResponse } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

async function getEarthquakeData(): Promise<UsgsEarthquakeResponse | null> {
  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
      {
        next: { revalidate: 60 }, // Revalidate every minute
      }
    );
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

export default async function Home() {
  const earthquakeData = await getEarthquakeData();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        {earthquakeData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <SensorStatus />
              <Settings />
            </div>
            <div className="flex flex-col gap-6">
               <LocationEnhancer earthquakeDataJSON={JSON.stringify(earthquakeData)} />
               <EarthquakeFeed initialData={earthquakeData} />
            </div>
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Could not load earthquake data from the USGS service. Please try again later.
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}
