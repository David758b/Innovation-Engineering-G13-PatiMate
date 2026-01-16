# Patent Filing Cost Calculator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive patent filing cost estimation calculator with dashboard-style layout, detailed inputs, itemized cost breakdowns, and user-configurable rates.

**Architecture:** Dashboard split layout (35% input panel, 65% results panel). Input panel has collapsible sections for country selection, patent details, and filing strategy. Results panel shows live-updating summary card and itemized country breakdown table. Settings modal allows users to override default cost data. All state managed with Svelte 5 runes ($state, $derived). Cost data stored in localStorage for persistence.

**Tech Stack:** SvelteKit 2, Svelte 5, Tailwind CSS 4, shadcn-svelte components, TypeScript

---

## Task 1: Install Required shadcn-svelte Components

**Files:**

- Modify: `src/lib/components/ui/` (new component directories)

**Step 1: Install input component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && npx shadcn-svelte@latest add input
```

Expected: Creates `src/lib/components/ui/input/`

**Step 2: Install select component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && npx shadcn-svelte@latest add select
```

Expected: Creates `src/lib/components/ui/select/`

**Step 3: Install radio-group component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && npx shadcn-svelte@latest add radio-group
```

Expected: Creates `src/lib/components/ui/radio-group/`

**Step 4: Install checkbox component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && npx shadcn-svelte@latest add checkbox
```

Expected: Creates `src/lib/components/ui/checkbox/`

**Step 5: Install dialog component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && npx shadcn-svelte@latest add dialog
```

Expected: Creates `src/lib/components/ui/dialog/`

**Step 6: Install tabs component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && npx shadcn-svelte@latest add tabs
```

Expected: Creates `src/lib/components/ui/tabs/`

**Step 7: Install card component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && npx shadcn-svelte@latest add card
```

Expected: Creates `src/lib/components/ui/card/`

**Step 8: Install table component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && npx shadcn-svelte@latest add table
```

Expected: Creates `src/lib/components/ui/table/`

**Step 9: Install badge component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && npx shadcn-svelte@latest add badge
```

Expected: Creates `src/lib/components/ui/badge/`

**Step 10: Install label component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && npx shadcn-svelte@latest add label
```

Expected: Creates `src/lib/components/ui/label/`

**Step 11: Install collapsible component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && npx shadcn-svelte@latest add collapsible
```

Expected: Creates `src/lib/components/ui/collapsible/`

**Step 12: Install switch component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && npx shadcn-svelte@latest add switch
```

Expected: Creates `src/lib/components/ui/switch/`

**Step 13: Verify TypeScript compiles**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: No errors

**Step 14: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: install shadcn-svelte components for calculator"
```

---

## Task 2: Create Data Types and Default Cost Data

**Files:**

- Create: `src/lib/data/types.ts`
- Create: `src/lib/data/default-costs.ts`
- Create: `src/lib/data/countries.ts`

**Step 1: Create TypeScript type definitions**

Create `src/lib/data/types.ts`:

```typescript
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
```

**Step 2: Create countries data with regions**

Create `src/lib/data/countries.ts`:

```typescript
export interface CountryInfo {
	code: string;
	name: string;
	flag: string;
	region: string;
}

export const REGIONS = [
	'North America',
	'Europe',
	'Asia-Pacific',
	'Latin America',
	'Middle East & Africa'
] as const;

export type Region = (typeof REGIONS)[number];

