import type { CalculationInput, UserConfig } from '$lib/data/types';

// Default calculation input
const DEFAULT_INPUT: CalculationInput = {
	countries: [],
	patentType: 'utility',
	claims: 20,
	pages: 30,
	filingStrategy: 'direct',
	priorityDate: null,
	technologyField: 'mechanical',
	translationNeeded: true
};

// Default user config (no overrides)
const DEFAULT_USER_CONFIG: UserConfig = {
	officialFeeOverrides: {},
	attorneyRateOverrides: {},
	translationRateOverrides: {}
};

// LocalStorage keys
const USER_CONFIG_KEY = 'patimate_user_config';

// Load user config from localStorage
function loadUserConfig(): UserConfig {
	if (typeof window === 'undefined') return DEFAULT_USER_CONFIG;
	try {
		const stored = localStorage.getItem(USER_CONFIG_KEY);
		if (stored) {
			return JSON.parse(stored);
		}
	} catch {
		// Ignore parse errors
	}
	return DEFAULT_USER_CONFIG;
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

	return {
		get input() {
			return input;
		},
		get userConfig() {
			return userConfig;
		},

		// Input setters
		setCountries(countries: string[]) {
			input.countries = countries;
		},
		addCountry(code: string) {
			if (!input.countries.includes(code)) {
				input.countries = [...input.countries, code];
			}
		},
		removeCountry(code: string) {
			input.countries = input.countries.filter((c) => c !== code);
		},
		setPatentType(type: CalculationInput['patentType']) {
			input.patentType = type;
		},
		setClaims(claims: number) {
			input.claims = Math.max(1, claims);
		},
		setPages(pages: number) {
			input.pages = Math.max(1, pages);
		},
		setFilingStrategy(strategy: CalculationInput['filingStrategy']) {
			input.filingStrategy = strategy;
		},
		setPriorityDate(date: string | null) {
			input.priorityDate = date;
		},
		setTechnologyField(field: CalculationInput['technologyField']) {
			input.technologyField = field;
		},
		setTranslationNeeded(needed: boolean) {
			input.translationNeeded = needed;
		},

		// User config setters (for settings modal)
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
		},
		setAttorneyRateOverride(countryCode: string, value: number | null) {
			if (value === null) {
				delete userConfig.attorneyRateOverrides[countryCode];
			} else {
				userConfig.attorneyRateOverrides[countryCode] = value;
			}
			saveUserConfig(userConfig);
		},
		setTranslationRateOverride(countryCode: string, value: number | null) {
			if (value === null) {
				delete userConfig.translationRateOverrides[countryCode];
			} else {
				userConfig.translationRateOverrides[countryCode] = value;
			}
			saveUserConfig(userConfig);
		},
		resetAllOverrides() {
			userConfig = { ...DEFAULT_USER_CONFIG };
			saveUserConfig(userConfig);
		},
		resetCountryOverrides(countryCode: string) {
			delete userConfig.officialFeeOverrides[countryCode];
			delete userConfig.attorneyRateOverrides[countryCode];
			delete userConfig.translationRateOverrides[countryCode];
			saveUserConfig(userConfig);
		}
	};
}

export const calculatorStore = createCalculatorStore();
