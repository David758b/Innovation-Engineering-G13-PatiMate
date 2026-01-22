import { COUNTRIES } from '$lib/data/countries';
import { DEFAULT_COUNTRY_COSTS, DEFAULT_GLOBAL_SETTINGS } from '$lib/data/default-costs';
import type { CalculationInput, MaintenancePeriod, UserConfig } from '$lib/data/types';
import { strategyStudioStore, getCountryCodeFromBlock, isNationalEntryBlock, DISPLAY_ONLY_COUNTRIES } from '$lib/stores/strategy-studio.svelte';

// Filing step result (from strategy blocks)
export interface FilingStepResult {
	id: string;
	label: string;
	category: string;
	cost: number;
}

// Calculation result for a single country (national phase entry)
export interface CountryResult {
	code: string;
	name: string;
	flag: string;
	officialFees: number;
	foreignAttorneyFee: number;
	attorneyFee: number;
	flatFee: number;
	translationCosts: number;
	maintenanceFees: number;
	total: number;
}

// Summary of all calculations
export interface CalculationSummary {
	totalCost: number;
	// Filing steps (from strategy blocks)
	filingStepsTotal: number;
	filingStepResults: FilingStepResult[];
	// National phase (from country settings)
	nationalPhaseTotal: number;
	totalOfficialFees: number;
	totalForeignAttorneyFees: number;
	totalAttorneyFees: number;
	totalFlatFees: number;
	totalTranslationCosts: number;
	totalMaintenanceFees: number;
	countryCount: number;
	maintenancePeriod: number;
	countryResults: CountryResult[];
}

// Default calculation input
const DEFAULT_INPUT: CalculationInput = {
	countries: [],
	patentType: 'utility',
	claims: 20,
	pages: 30,
	wordCount: 7500, // Average patent ~250 words per page
	filingStrategy: null, // No strategy selected by default
	priorityDate: null,
	technologyField: 'mechanical',
	translationNeeded: true
};

// Default user config (no overrides, default global settings)
const DEFAULT_USER_CONFIG: UserConfig = {
	globalSettings: { ...DEFAULT_GLOBAL_SETTINGS },
	officialFeeOverrides: {},
	foreignAttorneyOverrides: {},
	translationRateOverrides: {},
	maintenanceOverrides: {}
};

// LocalStorage keys
const USER_CONFIG_KEY = 'patimate_user_config';

// Load user config from localStorage
function loadUserConfig(): UserConfig {
	if (typeof window === 'undefined') return { ...DEFAULT_USER_CONFIG };
	try {
		const stored = localStorage.getItem(USER_CONFIG_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			// Merge with defaults to handle new fields
			return {
				...DEFAULT_USER_CONFIG,
				...parsed,
				globalSettings: {
					...DEFAULT_GLOBAL_SETTINGS,
					...(parsed.globalSettings || {})
				}
			};
		}
	} catch {
		// Ignore parse errors
	}
	return { ...DEFAULT_USER_CONFIG };
}

// Save user config to localStorage
function saveUserConfig(config: UserConfig): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(USER_CONFIG_KEY, JSON.stringify(config));
	} catch {
		// Ignore storage errors
	}
}