export const COUNTRIES: CountryInfo[] = [
	// North America
	{ code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America' },
	{ code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America' },
	{ code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'North America' },

	// Europe
	{ code: 'EP', name: 'European Patent (EPO)', flag: '🇪🇺', region: 'Europe' },
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

export const COUNTRY_PRESETS = [
	{
		id: 'big5',
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
		countries: ['EP', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'CH']
	},
	{
		id: 'asia-pacific',
		name: 'Asia-Pacific',
		countries: ['CN', 'JP', 'KR', 'IN', 'AU', 'SG', 'TW']
	}
];

export function getCountryByCode(code: string): CountryInfo | undefined {
	return COUNTRIES.find((c) => c.code === code);
}

export function getCountriesByRegion(region: Region): CountryInfo[] {
	return COUNTRIES.filter((c) => c.region === region);
}
```

**Step 3: Create default cost data**

Create `src/lib/data/default-costs.ts`:

```typescript
import type { CountryCosts } from './types';

// Default cost data for major patent offices
// These are approximate values for utility patents - actual costs vary
export const DEFAULT_COUNTRY_COSTS: Record<string, CountryCosts> = {
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
		maintenanceFeesYear1to5: 4500,
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
			grant: 300
		},
		attorneyFees: 5000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 2000,
		requiresTranslation: false
	},
	MX: {
		countryCode: 'MX',
		name: 'Mexico',
		flag: '🇲🇽',
		region: 'North America',
		officialFees: {
			filing: 200,
			search: 0,
			examination: 300,
			grant: 200
		},
		attorneyFees: 3500,
		translationCostPerPage: 25,
		maintenanceFeesYear1to5: 1500,
		requiresTranslation: true
	},
	EP: {
		countryCode: 'EP',
		name: 'European Patent (EPO)',
		flag: '🇪🇺',
		region: 'Europe',
		officialFees: {
			filing: 1400,
			search: 1500,
			examination: 1950,
			grant: 1000
		},
		attorneyFees: 12000,
		translationCostPerPage: 45,
		maintenanceFeesYear1to5: 8200,
		requiresTranslation: true
	},
	GB: {
		countryCode: 'GB',
		name: 'United Kingdom',
		flag: '🇬🇧',
		region: 'Europe',
		officialFees: {
			filing: 50,
			search: 180,
			examination: 120,
			grant: 100
		},
		attorneyFees: 6000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 1500,
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
		attorneyFees: 7000,
		translationCostPerPage: 40,
		maintenanceFeesYear1to5: 2500,
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
		attorneyFees: 5500,
		translationCostPerPage: 38,
		maintenanceFeesYear1to5: 1800,
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
			grant: 100
		},
		attorneyFees: 4500,
		translationCostPerPage: 35,
		maintenanceFeesYear1to5: 1200,
		requiresTranslation: true
	},
	ES: {
		countryCode: 'ES',
		name: 'Spain',
		flag: '🇪🇸',
		region: 'Europe',
		officialFees: {
			filing: 100,
			search: 0,
			examination: 400,
			grant: 100
		},
		attorneyFees: 4000,
		translationCostPerPage: 30,
		maintenanceFeesYear1to5: 1000,
		requiresTranslation: true
	},
	NL: {
		countryCode: 'NL',
		name: 'Netherlands',
		flag: '🇳🇱',
		region: 'Europe',
		officialFees: {
			filing: 80,
			search: 100,
			examination: 0,
			grant: 50
		},
		attorneyFees: 5000,
		translationCostPerPage: 42,
		maintenanceFeesYear1to5: 1400,
		requiresTranslation: true
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
		attorneyFees: 6500,
		translationCostPerPage: 45,
		maintenanceFeesYear1to5: 2000,
		requiresTranslation: true
	},
	SE: {
		countryCode: 'SE',
		name: 'Sweden',
		flag: '🇸🇪',
		region: 'Europe',
		officialFees: {
			filing: 150,
			search: 0,
			examination: 200,
			grant: 100
		},
		attorneyFees: 5500,
		translationCostPerPage: 40,
		maintenanceFeesYear1to5: 1600,
		requiresTranslation: true
	},
	PL: {
		countryCode: 'PL',
		name: 'Poland',
		flag: '🇵🇱',
		region: 'Europe',
		officialFees: {
			filing: 120,
			search: 0,
			examination: 150,
			grant: 80
		},
		attorneyFees: 3000,
		translationCostPerPage: 28,
		maintenanceFeesYear1to5: 800,
		requiresTranslation: true
	},
	CN: {
		countryCode: 'CN',
		name: 'China',
		flag: '🇨🇳',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 150,
			search: 300,
			examination: 400,
			grant: 250
		},
		attorneyFees: 6000,
		translationCostPerPage: 35,
		maintenanceFeesYear1to5: 2400,
		requiresTranslation: true
	},
	JP: {
		countryCode: 'JP',
		name: 'Japan',
		flag: '🇯🇵',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 150,
			search: 1500,
			examination: 200,
			grant: 300
		},
		attorneyFees: 9000,
		translationCostPerPage: 55,
		maintenanceFeesYear1to5: 3800,
		requiresTranslation: true
	},
	KR: {
		countryCode: 'KR',
		name: 'South Korea',
		flag: '🇰🇷',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 150,
			search: 400,
			examination: 500,
			grant: 200
		},
		attorneyFees: 5500,
		translationCostPerPage: 30,
		maintenanceFeesYear1to5: 1600,
		requiresTranslation: true
	},
	IN: {
		countryCode: 'IN',
		name: 'India',
		flag: '🇮🇳',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 80,
			search: 50,
			examination: 200,
			grant: 100
		},
		attorneyFees: 3500,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 1200,
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
			examination: 500,
			grant: 300
		},
		attorneyFees: 5500,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 2500,
		requiresTranslation: false
	},
	SG: {
		countryCode: 'SG',
		name: 'Singapore',
		flag: '🇸🇬',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 200,
			search: 500,
			examination: 400,
			grant: 200
		},
		attorneyFees: 4500,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 1800,
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
		attorneyFees: 4000,
		translationCostPerPage: 30,
		maintenanceFeesYear1to5: 1400,
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
			grant: 100
		},
		attorneyFees: 3500,
		translationCostPerPage: 25,
		maintenanceFeesYear1to5: 1000,
		requiresTranslation: true
	},
	NZ: {
		countryCode: 'NZ',
		name: 'New Zealand',
		flag: '🇳🇿',
		region: 'Asia-Pacific',
		officialFees: {
			filing: 200,
			search: 0,
			examination: 300,
			grant: 150
		},
		attorneyFees: 4000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 1500,
		requiresTranslation: false
	},
	BR: {
		countryCode: 'BR',
		name: 'Brazil',
		flag: '🇧🇷',
		region: 'Latin America',
		officialFees: {
			filing: 100,
			search: 0,
			examination: 200,
			grant: 150
		},
		attorneyFees: 4500,
		translationCostPerPage: 28,
		maintenanceFeesYear1to5: 1800,
		requiresTranslation: true
	},
	AR: {
		countryCode: 'AR',
		name: 'Argentina',
		flag: '🇦🇷',
		region: 'Latin America',
		officialFees: {
			filing: 80,
			search: 0,
			examination: 150,
			grant: 100
		},
		attorneyFees: 3500,
		translationCostPerPage: 25,
		maintenanceFeesYear1to5: 1200,
		requiresTranslation: true
	},
	CL: {
		countryCode: 'CL',
		name: 'Chile',
		flag: '🇨🇱',
		region: 'Latin America',
		officialFees: {
			filing: 100,
			search: 0,
			examination: 150,
			grant: 100
		},
		attorneyFees: 3000,
		translationCostPerPage: 25,
		maintenanceFeesYear1to5: 1000,
		requiresTranslation: true
	},
	CO: {
		countryCode: 'CO',
		name: 'Colombia',
		flag: '🇨🇴',
		region: 'Latin America',
		officialFees: {
			filing: 80,
			search: 0,
			examination: 150,
			grant: 80
		},
		attorneyFees: 3000,
		translationCostPerPage: 25,
		maintenanceFeesYear1to5: 900,
		requiresTranslation: true
	},
	IL: {
		countryCode: 'IL',
		name: 'Israel',
		flag: '🇮🇱',
		region: 'Middle East & Africa',
		officialFees: {
			filing: 300,
			search: 0,
			examination: 400,
			grant: 200
		},
		attorneyFees: 5000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 2000,
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
			examination: 300,
			grant: 200
		},
		attorneyFees: 4500,
		translationCostPerPage: 35,
		maintenanceFeesYear1to5: 1500,
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
			examination: 350,
			grant: 200
		},
		attorneyFees: 5000,
		translationCostPerPage: 40,
		maintenanceFeesYear1to5: 1800,
		requiresTranslation: true
	},
	ZA: {
		countryCode: 'ZA',
		name: 'South Africa',
		flag: '🇿🇦',
		region: 'Middle East & Africa',
		officialFees: {
			filing: 50,
			search: 0,
			examination: 0,
			grant: 100
		},
		attorneyFees: 3000,
		translationCostPerPage: 0,
		maintenanceFeesYear1to5: 1200,
		requiresTranslation: false
	}
};

export function getDefaultCosts(countryCode: string): CountryCosts | undefined {
	return DEFAULT_COUNTRY_COSTS[countryCode];
}
```

**Step 4: Verify TypeScript compiles**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: No errors

**Step 5: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: add data types and default cost data for calculator"
```

---

## Task 3: Create Calculation Logic and State Store

**Files:**

- Create: `src/lib/stores/calculator.svelte.ts`

**Step 1: Create the calculator store with calculation logic**

Create `src/lib/stores/calculator.svelte.ts`:

