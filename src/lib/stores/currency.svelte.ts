// Currency store for exchange rate management and display formatting
// Uses ECB rates via frankfurter.app API (free, no API key, CORS-friendly)

export interface CurrencyInfo {
	code: string;
	name: string;
	symbol: string;
	countryCode: string; // ISO country code for flag display
}

// Supported currencies (curated list)
export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
	{ code: 'DKK', name: 'Danish Krone', symbol: 'kr', countryCode: 'DK' },
	{ code: 'EUR', name: 'Euro', symbol: '€', countryCode: 'EU' },
	{ code: 'USD', name: 'US Dollar', symbol: '$', countryCode: 'US' },
	{ code: 'GBP', name: 'British Pound', symbol: '£', countryCode: 'GB' },
	{ code: 'SEK', name: 'Swedish Krona', symbol: 'kr', countryCode: 'SE' },
	{ code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', countryCode: 'NO' },
	{ code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', countryCode: 'CH' },
	{ code: 'JPY', name: 'Japanese Yen', symbol: '¥', countryCode: 'JP' },
	{ code: 'CNY', name: 'Chinese Yuan', symbol: '¥', countryCode: 'CN' }
];

// Cache configuration
const CACHE_KEY = 'patimate_exchange_rates';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SELECTED_CURRENCY_KEY = 'patimate_selected_currency';

interface CachedRates {
	rates: Record<string, number>;
	timestamp: number;
	base: string;
}

// Load cached rates from localStorage
function loadCachedRates(): CachedRates | null {
	if (typeof window === 'undefined') return null;
	try {
		const cached = localStorage.getItem(CACHE_KEY);
		if (cached) {
			const parsed: CachedRates = JSON.parse(cached);
			const age = Date.now() - parsed.timestamp;
			if (age < CACHE_TTL_MS) {
				return parsed;
			}
		}
	} catch {
		// Ignore parse errors
	}
	return null;
}

// Save rates to localStorage
function saveCachedRates(rates: Record<string, number>, base: string): void {
	if (typeof window === 'undefined') return;
	try {
		const cached: CachedRates = {
			rates,
			timestamp: Date.now(),
			base
		};
		localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
	} catch {
		// Ignore storage errors
	}
}

// Load selected currency from localStorage
function loadSelectedCurrency(): string {
	if (typeof window === 'undefined') return 'DKK';
	try {
		const stored = localStorage.getItem(SELECTED_CURRENCY_KEY);
		if (stored && SUPPORTED_CURRENCIES.some((c) => c.code === stored)) {
			return stored;
		}
	} catch {
		// Ignore errors
	}
	return 'DKK';
}

// Save selected currency to localStorage
function saveSelectedCurrency(code: string): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(SELECTED_CURRENCY_KEY, code);
	} catch {
		// Ignore storage errors
	}
}

// Fetch exchange rates from ECB via frankfurter.app
async function fetchExchangeRates(): Promise<Record<string, number>> {
	const currencies = SUPPORTED_CURRENCIES.map((c) => c.code).join(',');
	const response = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${currencies}`);

	if (!response.ok) {
		throw new Error(`Failed to fetch exchange rates: ${response.status}`);
	}

	const data = await response.json();
	// Add EUR = 1 since it's the base
	return { EUR: 1, ...data.rates };
}

// Create the currency store
function createCurrencyStore() {
	let selectedCurrency = $state<string>(loadSelectedCurrency());
	let exchangeRates = $state<Record<string, number>>({});
	let isLoading = $state<boolean>(false);
	let error = $state<string | null>(null);
	let lastUpdated = $state<Date | null>(null);

	// Initialize from cache
	const cached = loadCachedRates();
	if (cached) {
		exchangeRates = cached.rates;
		lastUpdated = new Date(cached.timestamp);
	}

	return {
		get selectedCurrency() {
			return selectedCurrency;
		},
		get selectedCurrencyInfo(): CurrencyInfo {
			return SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency) ?? SUPPORTED_CURRENCIES[0];
		},
		get exchangeRates() {
			return exchangeRates;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		get lastUpdated() {
			return lastUpdated;
		},
		get hasRates() {
			return Object.keys(exchangeRates).length > 0;
		},

		// Set selected currency
		setSelectedCurrency(code: string) {
			if (SUPPORTED_CURRENCIES.some((c) => c.code === code)) {
				selectedCurrency = code;
				saveSelectedCurrency(code);
			}
		},

		// Fetch fresh exchange rates
		async fetchRates() {
			// Check cache first
			const cached = loadCachedRates();
			if (cached) {
				exchangeRates = cached.rates;
				lastUpdated = new Date(cached.timestamp);
				return;
			}

			isLoading = true;
			error = null;

			try {
				const rates = await fetchExchangeRates();
				exchangeRates = rates;
				lastUpdated = new Date();
				saveCachedRates(rates, 'EUR');
			} catch (e) {
				error = e instanceof Error ? e.message : 'Failed to fetch exchange rates';
				// Use fallback rates if fetch fails
				if (Object.keys(exchangeRates).length === 0) {
					exchangeRates = getFallbackRates();
				}
			} finally {
				isLoading = false;
			}
		},

		// Convert amount from EUR to selected currency
		convert(amountInEur: number): number {
			const rate = exchangeRates[selectedCurrency] ?? 1;
			return amountInEur * rate;
		},

		// Format amount in selected currency
		format(amountInEur: number): string {
			const converted = this.convert(amountInEur);
			return formatCurrencyAmount(converted, selectedCurrency);
		},

		// Get current exchange rate for selected currency
		getCurrentRate(): number {
			return exchangeRates[selectedCurrency] ?? 1;
		}
	};
}

// Format a currency amount with proper locale formatting
export function formatCurrencyAmount(amount: number, currencyCode: string): string {
	// Use appropriate locale for each currency
	const localeMap: Record<string, string> = {
		DKK: 'da-DK',
		EUR: 'de-DE',
		USD: 'en-US',
		GBP: 'en-GB',
		SEK: 'sv-SE',
		NOK: 'nb-NO',
		CHF: 'de-CH',
		JPY: 'ja-JP',
		CNY: 'zh-CN'
	};

	const locale = localeMap[currencyCode] ?? 'en-US';

	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currencyCode,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
}

// Fallback rates (approximate, used if API fails)
function getFallbackRates(): Record<string, number> {
	return {
		EUR: 1,
		DKK: 7.46,
		USD: 1.08,
		GBP: 0.86,
		SEK: 11.5,
		NOK: 11.7,
		CHF: 0.94,
		JPY: 162,
		CNY: 7.8
	};
}

export const currencyStore = createCurrencyStore();
