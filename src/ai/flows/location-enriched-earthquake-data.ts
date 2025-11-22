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

const LocationEnrichedEarthquakeDataInputSchema = z.object({
  latitude: z.number().describe('The latitude of the user.'),
  longitude: z.number().describe('The longitude of the user.'),
  earthquakeData: z.string().describe('The raw earthquake data.'),
});
export type LocationEnrichedEarthquakeDataInput = z.infer<
  typeof LocationEnrichedEarthquakeDataInputSchema
>;

const LocationEnrichedEarthquakeDataOutputSchema = z.object({
  enrichedEarthquakeData: z
    .string()
    .describe('The earthquake data enriched with location information.'),
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
  prompt: `You are an expert at providing location-based earthquake information.

  The user's current location is latitude: {{latitude}}, longitude: {{longitude}}.
  Here is the raw earthquake data: {{earthquakeData}}

  Enrich the earthquake data with the user's location to provide more relevant and accurate information.
  Return the enriched earthquake data.
  Make sure to include proximity to the user's location.
  Do not make up information.
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