```typescript
import { DEFAULT_COUNTRY_COSTS } from '$lib/data/default-costs';
import type {
	CalculationInput,
	CalculationResult,
	CountryCostResult,
	UserConfig
} from '$lib/data/types';

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

	// Derived calculation result
	const result = $derived<CalculationResult>(calculateCosts(input, userConfig));

	function calculateCosts(input: CalculationInput, config: UserConfig): CalculationResult {
		const countryResults: CountryCostResult[] = [];

		for (const countryCode of input.countries) {
			const defaultCosts = DEFAULT_COUNTRY_COSTS[countryCode];
			if (!defaultCosts) continue;

			// Apply user overrides
			const officialOverrides = config.officialFeeOverrides[countryCode] || {};
			const attorneyOverride = config.attorneyRateOverrides[countryCode];
			const translationOverride = config.translationRateOverrides[countryCode];

			// Calculate official fees
			const filing = officialOverrides.filing ?? defaultCosts.officialFees.filing;
			const search = officialOverrides.search ?? defaultCosts.officialFees.search;
			const examination = officialOverrides.examination ?? defaultCosts.officialFees.examination;
			const grant = officialOverrides.grant ?? defaultCosts.officialFees.grant;
			const officialFees = filing + search + examination + grant;

			// Calculate attorney fees (adjust based on claims for utility patents)
			let attorneyFees = attorneyOverride ?? defaultCosts.attorneyFees;
			if (input.patentType === 'utility' && input.claims > 20) {
				// Add $100 per extra claim
				attorneyFees += (input.claims - 20) * 100;
			}

			// Calculate translation costs
			let translationCosts = 0;
			if (input.translationNeeded && defaultCosts.requiresTranslation) {
				const costPerPage = translationOverride ?? defaultCosts.translationCostPerPage;
				translationCosts = costPerPage * input.pages;
			}

			// Maintenance fees (5 years)
			const maintenanceFees = defaultCosts.maintenanceFeesYear1to5;

			// Total for this country
			const total = officialFees + attorneyFees + translationCosts + maintenanceFees;

			countryResults.push({
				countryCode,
				name: defaultCosts.name,
				flag: defaultCosts.flag,
				officialFees,
				attorneyFees,
				translationCosts,
				maintenanceFees,
				total,
				breakdown: { filing, search, examination, grant }
			});
		}

		// Sort by total cost descending
		countryResults.sort((a, b) => b.total - a.total);

		// Calculate totals
		const totalOfficialFees = countryResults.reduce((sum, r) => sum + r.officialFees, 0);
		const totalAttorneyFees = countryResults.reduce((sum, r) => sum + r.attorneyFees, 0);
		const totalTranslationCosts = countryResults.reduce((sum, r) => sum + r.translationCosts, 0);
		const totalMaintenanceFees = countryResults.reduce((sum, r) => sum + r.maintenanceFees, 0);
		const totalCost =
			totalOfficialFees + totalAttorneyFees + totalTranslationCosts + totalMaintenanceFees;

		return {
			totalCost,
			totalOfficialFees,
			totalAttorneyFees,
			totalTranslationCosts,
			totalMaintenanceFees,
			countryResults
		};
	}

	return {
		get input() {
			return input;
		},
		get result() {
			return result;
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

		// User config setters
		setOfficialFeeOverride(
			countryCode: string,
			field: keyof import('$lib/data/types').OfficialFees,
			value: number | null
		) {
			if (value === null) {
				// Remove override
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
```

**Step 2: Verify TypeScript compiles**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: No errors

