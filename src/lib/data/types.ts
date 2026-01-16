// Patent type options
export type PatentType = 'utility' | 'design' | 'provisional';

// Filing strategy options
export type FilingStrategy = 'direct' | 'pct';

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

// Complete cost data for a country
export interface CountryCosts {
	countryCode: string;
	name: string;
	flag: string;
	region: string;
	officialFees: OfficialFees;
	attorneyFees: number;
	translationCostPerPage: number;
	maintenanceFeesYear1to5: number;
	requiresTranslation: boolean;
}

// User configuration overrides
export interface UserConfig {
	officialFeeOverrides: Record<string, Partial<OfficialFees>>;
	attorneyRateOverrides: Record<string, number>;
	translationRateOverrides: Record<string, number>;
}

// Calculator input state
export interface CalculationInput {
	countries: string[];
	patentType: PatentType;
	claims: number;
	pages: number;
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
	attorneyFees: number;
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
	totalAttorneyFees: number;
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
