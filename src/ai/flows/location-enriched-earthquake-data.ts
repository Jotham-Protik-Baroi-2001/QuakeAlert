'use server';
/**
 * @fileOverview Enhances earthquake data with location information.
 *
 * - getLocationEnrichedEarthquakeData - A function that enriches earthquake data with location information.
 * - LocationEnrichedEarthquakeDataInput - The input type for the getLocationEnrichedEarthquakeData function.
 * - LocationEnrichedEarthquakeDataOutput - The return type for the getLocationEnrichedEarthquakeData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { UsgsEarthquakeFeature } from '@/lib/types';

const LocationEnrichedEarthquakeDataInputSchema = z.object({
  latitude: z.number().describe('The latitude of the user.'),
  longitude: z.number().describe('The longitude of the user.'),
  earthquakeData: z.string().describe('The raw earthquake data as a JSON string.'),
});
export type LocationEnrichedEarthquakeDataInput = z.infer<
  typeof LocationEnrichedEarthquakeDataInputSchema
>;

const EnrichedEarthquakeFeatureSchema = z.object({
  id: z.string(),
  mag: z.number().nullable(),
  place: z.string().nullable(),
  time: z.number().nullable(),
  proximity_to_user_km: z.number().optional().describe("The distance in kilometers from the user's location to the earthquake epicenter."),
  title: z.string(),
});

const LocationEnrichedEarthquakeDataOutputSchema = z.object({
  summary: z.string().describe("A brief, one or two sentence summary of the seismic activity relative to the user."),
  features: z.array(EnrichedEarthquakeFeatureSchema).describe("An array of enriched earthquake features. Each feature must include a proximity to the user if it can be calculated."),
});

export type LocationEnrichedEarthquakeDataOutput = z.infer<
  typeof LocationEnrichedEarthquakeDataOutputSchema
>;

export async function getLocationEnrichedEarthquakeData(
  input: LocationEnrichedEarthquakeDataInput
): Promise<LocationEnrichedEarthquakeDataOutput> {
  return locationEnrichedEarthquakeDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'locationEnrichedEarthquakeDataPrompt',
  input: {schema: LocationEnrichedEarthquakeDataInputSchema},
  output: {schema: LocationEnrichedEarthquakeDataOutputSchema},
  prompt: `You are an expert at providing location-based earthquake information. Your response must be in JSON format.

  The user's current location is latitude: {{latitude}}, longitude: {{longitude}}.
  Here is the raw earthquake data from USGS: {{earthquakeData}}

  Analyze the raw data and for each earthquake feature, calculate the distance from the user's location to the earthquake's coordinates. Add this distance as a 'proximity_to_user_km' field in your output.

  Provide a brief, one or two sentence 'summary' of the seismic activity relative to the user. For example: "There have been 4 earthquakes in the last hour, the nearest of which was approximately 7350 km away in Alaska."

  Return a JSON object containing this summary and the array of enriched 'features'. Do not make up information.
  `,
});

const locationEnrichedEarthquakeDataFlow = ai.defineFlow(
  {
    name: 'locationEnrichedEarthquakeDataFlow',
    inputSchema: LocationEnrichedEarthquakeDataInputSchema,
    outputSchema: LocationEnrichedEarthquakeDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
