import type { CountryCosts, GlobalSettings } from './types';

/**
 * Default global settings
 */
export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
	attorneyFee: 3000, // User's local/home attorney fee
	flatFee: 500, // Fixed service fee per filing
	maintenancePeriod: 5 // Default to 5 years
};

/**
 * Default cost data for all supported countries.
 * Values are approximate real-world estimates in USD.
 */
export const DEFAULT_COUNTRY_COSTS: Record<string, CountryCosts> = {
	// North America
	US: {
		countryCode: 'US',
		name: 'United States',
		flag: '🇺🇸',
		region: 'North America',
		officialFees: {
			filing: 1600,
			search: 700,
			examination: 800,
			grant: 1200
		},
		foreignAttorneyFee: 8000,
		translationCostPerPage: 0,
		maintenanceFeesAnnual: 320,
		requiresTranslation: false
	},
	CA: {
		countryCode: 'CA',
		name: 'Canada',
		flag: '🇨🇦',
		region: 'North America',
		officialFees: {
			filing: 400,
			search: 0,
			examination: 800,
			grant: 400
		},
		foreignAttorneyFee: 5000,
		translationCostPerPage: 0,
		maintenanceFeesAnnual: 160,
		requiresTranslation: false
	},

	// Europe
	EP: {
		countryCode: 'EP',
		name: 'European Patent Office',
		flag: '🇪🇺',
		region: 'Europe',
		officialFees: {
			filing: 1400,
			search: 1350,
			examination: 1800,
			grant: 1000
		},
		foreignAttorneyFee: 12000,
		translationCostPerPage: 0,
		maintenanceFeesAnnual: 600,
		requiresTranslation: false
	},
	DK: {
		countryCode: 'DK',
		name: 'Denmark',
		flag: '🇩🇰',
		region: 'Europe',
		officialFees: {
			filing: 500,
			search: 0,
			examination: 700,
			grant: 300
		},
		foreignAttorneyFee: 5000,
		translationCostPerPage: 45,
		maintenanceFeesAnnual: 200,
		requiresTranslation: true
	},

	// Asia-Pacific
	CN: {
		countryCode: 'CN',
		name: 'China',
		flag: '🇨🇳',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 150,
			search: 300,
			examination: 250,
			grant: 250
		},
		foreignAttorneyFee: 4000,
		translationCostPerPage: 50,
		maintenanceFeesAnnual: 100,
		requiresTranslation: true
	},
	JP: {
		countryCode: 'JP',
		name: 'Japan',
		flag: '🇯🇵',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 200,
			search: 0,
			examination: 600,
			grant: 300
		},
		foreignAttorneyFee: 7000,
		translationCostPerPage: 60,
		maintenanceFeesAnnual: 240,
		requiresTranslation: true
	},
	KR: {
		countryCode: 'KR',
		name: 'South Korea',
		flag: '🇰🇷',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 150,
			search: 0,
			examination: 400,
			grant: 200
		},
		foreignAttorneyFee: 5000,
		translationCostPerPage: 55,
		maintenanceFeesAnnual: 160,
		requiresTranslation: true
	},
	IN: {
		countryCode: 'IN',
		name: 'India',
		flag: '🇮🇳',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 80,
			search: 40,
			examination: 160,
			grant: 60
		},
		foreignAttorneyFee: 2500,
		translationCostPerPage: 0,
		maintenanceFeesAnnual: 60,
		requiresTranslation: false
	},
	AU: {
		countryCode: 'AU',
		name: 'Australia',
		flag: '🇦🇺',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 400,
			search: 0,
			examination: 400,
			grant: 300
		},
		foreignAttorneyFee: 5000,
		translationCostPerPage: 0,
		maintenanceFeesAnnual: 180,
		requiresTranslation: false
	},
	NZ: {
		countryCode: 'NZ',
		name: 'New Zealand',
		flag: '🇳🇿',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 200,
			search: 0,
			examination: 350,
			grant: 200
		},
		foreignAttorneyFee: 4000,
		translationCostPerPage: 0,
		maintenanceFeesAnnual: 120,
		requiresTranslation: false
	},

	// Latin America
	BR: {
		countryCode: 'BR',
		name: 'Brazil',
		flag: '🇧🇷',
		region: 'Latin America',
		officialFees: {
			filing: 100,
			search: 0,
			examination: 150,
			grant: 100
		},
		foreignAttorneyFee: 3500,
		translationCostPerPage: 35,
		maintenanceFeesAnnual: 100,
		requiresTranslation: true
	},

	// Africa
	ZA: {
		countryCode: 'ZA',
		name: 'South Africa',
		flag: '🇿🇦',
		region: 'Africa',
		officialFees: {
			filing: 100,
			search: 0,
			examination: 0,
			grant: 100
		},
		foreignAttorneyFee: 3000,
		translationCostPerPage: 0,
		maintenanceFeesAnnual: 80,
		requiresTranslation: false
	}
};

/**
 * Get default cost data for a specific country
 * @param countryCode - The country code (e.g., 'US', 'EP')
 * @returns The country cost data or undefined if not found
 */
export function getDefaultCosts(countryCode: string): CountryCosts | undefined {
	return DEFAULT_COUNTRY_COSTS[countryCode];
}
