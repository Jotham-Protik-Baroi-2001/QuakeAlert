export interface UsgsEarthquakeFeature {
  type: 'Feature';
  properties: {
    mag: number | null;
    place: string | null;
    time: number | null;
    updated: number | null;
    tz: string | null;
    url: string;
    detail: string;
    felt: number | null;
    cdi: number | null;
    mmi: number | null;
    alert: 'green' | 'yellow' | 'orange' | 'red' | null;
    status: 'automatic' | 'reviewed';
    tsunami: 0 | 1;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
    nst: number | null;
    dmin: number | null;
    rms: number;
    gap: number | null;
    magType: string | null;
    type: 'earthquake' | string;
    title: string;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number, number];
  };
  id: string;
}

export interface UsgsEarthquakeResponse {
  type: 'FeatureCollection';
  metadata: {
    generated: number;
    url: string;
    title: string;
    status: number;
    api: string;
    count: number;
  };
  features: UsgsEarthquakeFeature[];
  bbox: [number, number, number, number, number, number];
}