// Create the calculator store
function createCalculatorStore() {
	let input = $state<CalculationInput>({ ...DEFAULT_INPUT });
	let userConfig = $state<UserConfig>(loadUserConfig());
	let calculationResult = $state<CalculationSummary | null>(null);

	return {
		get input() {
			return input;
		},
		get userConfig() {
			return userConfig;
		},
		get calculationResult() {
			return calculationResult;
		},

		// Calculate costs based on strategy blocks and config
		calculate() {
			const globalSettings = userConfig.globalSettings;

			// === FILING STEPS (from strategy blocks) ===
			const filingStepBlocks = strategyStudioStore.getFilingStepBlocks();
			const filingStepResults: FilingStepResult[] = [];
			let filingStepsTotal = 0;

			for (const block of filingStepBlocks) {
				const cost = typeof block.data.cost === 'number' ? block.data.cost : 0;
				filingStepResults.push({
					id: block.id,
					label: block.label,
					category: block.category,
					cost
				});
				filingStepsTotal += cost;
			}

			// === NATIONAL PHASE ENTRIES (from country settings) ===
			const entryBlocks = strategyStudioStore.getNationalEntryBlocks();
			const countryResults: CountryResult[] = [];

			let totalOfficialFees = 0;
			let totalForeignAttorneyFees = 0;
			let totalAttorneyFees = 0;
			let totalFlatFees = 0;
			let totalTranslationCosts = 0;
			let totalMaintenanceFees = 0;

			// Get country codes from entry blocks
			const blockCountryCodes = entryBlocks
				.map(getCountryCodeFromBlock)
				.filter((code): code is string => code !== null);

			// Always include display-only countries in the breakdown (proof of concept)
			const displayOnlySelected = DISPLAY_ONLY_COUNTRIES;

			// Combine both lists (blocks + display-only)
			const allCountryCodes = [...blockCountryCodes, ...displayOnlySelected];

			for (const countryCode of allCountryCodes) {
				if (!countryCode) continue;

				const country = COUNTRIES.find((c) => c.code === countryCode);
				if (!country) continue;

				const defaults = DEFAULT_COUNTRY_COSTS[countryCode];
				if (!defaults) continue;

				const overrides = {
					official: userConfig.officialFeeOverrides[countryCode] || {},
					foreignAttorney: userConfig.foreignAttorneyOverrides[countryCode],
					translation: userConfig.translationRateOverrides[countryCode],
					maintenance: userConfig.maintenanceOverrides[countryCode]
				};

				// Official fees (sum of filing, search, examination, grant)
				const officialFees = {
					filing: overrides.official.filing ?? defaults.officialFees.filing,
					search: overrides.official.search ?? defaults.officialFees.search,
					examination: overrides.official.examination ?? defaults.officialFees.examination,
					grant: overrides.official.grant ?? defaults.officialFees.grant
				};
				const officialTotal =
					officialFees.filing +
					officialFees.search +
					officialFees.examination +
					officialFees.grant;

				// Foreign attorney fee (per-country)
				const foreignAttorneyFee = overrides.foreignAttorney ?? defaults.foreignAttorneyFee;

				// Local attorney fee (global)
				const attorneyFee = globalSettings.attorneyFee;

				// Flat fee (global)
				const flatFee = globalSettings.flatFee;

				// Translation costs (based on word count for more accuracy)
				const translationRatePerPage = overrides.translation ?? defaults.translationCostPerPage;
				const translationRatePerWord = translationRatePerPage / 250;
				const translationCosts = defaults.requiresTranslation
					? Math.round(translationRatePerWord * input.wordCount)
					: 0;

				// Maintenance fees (annual × period)
				const maintenanceAnnual = overrides.maintenance ?? defaults.maintenanceFeesAnnual;
				const maintenanceFees = maintenanceAnnual * globalSettings.maintenancePeriod;

				// Total for this country
				const total =
					officialTotal +
					foreignAttorneyFee +
					attorneyFee +
					flatFee +
					translationCosts +
					maintenanceFees;

				countryResults.push({
					code: countryCode,
					name: country.name,
					flag: country.flag,
					officialFees: officialTotal,
					foreignAttorneyFee,
					attorneyFee,
					flatFee,
					translationCosts,
					maintenanceFees,
					total
				});

				// Accumulate totals
				totalOfficialFees += officialTotal;
				totalForeignAttorneyFees += foreignAttorneyFee;
				totalAttorneyFees += attorneyFee;
				totalFlatFees += flatFee;
				totalTranslationCosts += translationCosts;
				totalMaintenanceFees += maintenanceFees;
			}

			const nationalPhaseTotal =
				totalOfficialFees +
				totalForeignAttorneyFees +
				totalAttorneyFees +
				totalFlatFees +
				totalTranslationCosts +
				totalMaintenanceFees;

			calculationResult = {
				totalCost: filingStepsTotal + nationalPhaseTotal,
				filingStepsTotal,
				filingStepResults,
				nationalPhaseTotal,
				totalOfficialFees,
				totalForeignAttorneyFees,
				totalAttorneyFees,
				totalFlatFees,
				totalTranslationCosts,
				totalMaintenanceFees,
				countryCount: countryResults.length,
				maintenancePeriod: globalSettings.maintenancePeriod,
				countryResults
			};
		},

		// Clear calculation result
		clearCalculation() {
			calculationResult = null;
		},

		// Input setters
		setCountries(countries: string[]) {
			input.countries = countries;
			calculationResult = null; // Clear when input changes
		},
		addCountry(code: string) {
			if (!input.countries.includes(code)) {
				input.countries = [...input.countries, code];
				calculationResult = null;
			}
		},
		removeCountry(code: string) {
			input.countries = input.countries.filter((c) => c !== code);
			calculationResult = null;
		},
		setPatentType(type: CalculationInput['patentType']) {
			input.patentType = type;
			calculationResult = null;
		},
		setClaims(claims: number) {
			input.claims = Math.max(1, claims);
			calculationResult = null;
		},
		setPages(pages: number) {
			input.pages = Math.max(1, pages);
			calculationResult = null;
		},
		setWordCount(wordCount: number) {
			input.wordCount = Math.max(1, wordCount);
			calculationResult = null;
		},
		setFilingStrategy(strategy: CalculationInput['filingStrategy']) {
			input.filingStrategy = strategy;
			calculationResult = null;
		},
		setPriorityDate(date: string | null) {
			input.priorityDate = date;
			calculationResult = null;
		},
		setTechnologyField(field: CalculationInput['technologyField']) {
			input.technologyField = field;
			calculationResult = null;
		},
		setTranslationNeeded(needed: boolean) {
			input.translationNeeded = needed;
			calculationResult = null;
		},

		// Global settings setters
		setGlobalAttorneyFee(value: number) {
			userConfig.globalSettings.attorneyFee = Math.max(0, value);
			saveUserConfig(userConfig);
			calculationResult = null;
		},
		setGlobalFlatFee(value: number) {
			userConfig.globalSettings.flatFee = Math.max(0, value);
			saveUserConfig(userConfig);
			calculationResult = null;
		},
		setMaintenancePeriod(period: MaintenancePeriod) {
			userConfig.globalSettings.maintenancePeriod = period;
			saveUserConfig(userConfig);
			calculationResult = null;
		},

		// Per-country override setters
		setOfficialFeeOverride(
			countryCode: string,
			field: 'filing' | 'search' | 'examination' | 'grant',
			value: number | null
		) {
			if (value === null) {
				if (userConfig.officialFeeOverrides[countryCode]) {
					delete userConfig.officialFeeOverrides[countryCode][field];
					if (Object.keys(userConfig.officialFeeOverrides[countryCode]).length === 0) {
						delete userConfig.officialFeeOverrides[countryCode];
					}
				}
			} else {
				if (!userConfig.officialFeeOverrides[countryCode]) {
					userConfig.officialFeeOverrides[countryCode] = {};
				}
				userConfig.officialFeeOverrides[countryCode][field] = value;
			}
			saveUserConfig(userConfig);
			calculationResult = null;
		},
		setForeignAttorneyOverride(countryCode: string, value: number | null) {
			if (value === null) {
				delete userConfig.foreignAttorneyOverrides[countryCode];
			} else {
				userConfig.foreignAttorneyOverrides[countryCode] = value;
			}
			saveUserConfig(userConfig);
			calculationResult = null;
		},
		setTranslationRateOverride(countryCode: string, value: number | null) {
			if (value === null) {
				delete userConfig.translationRateOverrides[countryCode];
			} else {
				userConfig.translationRateOverrides[countryCode] = value;
			}
			saveUserConfig(userConfig);
			calculationResult = null;
		},
		setMaintenanceOverride(countryCode: string, value: number | null) {
			if (value === null) {
				delete userConfig.maintenanceOverrides[countryCode];
			} else {
				userConfig.maintenanceOverrides[countryCode] = value;
			}
			saveUserConfig(userConfig);
			calculationResult = null;
		},

		// Reset functions
		resetGlobalSettings() {
			userConfig.globalSettings = { ...DEFAULT_GLOBAL_SETTINGS };
			saveUserConfig(userConfig);
			calculationResult = null;
		},
		resetAllOverrides() {
			userConfig = { ...DEFAULT_USER_CONFIG };
			saveUserConfig(userConfig);
			calculationResult = null;
		},
		resetCountryOverrides(countryCode: string) {
			delete userConfig.officialFeeOverrides[countryCode];
			delete userConfig.foreignAttorneyOverrides[countryCode];
			delete userConfig.translationRateOverrides[countryCode];
			delete userConfig.maintenanceOverrides[countryCode];
			saveUserConfig(userConfig);
			calculationResult = null;
		}
	};
}

export const calculatorStore = createCalculatorStore();
