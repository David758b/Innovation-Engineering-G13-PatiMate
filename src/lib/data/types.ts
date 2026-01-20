// Patent type options
export type PatentType = 'utility' | 'design' | 'provisional';

// Filing strategy options (null means no strategy selected yet)
export type FilingStrategy = 'direct' | 'pct' | string | null;

// Technology field options
export type TechnologyField =
	| 'mechanical'
	| 'electrical'
	| 'software'
	| 'biotech'
	| 'chemical'
	| 'pharma'
	| 'other';

// Official fees breakdown for a country
export interface OfficialFees {
	filing: number;
	search: number;
	examination: number;
	grant: number;
}

// Maintenance period options
export type MaintenancePeriod = 5 | 10 | 20;

// Complete cost data for a country (per-country defaults)
export interface CountryCosts {
	countryCode: string;
	name: string;
	flag: string;
	region: string;
	officialFees: OfficialFees;
	foreignAttorneyFee: number; // In-country attorney fee
	translationCostPerPage: number;
	maintenanceFeesAnnual: number; // Annual maintenance fee
	requiresTranslation: boolean;
}

// Global settings (apply to all countries)
export interface GlobalSettings {
	attorneyFee: number; // User's local/home attorney fee
	flatFee: number; // Fixed service fee per filing
	maintenancePeriod: MaintenancePeriod; // Years to calculate maintenance
}

// User configuration overrides
export interface UserConfig {
	// Global settings
	globalSettings: GlobalSettings;
	// Per-country overrides
	officialFeeOverrides: Record<string, Partial<OfficialFees>>;
	foreignAttorneyOverrides: Record<string, number>;
	translationRateOverrides: Record<string, number>;
	maintenanceOverrides: Record<string, number>; // Annual maintenance override
}

// Calculator input state
export interface CalculationInput {
	countries: string[];
	patentType: PatentType;
	claims: number;
	pages: number;
	wordCount: number;
	filingStrategy: FilingStrategy;
	priorityDate: string | null;
	technologyField: TechnologyField;
	translationNeeded: boolean;
}

// Cost breakdown result for a single country
export interface CountryCostResult {
	countryCode: string;
	name: string;
	flag: string;
	officialFees: number;
	foreignAttorneyFee: number; // In-country attorney
	attorneyFee: number; // User's local attorney (global)
	flatFee: number; // Fixed service fee (global)
	translationCosts: number;
	maintenanceFees: number;
	total: number;
	breakdown: {
		filing: number;
		search: number;
		examination: number;
		grant: number;
	};
}

// Complete calculation result
export interface CalculationResult {
	totalCost: number;
	totalOfficialFees: number;
	totalForeignAttorneyFees: number;
	totalAttorneyFees: number;
	totalFlatFees: number;
	totalTranslationCosts: number;
	totalMaintenanceFees: number;
	countryResults: CountryCostResult[];
}

// Country preset bundles
export interface CountryPreset {
	id: string;
	name: string;
	countries: string[];
}
