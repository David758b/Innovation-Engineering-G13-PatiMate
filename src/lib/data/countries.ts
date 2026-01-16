import type { CountryPreset } from './types';

// Available regions
export const REGIONS = [
	'North America',
	'Europe',
	'Asia-Pacific',
	'Latin America',
	'Middle East & Africa'
] as const;

export type Region = (typeof REGIONS)[number];

// Country data structure
export interface Country {
	code: string;
	name: string;
	flag: string;
	region: Region;
}

// All supported countries
export const COUNTRIES: Country[] = [
	// North America
	{ code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America' },
	{ code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America' },
	{ code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'North America' },

	// Europe
	{ code: 'EP', name: 'European Patent Office', flag: '🇪🇺', region: 'Europe' },
	{ code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
	{ code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
	{ code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe' },
	{ code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe' },
	{ code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe' },
	{ code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'Europe' },
	{ code: 'CH', name: 'Switzerland', flag: '🇨🇭', region: 'Europe' },
	{ code: 'SE', name: 'Sweden', flag: '🇸🇪', region: 'Europe' },
	{ code: 'PL', name: 'Poland', flag: '🇵🇱', region: 'Europe' },

	// Asia-Pacific
	{ code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia-Pacific' },
	{ code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia-Pacific' },
	{ code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia-Pacific' },
	{ code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia-Pacific' },
	{ code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Asia-Pacific' },
	{ code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia-Pacific' },
	{ code: 'TW', name: 'Taiwan', flag: '🇹🇼', region: 'Asia-Pacific' },
	{ code: 'HK', name: 'Hong Kong', flag: '🇭🇰', region: 'Asia-Pacific' },
	{ code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'Asia-Pacific' },

	// Latin America
	{ code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'Latin America' },
	{ code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'Latin America' },
	{ code: 'CL', name: 'Chile', flag: '🇨🇱', region: 'Latin America' },
	{ code: 'CO', name: 'Colombia', flag: '🇨🇴', region: 'Latin America' },

	// Middle East & Africa
	{ code: 'IL', name: 'Israel', flag: '🇮🇱', region: 'Middle East & Africa' },
	{ code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East & Africa' },
	{ code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East & Africa' },
	{ code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Middle East & Africa' }
];

// Country preset bundles
export const COUNTRY_PRESETS: CountryPreset[] = [
	{
		id: 'big-5',
		name: 'Big 5',
		countries: ['US', 'EP', 'CN', 'JP', 'KR']
	},
	{
		id: 'pct-major',
		name: 'PCT Major',
		countries: ['US', 'EP', 'CN', 'JP', 'KR', 'IN', 'AU', 'CA', 'BR']
	},
	{
		id: 'europe',
		name: 'Europe',
		countries: ['EP', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'CH', 'SE', 'PL']
	},
	{
		id: 'asia-pacific',
		name: 'Asia-Pacific',
		countries: ['CN', 'JP', 'KR', 'IN', 'AU', 'SG', 'TW', 'HK', 'NZ']
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