**Step 3: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: add calculator store with calculation logic"
```

---

## Task 4: Build CountrySelector Component

**Files:**

- Create: `src/lib/components/calculator/CountrySelector.svelte`

**Step 1: Create the CountrySelector component**

Create `src/lib/components/calculator/CountrySelector.svelte`:

```svelte
<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { COUNTRIES, COUNTRY_PRESETS, REGIONS, getCountriesByRegion } from '$lib/data/countries';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { ChevronDown, ChevronUp, X } from '@lucide/svelte';

	let searchQuery = $state('');
	let isExpanded = $state(true);
	let activePreset = $state<string | null>(null);

	// Filtered countries based on search
	const filteredCountries = $derived(
		searchQuery.trim()
			? COUNTRIES.filter(
					(c) =>
						c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						c.code.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: COUNTRIES
	);

	// Check if a preset matches current selection
	function checkActivePreset() {
		for (const preset of COUNTRY_PRESETS) {
			if (
				preset.countries.length === calculatorStore.input.countries.length &&
				preset.countries.every((c) => calculatorStore.input.countries.includes(c))
			) {
				return preset.id;
			}
		}
		return null;
	}

	$effect(() => {
		activePreset = checkActivePreset();
	});

	function selectPreset(presetId: string) {
		const preset = COUNTRY_PRESETS.find((p) => p.id === presetId);
		if (preset) {
			calculatorStore.setCountries([...preset.countries]);
		}
	}

	function toggleCountry(code: string) {
		if (calculatorStore.input.countries.includes(code)) {
			calculatorStore.removeCountry(code);
		} else {
			calculatorStore.addCountry(code);
		}
	}

	function clearAll() {
		calculatorStore.setCountries([]);
	}
</script>

<Collapsible.Root bind:open={isExpanded} class="rounded-lg border border-white/10 bg-white/5">
	<Collapsible.Trigger
		class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
	>
		<div class="flex items-center gap-2">
			<span class="font-medium text-white">Target Countries</span>
			{#if calculatorStore.input.countries.length > 0}
				<Badge variant="secondary" class="bg-green-500/20 text-green-400">
					{calculatorStore.input.countries.length} selected
				</Badge>
			{/if}
		</div>
		{#if isExpanded}
			<ChevronUp class="h-4 w-4 text-slate-400" />
		{:else}
			<ChevronDown class="h-4 w-4 text-slate-400" />
		{/if}
	</Collapsible.Trigger>

	<Collapsible.Content class="px-4 pb-4">
		<!-- Preset Bundles -->
		<div class="mb-4 flex flex-wrap gap-2">
			{#each COUNTRY_PRESETS as preset}
				<Button
					variant={activePreset === preset.id ? 'default' : 'outline'}
					size="sm"
					class={activePreset === preset.id
						? 'bg-green-500 text-slate-900 hover:bg-green-400'
						: 'border-white/20 text-slate-300 hover:bg-white/10'}
					onclick={() => selectPreset(preset.id)}
				>
					{preset.name}
				</Button>
			{/each}
		</div>

		<!-- Selected Countries Tags -->
		{#if calculatorStore.input.countries.length > 0}
			<div class="mb-4 flex flex-wrap gap-2">
				{#each calculatorStore.input.countries as code}
					{@const country = COUNTRIES.find((c) => c.code === code)}
					{#if country}
						<Badge
							variant="secondary"
							class="flex items-center gap-1 bg-slate-700 pr-1 text-slate-200"
						>
							<span>{country.flag}</span>
							<span>{country.name}</span>
							<button
								onclick={() => calculatorStore.removeCountry(code)}
								class="ml-1 rounded p-0.5 hover:bg-slate-600"
							>
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}
				{/each}
				<Button variant="ghost" size="sm" class="h-6 text-xs text-slate-400" onclick={clearAll}>
					Clear all
				</Button>
			</div>
		{/if}

		<!-- Search Input -->
		<Input
			type="text"
			placeholder="Search countries..."
			bind:value={searchQuery}
			class="mb-4 border-white/20 bg-white/5 text-white placeholder:text-slate-500"
		/>

		<!-- Country List by Region -->
		<div class="max-h-64 space-y-4 overflow-y-auto">
			{#each REGIONS as region}
				{@const regionCountries = getCountriesByRegion(region).filter((c) =>
					filteredCountries.includes(c)
				)}
				{#if regionCountries.length > 0}
					<div>
						<h4 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
							{region}
						</h4>
						<div class="space-y-1">
							{#each regionCountries as country}
								<label
									class="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 hover:bg-white/5"
								>
									<Checkbox
										checked={calculatorStore.input.countries.includes(country.code)}
										onCheckedChange={() => toggleCountry(country.code)}
										class="border-white/30 data-[state=checked]:bg-green-500 data-[state=checked]:text-slate-900"
									/>
									<span class="text-lg">{country.flag}</span>
									<span class="text-sm text-slate-300">{country.name}</span>
								</label>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</Collapsible.Content>
</Collapsible.Root>
```

**Step 2: Verify TypeScript compiles**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: No errors

**Step 3: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: add CountrySelector component with presets and search"
```

---

## Task 5: Build PatentDetailsForm Component

**Files:**

- Create: `src/lib/components/calculator/PatentDetailsForm.svelte`

**Step 1: Create the PatentDetailsForm component**

Create `src/lib/components/calculator/PatentDetailsForm.svelte`:

```svelte
<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import type { PatentType, TechnologyField } from '$lib/data/types';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { ChevronDown, ChevronUp } from '@lucide/svelte';

	let isExpanded = $state(true);

	const PATENT_TYPES: { value: PatentType; label: string }[] = [
		{ value: 'utility', label: 'Utility Patent' },
		{ value: 'design', label: 'Design Patent' },
		{ value: 'provisional', label: 'Provisional Application' }
	];

	const TECHNOLOGY_FIELDS: { value: TechnologyField; label: string }[] = [
		{ value: 'mechanical', label: 'Mechanical' },
		{ value: 'electrical', label: 'Electrical' },
		{ value: 'software', label: 'Software' },
		{ value: 'biotech', label: 'Biotechnology' },
		{ value: 'chemical', label: 'Chemical' },
		{ value: 'pharma', label: 'Pharmaceutical' },
		{ value: 'other', label: 'Other' }
	];

	function handlePatentTypeChange(value: string) {
		calculatorStore.setPatentType(value as PatentType);
	}

	function handleTechFieldChange(value: string | undefined) {
		if (value) {
			calculatorStore.setTechnologyField(value as TechnologyField);
		}
	}

	function handleClaimsChange(e: Event) {
		const target = e.target as HTMLInputElement;
		calculatorStore.setClaims(parseInt(target.value) || 1);
	}

	function handlePagesChange(e: Event) {
		const target = e.target as HTMLInputElement;
		calculatorStore.setPages(parseInt(target.value) || 1);
	}

	// Get currently selected tech field for Select
	const selectedTechField = $derived(
		TECHNOLOGY_FIELDS.find((f) => f.value === calculatorStore.input.technologyField)
	);
</script>

<Collapsible.Root bind:open={isExpanded} class="rounded-lg border border-white/10 bg-white/5">
	<Collapsible.Trigger
		class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
	>
		<span class="font-medium text-white">Patent Details</span>
		{#if isExpanded}
			<ChevronUp class="h-4 w-4 text-slate-400" />
		{:else}
			<ChevronDown class="h-4 w-4 text-slate-400" />
		{/if}
	</Collapsible.Trigger>

	<Collapsible.Content class="space-y-4 px-4 pb-4">
		<!-- Patent Type -->
		<div class="space-y-2">
			<Label class="text-sm text-slate-400">Patent Type</Label>
			<RadioGroup.Root
				value={calculatorStore.input.patentType}
				onValueChange={handlePatentTypeChange}
				class="flex flex-col gap-2"
			>
				{#each PATENT_TYPES as type}
					<div class="flex items-center gap-2">
						<RadioGroup.Item
							value={type.value}
							id={`patent-type-${type.value}`}
							class="border-white/30 text-green-500 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
						/>
						<Label for={`patent-type-${type.value}`} class="cursor-pointer text-sm text-slate-300">
							{type.label}
						</Label>
					</div>
				{/each}
			</RadioGroup.Root>
		</div>

		<!-- Number of Claims -->
		<div class="space-y-2">
			<Label for="claims" class="text-sm text-slate-400">Number of Claims</Label>
			<Input
				id="claims"
				type="number"
				min="1"
				value={calculatorStore.input.claims}
				oninput={handleClaimsChange}
				class="border-white/20 bg-white/5 text-white"
			/>
		</div>

		<!-- Number of Pages -->
		<div class="space-y-2">
			<Label for="pages" class="text-sm text-slate-400">Number of Pages</Label>
			<Input
				id="pages"
				type="number"
				min="1"
				value={calculatorStore.input.pages}
				oninput={handlePagesChange}
				class="border-white/20 bg-white/5 text-white"
			/>
		</div>

		<!-- Technology Field -->
		<div class="space-y-2">
			<Label class="text-sm text-slate-400">Technology Field</Label>
			<Select.Root
				type="single"
				value={{ value: calculatorStore.input.technologyField, label: selectedTechField?.label }}
				onValueChange={(v) => handleTechFieldChange(v?.value)}
			>
				<Select.Trigger class="w-full border-white/20 bg-white/5 text-white">
					{selectedTechField?.label || 'Select field'}
				</Select.Trigger>
				<Select.Content class="border-white/20 bg-slate-800">
					{#each TECHNOLOGY_FIELDS as field}
						<Select.Item value={field.value} class="text-slate-300 hover:bg-slate-700">
							{field.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
```

**Step 2: Verify TypeScript compiles**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: No errors

**Step 3: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: add PatentDetailsForm component"
```

---

## Task 6: Build FilingStrategyForm Component

**Files:**

- Create: `src/lib/components/calculator/FilingStrategyForm.svelte`

**Step 1: Create the FilingStrategyForm component**

Create `src/lib/components/calculator/FilingStrategyForm.svelte`:

```svelte
<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Switch } from '$lib/components/ui/switch';
	import type { FilingStrategy } from '$lib/data/types';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { ChevronDown, ChevronUp } from '@lucide/svelte';

	let isExpanded = $state(true);

	const FILING_STRATEGIES: { value: FilingStrategy; label: string; description: string }[] = [
		{
			value: 'direct',
			label: 'Direct National Filing',
			description: 'File directly in each country'
		},
		{
			value: 'pct',
			label: 'PCT International',
			description: 'File via Patent Cooperation Treaty'
		}
	];

	function handleStrategyChange(value: string) {
		calculatorStore.setFilingStrategy(value as FilingStrategy);
	}

	function handleDateChange(e: Event) {
		const target = e.target as HTMLInputElement;
		calculatorStore.setPriorityDate(target.value || null);
	}

	function handleTranslationToggle(checked: boolean) {
		calculatorStore.setTranslationNeeded(checked);
	}
</script>

<Collapsible.Root bind:open={isExpanded} class="rounded-lg border border-white/10 bg-white/5">
	<Collapsible.Trigger
		class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
	>
		<span class="font-medium text-white">Filing Strategy</span>
		{#if isExpanded}
			<ChevronUp class="h-4 w-4 text-slate-400" />
		{:else}
			<ChevronDown class="h-4 w-4 text-slate-400" />
		{/if}
	</Collapsible.Trigger>

	<Collapsible.Content class="space-y-4 px-4 pb-4">
		<!-- Filing Route -->
		<div class="space-y-2">
			<Label class="text-sm text-slate-400">Filing Route</Label>
			<RadioGroup.Root
				value={calculatorStore.input.filingStrategy}
				onValueChange={handleStrategyChange}
				class="flex flex-col gap-3"
			>
				{#each FILING_STRATEGIES as strategy}
					<div
						class="flex items-start gap-2 rounded-lg border border-white/10 p-3 hover:bg-white/5"
					>
						<RadioGroup.Item
							value={strategy.value}
							id={`strategy-${strategy.value}`}
							class="mt-0.5 border-white/30 text-green-500 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
						/>
						<div>
							<Label
								for={`strategy-${strategy.value}`}
								class="cursor-pointer text-sm font-medium text-slate-200"
							>
								{strategy.label}
							</Label>
							<p class="text-xs text-slate-500">{strategy.description}</p>
						</div>
					</div>
				{/each}
			</RadioGroup.Root>
		</div>

		<!-- Priority Date -->
		<div class="space-y-2">
			<Label for="priority-date" class="text-sm text-slate-400">Priority Date (optional)</Label>
			<Input
				id="priority-date"
				type="date"
				value={calculatorStore.input.priorityDate || ''}
				oninput={handleDateChange}
				class="border-white/20 bg-white/5 text-white [color-scheme:dark]"
			/>
			<p class="text-xs text-slate-500">Used to calculate filing deadlines</p>
		</div>

		<!-- Translation Toggle -->
		<div class="flex items-center justify-between rounded-lg border border-white/10 p-3">
			<div>
				<Label for="translation-toggle" class="text-sm font-medium text-slate-200">
					Include Translation Costs
				</Label>
				<p class="text-xs text-slate-500">Calculate translation fees for non-English countries</p>
			</div>
			<Switch
				id="translation-toggle"
				checked={calculatorStore.input.translationNeeded}
				onCheckedChange={handleTranslationToggle}
				class="data-[state=checked]:bg-green-500"
			/>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
```

**Step 2: Verify TypeScript compiles**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: No errors

**Step 3: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: add FilingStrategyForm component"
```

---

## Task 7: Build CostSummaryCard Component

**Files:**

- Create: `src/lib/components/calculator/CostSummaryCard.svelte`

**Step 1: Create the CostSummaryCard component**

Create `src/lib/components/calculator/CostSummaryCard.svelte`:

```svelte
<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { calculatorStore } from '$lib/stores/calculator.svelte';

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	const result = $derived(calculatorStore.result);
</script>

<Card.Root class="border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
	<Card.Content class="p-6">
		<!-- Empty State -->
		{#if result.countryResults.length === 0}
			<div class="py-8 text-center">
				<p class="text-lg text-slate-400">Select countries to see cost estimates</p>
			</div>
		{:else}
			<!-- Total Cost -->
			<div class="mb-6 text-center">
				<p class="text-sm font-medium tracking-wider text-slate-400 uppercase">
					Total Estimated Cost
				</p>
				<p class="mt-2 text-4xl font-bold text-green-400 lg:text-5xl">
					{formatCurrency(result.totalCost)}
				</p>
				<p class="mt-1 text-sm text-slate-500">
					{result.countryResults.length}
					{result.countryResults.length === 1 ? 'country' : 'countries'}
				</p>
			</div>

			<!-- Cost Breakdown -->
			<div class="grid grid-cols-2 gap-3 border-t border-white/10 pt-4 lg:grid-cols-4">
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Official Fees</p>
					<p class="mt-1 text-lg font-semibold text-slate-200">
						{formatCurrency(result.totalOfficialFees)}
					</p>
				</div>
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Attorney</p>
					<p class="mt-1 text-lg font-semibold text-slate-200">
						{formatCurrency(result.totalAttorneyFees)}
					</p>
				</div>
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Translation</p>
					<p class="mt-1 text-lg font-semibold text-slate-200">
						{formatCurrency(result.totalTranslationCosts)}
					</p>
				</div>
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Maintenance</p>
					<p class="mt-1 text-lg font-semibold text-slate-200">
						{formatCurrency(result.totalMaintenanceFees)}
					</p>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
```

**Step 2: Verify TypeScript compiles**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: No errors

**Step 3: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: add CostSummaryCard component"
```

---

## Task 8: Build CostBreakdownTable Component

**Files:**

- Create: `src/lib/components/calculator/CostBreakdownTable.svelte`

**Step 1: Create the CostBreakdownTable component**

Create `src/lib/components/calculator/CostBreakdownTable.svelte`:

```svelte
<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import type { CountryCostResult } from '$lib/data/types';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { ChevronDown, ChevronRight } from '@lucide/svelte';

	type SortField =
		| 'name'
		| 'officialFees'
		| 'attorneyFees'
		| 'translationCosts'
		| 'maintenanceFees'
		| 'total';
	type SortDirection = 'asc' | 'desc';

	let sortField = $state<SortField>('total');
	let sortDirection = $state<SortDirection>('desc');
	let expandedRows = $state<Set<string>>(new Set());

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// Sort the results
	const sortedResults = $derived(() => {
		const results = [...calculatorStore.result.countryResults];
		results.sort((a, b) => {
			let aVal: number | string;
			let bVal: number | string;

			if (sortField === 'name') {
				aVal = a.name;
				bVal = b.name;
			} else {
				aVal = a[sortField];
				bVal = b[sortField];
			}

			if (typeof aVal === 'string' && typeof bVal === 'string') {
				return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
			}

			return sortDirection === 'asc'
				? (aVal as number) - (bVal as number)
				: (bVal as number) - (aVal as number);
		});
		return results;
	});

	function handleSort(field: SortField) {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'desc';
		}
	}

	function toggleRow(countryCode: string) {
		const newExpanded = new Set(expandedRows);
		if (newExpanded.has(countryCode)) {
			newExpanded.delete(countryCode);
		} else {
			newExpanded.add(countryCode);
		}
		expandedRows = newExpanded;
	}

	function getSortIndicator(field: SortField): string {
		if (sortField !== field) return '';
		return sortDirection === 'asc' ? ' ↑' : ' ↓';
	}
</script>

{#if calculatorStore.result.countryResults.length === 0}
	<div class="flex flex-col items-center justify-center py-16 text-center">
		<div class="mb-4 text-6xl opacity-20">🌍</div>
		<p class="text-lg text-slate-400">Select countries to see cost breakdown</p>
		<p class="mt-2 text-sm text-slate-500">
			Use the preset bundles or search for specific countries
		</p>
	</div>
{:else}
	<div class="overflow-x-auto">
		<Table.Root>
			<Table.Header>
				<Table.Row class="border-white/10 hover:bg-transparent">
					<Table.Head class="w-8"></Table.Head>
					<Table.Head>
						<button
							class="flex items-center gap-1 text-slate-400 hover:text-white"
							onclick={() => handleSort('name')}
						>
							Country{getSortIndicator('name')}
						</button>
					</Table.Head>
					<Table.Head class="text-right">
						<button
							class="flex items-center gap-1 text-slate-400 hover:text-white"
							onclick={() => handleSort('officialFees')}
						>
							Official{getSortIndicator('officialFees')}
						</button>
					</Table.Head>
					<Table.Head class="text-right">
						<button
							class="flex items-center gap-1 text-slate-400 hover:text-white"
							onclick={() => handleSort('attorneyFees')}
						>
							Attorney{getSortIndicator('attorneyFees')}
						</button>
					</Table.Head>
					<Table.Head class="hidden text-right md:table-cell">
						<button
							class="flex items-center gap-1 text-slate-400 hover:text-white"
							onclick={() => handleSort('translationCosts')}
						>
							Translation{getSortIndicator('translationCosts')}
						</button>
					</Table.Head>
					<Table.Head class="hidden text-right lg:table-cell">
						<button
							class="flex items-center gap-1 text-slate-400 hover:text-white"
							onclick={() => handleSort('maintenanceFees')}
						>
							Maint.(5y){getSortIndicator('maintenanceFees')}
						</button>
					</Table.Head>
					<Table.Head class="text-right">
						<button
							class="flex items-center gap-1 font-semibold text-green-400 hover:text-green-300"
							onclick={() => handleSort('total')}
						>
							Total{getSortIndicator('total')}
						</button>
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each sortedResults() as result}
					{@const isExpanded = expandedRows.has(result.countryCode)}
					<Table.Row
						class="cursor-pointer border-white/10 hover:bg-white/5"
						onclick={() => toggleRow(result.countryCode)}
					>
						<Table.Cell class="w-8 text-slate-500">
							{#if isExpanded}
								<ChevronDown class="h-4 w-4" />
							{:else}
								<ChevronRight class="h-4 w-4" />
							{/if}
						</Table.Cell>
						<Table.Cell>
							<div class="flex items-center gap-2">
								<span class="text-lg">{result.flag}</span>
								<span class="text-slate-200">{result.name}</span>
							</div>
						</Table.Cell>
						<Table.Cell class="text-right text-slate-300">
							{formatCurrency(result.officialFees)}
						</Table.Cell>
						<Table.Cell class="text-right text-slate-300">
							{formatCurrency(result.attorneyFees)}
						</Table.Cell>
						<Table.Cell class="hidden text-right text-slate-300 md:table-cell">
							{result.translationCosts > 0 ? formatCurrency(result.translationCosts) : '–'}
						</Table.Cell>
						<Table.Cell class="hidden text-right text-slate-300 lg:table-cell">
							{formatCurrency(result.maintenanceFees)}
						</Table.Cell>
						<Table.Cell class="text-right font-semibold text-green-400">
							{formatCurrency(result.total)}
						</Table.Cell>
					</Table.Row>

					<!-- Expanded Detail Row -->
					{#if isExpanded}
						<Table.Row class="border-white/5 bg-slate-800/50">
							<Table.Cell colspan={7} class="px-8 py-4">
								<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
									<div>
										<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">
											Official Fees Breakdown
										</p>
										<div class="mt-2 space-y-1 text-sm">
											<div class="flex justify-between">
												<span class="text-slate-400">Filing:</span>
												<span class="text-slate-300">{formatCurrency(result.breakdown.filing)}</span
												>
											</div>
											<div class="flex justify-between">
												<span class="text-slate-400">Search:</span>
												<span class="text-slate-300">{formatCurrency(result.breakdown.search)}</span
												>
											</div>
											<div class="flex justify-between">
												<span class="text-slate-400">Examination:</span>
												<span class="text-slate-300"
													>{formatCurrency(result.breakdown.examination)}</span
												>
											</div>
											<div class="flex justify-between">
												<span class="text-slate-400">Grant:</span>
												<span class="text-slate-300">{formatCurrency(result.breakdown.grant)}</span>
											</div>
										</div>
									</div>
									<div>
										<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">
											Attorney Fees
										</p>
										<p class="mt-2 text-lg font-semibold text-slate-200">
											{formatCurrency(result.attorneyFees)}
										</p>
									</div>
									<div>
										<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">
											Translation
										</p>
										<p class="mt-2 text-lg font-semibold text-slate-200">
											{result.translationCosts > 0
												? formatCurrency(result.translationCosts)
												: 'Not required'}
										</p>
									</div>
									<div>
										<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">
											Maintenance (5 years)
										</p>
										<p class="mt-2 text-lg font-semibold text-slate-200">
											{formatCurrency(result.maintenanceFees)}
										</p>
									</div>
								</div>
							</Table.Cell>
						</Table.Row>
					{/if}
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}
```

**Step 2: Verify TypeScript compiles**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: No errors

**Step 3: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: add CostBreakdownTable component with sortable columns"
```

---

## Task 9: Build SettingsModal Component

**Files:**

- Create: `src/lib/components/calculator/SettingsModal.svelte`

**Step 1: Create the SettingsModal component**

Create `src/lib/components/calculator/SettingsModal.svelte`:

```svelte
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import { COUNTRIES } from '$lib/data/countries';
	import { DEFAULT_COUNTRY_COSTS } from '$lib/data/default-costs';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { Settings, RotateCcw } from '@lucide/svelte';

	interface Props {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	}

	let { open = $bindable(false), onOpenChange }: Props = $props();

	let selectedCountryCode = $state('US');

	const selectedCountry = $derived(COUNTRIES.find((c) => c.code === selectedCountryCode));
	const defaultCosts = $derived(DEFAULT_COUNTRY_COSTS[selectedCountryCode]);
	const userOverrides = $derived({
		official: calculatorStore.userConfig.officialFeeOverrides[selectedCountryCode] || {},
		attorney: calculatorStore.userConfig.attorneyRateOverrides[selectedCountryCode],
		translation: calculatorStore.userConfig.translationRateOverrides[selectedCountryCode]
	});

	function handleOfficialFeeChange(field: 'filing' | 'search' | 'examination' | 'grant', e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : null;
		calculatorStore.setOfficialFeeOverride(selectedCountryCode, field, value);
	}

	function handleAttorneyRateChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : null;
		calculatorStore.setAttorneyRateOverride(selectedCountryCode, value);
	}

	function handleTranslationRateChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : null;
		calculatorStore.setTranslationRateOverride(selectedCountryCode, value);
	}

	function resetCountry() {
		calculatorStore.resetCountryOverrides(selectedCountryCode);
	}

	function resetAll() {
		calculatorStore.resetAllOverrides();
	}

	function handleCountryChange(value: string | undefined) {
		if (value) {
			selectedCountryCode = value;
		}
	}
</script>

<Dialog.Root bind:open {onOpenChange}>
	<Dialog.Trigger asChild>
		<Button variant="ghost" size="icon" class="text-slate-400 hover:text-white">
			<Settings class="h-5 w-5" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content
		class="max-h-[85vh] max-w-2xl overflow-y-auto border-white/10 bg-slate-900 text-white"
	>
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Settings class="h-5 w-5" />
				Cost Configuration
			</Dialog.Title>
			<Dialog.Description class="text-slate-400">
				Customize cost estimates with your own rates. Changes are saved automatically.
			</Dialog.Description>
		</Dialog.Header>

		<div class="mt-4">
			<!-- Country Selector -->
			<div class="mb-4">
				<Label class="text-sm text-slate-400">Select Country to Configure</Label>
				<Select.Root
					type="single"
					value={{ value: selectedCountryCode, label: selectedCountry?.name }}
					onValueChange={(v) => handleCountryChange(v?.value)}
				>
					<Select.Trigger class="mt-1 w-full border-white/20 bg-white/5 text-white">
						<span class="flex items-center gap-2">
							<span>{selectedCountry?.flag}</span>
							<span>{selectedCountry?.name}</span>
						</span>
					</Select.Trigger>
					<Select.Content class="max-h-64 border-white/20 bg-slate-800">
						{#each COUNTRIES as country}
							<Select.Item value={country.code} class="text-slate-300 hover:bg-slate-700">
								<span class="flex items-center gap-2">
									<span>{country.flag}</span>
									<span>{country.name}</span>
								</span>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			{#if defaultCosts}
				<Tabs.Root value="official" class="w-full">
					<Tabs.List class="grid w-full grid-cols-3 bg-slate-800">
						<Tabs.Trigger value="official" class="data-[state=active]:bg-slate-700">
							Official Fees
						</Tabs.Trigger>
						<Tabs.Trigger value="attorney" class="data-[state=active]:bg-slate-700">
							Attorney
						</Tabs.Trigger>
						<Tabs.Trigger value="translation" class="data-[state=active]:bg-slate-700">
							Translation
						</Tabs.Trigger>
					</Tabs.List>

					<!-- Official Fees Tab -->
					<Tabs.Content value="official" class="mt-4 space-y-4">
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="space-y-2">
								<Label for="filing-fee" class="text-sm text-slate-400">
									Filing Fee
									<span class="ml-1 text-xs text-slate-500">
										(default: ${defaultCosts.officialFees.filing})
									</span>
								</Label>
								<Input
									id="filing-fee"
									type="number"
									min="0"
									placeholder={String(defaultCosts.officialFees.filing)}
									value={userOverrides.official.filing ?? ''}
									oninput={(e) => handleOfficialFeeChange('filing', e)}
									class="border-white/20 bg-white/5 text-white"
								/>
							</div>
							<div class="space-y-2">
								<Label for="search-fee" class="text-sm text-slate-400">
									Search Fee
									<span class="ml-1 text-xs text-slate-500">
										(default: ${defaultCosts.officialFees.search})
									</span>
								</Label>
								<Input
									id="search-fee"
									type="number"
									min="0"
									placeholder={String(defaultCosts.officialFees.search)}
									value={userOverrides.official.search ?? ''}
									oninput={(e) => handleOfficialFeeChange('search', e)}
									class="border-white/20 bg-white/5 text-white"
								/>
							</div>
							<div class="space-y-2">
								<Label for="examination-fee" class="text-sm text-slate-400">
									Examination Fee
									<span class="ml-1 text-xs text-slate-500">
										(default: ${defaultCosts.officialFees.examination})
									</span>
								</Label>
								<Input
									id="examination-fee"
									type="number"
									min="0"
									placeholder={String(defaultCosts.officialFees.examination)}
									value={userOverrides.official.examination ?? ''}
									oninput={(e) => handleOfficialFeeChange('examination', e)}
									class="border-white/20 bg-white/5 text-white"
								/>
							</div>
							<div class="space-y-2">
								<Label for="grant-fee" class="text-sm text-slate-400">
									Grant Fee
									<span class="ml-1 text-xs text-slate-500">
										(default: ${defaultCosts.officialFees.grant})
									</span>
								</Label>
								<Input
									id="grant-fee"
									type="number"
									min="0"
									placeholder={String(defaultCosts.officialFees.grant)}
									value={userOverrides.official.grant ?? ''}
									oninput={(e) => handleOfficialFeeChange('grant', e)}
									class="border-white/20 bg-white/5 text-white"
								/>
							</div>
						</div>
					</Tabs.Content>

					<!-- Attorney Tab -->
					<Tabs.Content value="attorney" class="mt-4 space-y-4">
						<div class="space-y-2">
							<Label for="attorney-fee" class="text-sm text-slate-400">
								Attorney Fees (total)
								<span class="ml-1 text-xs text-slate-500">
									(default: ${defaultCosts.attorneyFees})
								</span>
							</Label>
							<Input
								id="attorney-fee"
								type="number"
								min="0"
								placeholder={String(defaultCosts.attorneyFees)}
								value={userOverrides.attorney ?? ''}
								oninput={handleAttorneyRateChange}
								class="border-white/20 bg-white/5 text-white"
							/>
							<p class="text-xs text-slate-500">
								Total attorney fees for filing in {selectedCountry?.name}
							</p>
						</div>
					</Tabs.Content>

					<!-- Translation Tab -->
					<Tabs.Content value="translation" class="mt-4 space-y-4">
						<div class="space-y-2">
							<Label for="translation-rate" class="text-sm text-slate-400">
								Translation Cost per Page
								<span class="ml-1 text-xs text-slate-500">
									(default: ${defaultCosts.translationCostPerPage})
								</span>
							</Label>
							<Input
								id="translation-rate"
								type="number"
								min="0"
								placeholder={String(defaultCosts.translationCostPerPage)}
								value={userOverrides.translation ?? ''}
								oninput={handleTranslationRateChange}
								class="border-white/20 bg-white/5 text-white"
							/>
							{#if !defaultCosts.requiresTranslation}
								<p class="text-xs text-amber-400">
									Note: {selectedCountry?.name} typically doesn't require translation
								</p>
							{/if}
						</div>
					</Tabs.Content>
				</Tabs.Root>

				<!-- Reset Buttons -->
				<div class="mt-6 flex gap-2 border-t border-white/10 pt-4">
					<Button
						variant="outline"
						size="sm"
						class="border-white/20 text-slate-300"
						onclick={resetCountry}
					>
						<RotateCcw class="mr-2 h-4 w-4" />
						Reset {selectedCountry?.name}
					</Button>
					<Button
						variant="outline"
						size="sm"
						class="border-white/20 text-slate-300"
						onclick={resetAll}
					>
						<RotateCcw class="mr-2 h-4 w-4" />
						Reset All Countries
					</Button>
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
```

**Step 2: Verify TypeScript compiles**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: No errors

**Step 3: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: add SettingsModal component for cost configuration"
```

---

## Task 10: Build the HomePage (Orchestration)

**Files:**

- Modify: `src/routes/home/+page.svelte`

**Step 1: Replace the placeholder with the full calculator page**

Replace contents of `src/routes/home/+page.svelte`:

```svelte
<script lang="ts">
	import CostBreakdownTable from '$lib/components/calculator/CostBreakdownTable.svelte';
	import CostSummaryCard from '$lib/components/calculator/CostSummaryCard.svelte';
	import CountrySelector from '$lib/components/calculator/CountrySelector.svelte';
	import FilingStrategyForm from '$lib/components/calculator/FilingStrategyForm.svelte';
	import PatentDetailsForm from '$lib/components/calculator/PatentDetailsForm.svelte';
	import SettingsModal from '$lib/components/calculator/SettingsModal.svelte';
</script>

<div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
	<!-- Header -->
	<header class="flex items-center justify-between border-b border-white/10 px-4 py-4 lg:px-8">
		<a href="/" class="flex items-center gap-2">
			<img src="/patimate-logo.png" alt="PatiMate" class="h-8 w-auto lg:h-10" />
		</a>
		<SettingsModal />
	</header>

	<!-- Main Content -->
	<main class="flex flex-col lg:flex-row">
		<!-- Input Panel (Left) -->
		<aside
			class="w-full space-y-4 border-b border-white/10 p-4 lg:w-[35%] lg:border-r lg:border-b-0 lg:p-6"
		>
			<h1 class="text-xl font-bold text-white lg:text-2xl">Patent Cost Calculator</h1>
			<p class="text-sm text-slate-400">Estimate patent filing costs across multiple countries</p>

			<div class="space-y-4 pt-2">
				<CountrySelector />
				<PatentDetailsForm />
				<FilingStrategyForm />
			</div>
		</aside>

		<!-- Results Panel (Right) -->
		<section class="flex-1 p-4 lg:p-6">
			<!-- Summary Card -->
			<div class="mb-6">
				<CostSummaryCard />
			</div>

			<!-- Breakdown Table -->
			<div class="rounded-lg border border-white/10 bg-white/5 p-4">
				<h2 class="mb-4 text-lg font-semibold text-white">Cost Breakdown by Country</h2>
				<CostBreakdownTable />
			</div>
		</section>
	</main>
</div>
```

**Step 2: Verify TypeScript compiles**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: No errors

**Step 3: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: build HomePage with calculator dashboard layout"
```

---

## Task 11: Test and Polish

**Files:**

- Possibly adjust any component based on testing

**Step 1: Run dev server**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm dev
```

Open http://localhost:5173/home and verify:

- Dashboard layout displays correctly (35/65 split on desktop)
- Country presets work (clicking "Big 5" selects 5 countries)
- Custom country selection works (search, checkboxes)
- Patent details form updates (radio buttons, number inputs, dropdown)
- Filing strategy form works (radio, date picker, toggle)
- Cost summary updates live as selections change
- Breakdown table shows correct data
- Table sorting works (click column headers)
- Row expansion shows detailed breakdown
- Settings modal opens (gear icon)
- Settings changes persist (modify a value, refresh page)
- Mobile layout works (stack on narrow viewport)

**Step 2: Run build**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm build
```

Expected: Build succeeds

**Step 3: Format code**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm format
```

**Step 4: Final commit if any adjustments made**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "chore: polish and finalize calculator implementation"
```

---

## Summary of Changes

| Action | File Path                                                 |
| ------ | --------------------------------------------------------- |
| Create | `src/lib/data/types.ts`                                   |
| Create | `src/lib/data/countries.ts`                               |
| Create | `src/lib/data/default-costs.ts`                           |
| Create | `src/lib/stores/calculator.svelte.ts`                     |
| Create | `src/lib/components/calculator/CountrySelector.svelte`    |
| Create | `src/lib/components/calculator/PatentDetailsForm.svelte`  |
| Create | `src/lib/components/calculator/FilingStrategyForm.svelte` |
| Create | `src/lib/components/calculator/CostSummaryCard.svelte`    |
| Create | `src/lib/components/calculator/CostBreakdownTable.svelte` |
| Create | `src/lib/components/calculator/SettingsModal.svelte`      |
| Modify | `src/routes/home/+page.svelte`                            |

## shadcn-svelte Components Installed

- input
- select
- radio-group
- checkbox
- dialog
- tabs
- card
- table
- badge
- label
- collapsible
- switch
