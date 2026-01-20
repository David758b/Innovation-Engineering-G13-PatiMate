import type { CountryPreset } from './types';

// Available regions
export const REGIONS = [
	'North America',
	'Europe',
	'Asia-Pacific',
	'Latin America',
	'Africa'
] as const;

export type Region = (typeof REGIONS)[number];

// Country data structure
export interface Country {
	code: string;
	name: string;
	flag: string;
	region: Region;
}

// All supported countries (11 key patent jurisdictions)
export const COUNTRIES: Country[] = [
	// North America
	{ code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America' },
	{ code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America' },

	// Europe
	{ code: 'EP', name: 'European Patent Office', flag: '🇪🇺', region: 'Europe' },

	// Asia-Pacific
	{ code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia-Pacific' },
	{ code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia-Pacific' },
	{ code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia-Pacific' },
	{ code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia-Pacific' },
	{ code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Asia-Pacific' },
	{ code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'Asia-Pacific' },

	// Latin America
	{ code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'Latin America' },

	// Africa
	{ code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Africa' }
];

// Country preset bundles
export const COUNTRY_PRESETS: CountryPreset[] = [
	{
		id: 'big-5',
		name: 'Big 5',
		countries: ['US', 'EP', 'CN', 'JP', 'KR']
	},
	{
		id: 'all-countries',
		name: 'All Countries',
		countries: ['US', 'CA', 'EP', 'CN', 'JP', 'KR', 'IN', 'AU', 'NZ', 'BR', 'ZA']
	},
	{
		id: 'asia-pacific',
		name: 'Asia-Pacific',
		countries: ['CN', 'JP', 'KR', 'IN', 'AU', 'NZ']
	},
	{
		id: 'americas',
		name: 'Americas',
		countries: ['US', 'CA', 'BR']
	}
];

/**
 * Get a country by its code
 * @param code - The country code (e.g., 'US', 'EP')
 * @returns The country object or undefined if not found
 */
export function getCountryByCode(code: string): Country | undefined {
	return COUNTRIES.find((country) => country.code === code);
}

/**
 * Get all countries in a specific region
 * @param region - The region name
 * @returns Array of countries in that region
 */
export function getCountriesByRegion(region: Region): Country[] {
	return COUNTRIES.filter((country) => country.region === region);
}
