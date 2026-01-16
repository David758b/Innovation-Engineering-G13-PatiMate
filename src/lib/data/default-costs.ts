import type { CountryCosts } from './types';

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
		attorneyFees: 8000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 1600,
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
		attorneyFees: 5000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 800,
		requiresTranslation: false
	},
	MX: {
		countryCode: 'MX',
		name: 'Mexico',
		flag: '🇲🇽',
		region: 'North America',
		officialFees: {
			filing: 300,
			search: 0,
			examination: 400,
			grant: 300
		},
		attorneyFees: 3500,
		translationCostPerPage: 35,
		maintenanceFeesYear1to5: 600,
		requiresTranslation: true
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
		attorneyFees: 12000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 3000,
		requiresTranslation: false
	},
	GB: {
		countryCode: 'GB',
		name: 'United Kingdom',
		flag: '🇬🇧',
		region: 'Europe',
		officialFees: {
			filing: 250,
			search: 200,
			examination: 150,
			grant: 100
		},
		attorneyFees: 4000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 700,
		requiresTranslation: false
	},
	DE: {
		countryCode: 'DE',
		name: 'Germany',
		flag: '🇩🇪',
		region: 'Europe',
		officialFees: {
			filing: 60,
			search: 300,
			examination: 350,
			grant: 200
		},
		attorneyFees: 5500,
		translationCostPerPage: 45,
		maintenanceFeesYear1to5: 900,
		requiresTranslation: true
	},
	FR: {
		countryCode: 'FR',
		name: 'France',
		flag: '🇫🇷',
		region: 'Europe',
		officialFees: {
			filing: 40,
			search: 500,
			examination: 0,
			grant: 100
		},
		attorneyFees: 5000,
		translationCostPerPage: 45,
		maintenanceFeesYear1to5: 700,
		requiresTranslation: true
	},
	IT: {
		countryCode: 'IT',
		name: 'Italy',
		flag: '🇮🇹',
		region: 'Europe',
		officialFees: {
			filing: 50,
			search: 0,
			examination: 0,
			grant: 200
		},
		attorneyFees: 4000,
		translationCostPerPage: 40,
		maintenanceFeesYear1to5: 600,
		requiresTranslation: true
	},
	ES: {
		countryCode: 'ES',
		name: 'Spain',
		flag: '🇪🇸',
		region: 'Europe',
		officialFees: {
			filing: 120,
			search: 0,
			examination: 400,
			grant: 150
		},
		attorneyFees: 4000,
		translationCostPerPage: 35,
		maintenanceFeesYear1to5: 500,
		requiresTranslation: true
	},
	NL: {
		countryCode: 'NL',
		name: 'Netherlands',
		flag: '🇳🇱',
		region: 'Europe',
		officialFees: {
			filing: 80,
			search: 0,
			examination: 0,
			grant: 100
		},
		attorneyFees: 4500,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 600,
		requiresTranslation: false
	},
	CH: {
		countryCode: 'CH',
		name: 'Switzerland',
		flag: '🇨🇭',
		region: 'Europe',
		officialFees: {
			filing: 200,
			search: 0,
			examination: 0,
			grant: 200
		},
		attorneyFees: 5000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 800,
		requiresTranslation: false
	},
	SE: {
		countryCode: 'SE',
		name: 'Sweden',
		flag: '🇸🇪',
		region: 'Europe',
		officialFees: {
			filing: 100,
			search: 0,
			examination: 200,
			grant: 100
		},
		attorneyFees: 4000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 600,
		requiresTranslation: false
	},
	PL: {
		countryCode: 'PL',
		name: 'Poland',
		flag: '🇵🇱',
		region: 'Europe',
		officialFees: {
			filing: 100,
			search: 0,
			examination: 150,
			grant: 100
		},
		attorneyFees: 3000,
		translationCostPerPage: 30,
		maintenanceFeesYear1to5: 400,
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
		attorneyFees: 4000,
		translationCostPerPage: 50,
		maintenanceFeesYear1to5: 500,
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
		attorneyFees: 7000,
		translationCostPerPage: 60,
		maintenanceFeesYear1to5: 1200,
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
		attorneyFees: 5000,
		translationCostPerPage: 55,
		maintenanceFeesYear1to5: 800,
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
		attorneyFees: 2500,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 300,
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
		attorneyFees: 5000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 900,
		requiresTranslation: false
	},
	SG: {
		countryCode: 'SG',
		name: 'Singapore',
		flag: '🇸🇬',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 160,
			search: 0,
			examination: 500,
			grant: 150
		},
		attorneyFees: 4500,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 600,
		requiresTranslation: false
	},
	TW: {
		countryCode: 'TW',
		name: 'Taiwan',
		flag: '🇹🇼',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 100,
			search: 0,
			examination: 200,
			grant: 100
		},
		attorneyFees: 3500,
		translationCostPerPage: 45,
		maintenanceFeesYear1to5: 400,
		requiresTranslation: true
	},
	HK: {
		countryCode: 'HK',
		name: 'Hong Kong',
		flag: '🇭🇰',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 200,
			search: 0,
			examination: 0,
			grant: 200
		},
		attorneyFees: 4000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 500,
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
		attorneyFees: 4000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 600,
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
		attorneyFees: 3500,
		translationCostPerPage: 35,
		maintenanceFeesYear1to5: 500,
		requiresTranslation: true
	},
	AR: {
		countryCode: 'AR',
		name: 'Argentina',
		flag: '🇦🇷',
		region: 'Latin America',
		officialFees: {
			filing: 150,
			search: 0,
			examination: 200,
			grant: 150
		},
		attorneyFees: 3000,
		translationCostPerPage: 35,
		maintenanceFeesYear1to5: 400,
		requiresTranslation: true
	},
	CL: {
		countryCode: 'CL',
		name: 'Chile',
		flag: '🇨🇱',
		region: 'Latin America',
		officialFees: {
			filing: 200,
			search: 0,
			examination: 250,
			grant: 150
		},
		attorneyFees: 3000,
		translationCostPerPage: 35,
		maintenanceFeesYear1to5: 450,
		requiresTranslation: true
	},
	CO: {
		countryCode: 'CO',
		name: 'Colombia',
		flag: '🇨🇴',
		region: 'Latin America',
		officialFees: {
			filing: 150,
			search: 0,
			examination: 200,
			grant: 100
		},
		attorneyFees: 2800,
		translationCostPerPage: 35,
		maintenanceFeesYear1to5: 400,
		requiresTranslation: true
	},

	// Middle East & Africa
	IL: {
		countryCode: 'IL',
		name: 'Israel',
		flag: '🇮🇱',
		region: 'Middle East & Africa',
		officialFees: {
			filing: 250,
			search: 0,
			examination: 500,
			grant: 250
		},
		attorneyFees: 5000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 700,
		requiresTranslation: false
	},
	AE: {
		countryCode: 'AE',
		name: 'United Arab Emirates',
		flag: '🇦🇪',
		region: 'Middle East & Africa',
		officialFees: {
			filing: 400,
			search: 0,
			examination: 500,
			grant: 300
		},
		attorneyFees: 4500,
		translationCostPerPage: 50,
		maintenanceFeesYear1to5: 600,
		requiresTranslation: true
	},
	SA: {
		countryCode: 'SA',
		name: 'Saudi Arabia',
		flag: '🇸🇦',
		region: 'Middle East & Africa',
		officialFees: {
			filing: 350,
			search: 0,
			examination: 450,
			grant: 250
		},
		attorneyFees: 4500,
		translationCostPerPage: 50,
		maintenanceFeesYear1to5: 550,
		requiresTranslation: true
	},
	ZA: {
		countryCode: 'ZA',
		name: 'South Africa',
		flag: '🇿🇦',
		region: 'Middle East & Africa',
		officialFees: {
			filing: 100,
			search: 0,
			examination: 0,
			grant: 100
		},
		attorneyFees: 3000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 400,
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
