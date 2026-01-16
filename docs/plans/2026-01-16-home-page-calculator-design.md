# Patent Filing Cost Calculator - Design Document

**Date:** 2026-01-16

**Goal:** Build an interactive patent filing cost estimation calculator on the /home route with a dashboard-style layout, detailed inputs, and itemized cost breakdowns.

---

## User Requirements

### Inputs (Detailed)
- **Target countries:** Preset bundles (Big 5, PCT Major, Europe, Asia-Pacific) + custom selection with regional groupings
- **Patent type:** Utility, Design, or Provisional
- **Number of claims:** Numeric input (default: 20)
- **Number of pages:** Numeric input (default: 30)
- **Filing strategy:** Direct National or PCT International route
- **Priority date:** Date picker for deadline/urgency calculations
- **Technology field:** Mechanical, Electrical, Software, Biotech, Chemical, Pharma, Other
- **Translation needed:** Toggle (auto-detected based on countries, user can override)

### Outputs
- **Summary total:** Large prominent figure with quick category breakdown
- **Itemized breakdown:** Per-country table showing official fees, attorney fees, translation costs, maintenance fees (5-year)
- **Expandable rows:** Click country row to see detailed sub-breakdown (filing, examination, grant fees, etc.)

### Data Approach
- **Hybrid with defaults:** Pre-populated reasonable defaults for all costs
- **Fully configurable:** Users can override any value via settings modal
- **Persistence:** Settings saved to localStorage (no account required)

---

## Layout Structure

### Desktop (>= 1024px)

```
┌─────────────────────────────────────────────────────────────┐
│  Logo                                    [Settings gear]    │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│   INPUT PANEL        │         RESULTS PANEL                │
│   (35-40% width)     │         (60-65% width)               │
│                      │                                      │
│   - Country select   │   - Summary total at top             │
│   - Patent details   │   - Itemized breakdown table         │
│   - Filing strategy  │     per selected country             │
│                      │   - Cost category breakdown          │
│                      │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

### Mobile (< 1024px)

```
┌─────────────────────────┐
│  Logo        [⚙️]       │
├─────────────────────────┤
│    SUMMARY CARD         │
│    Total: $X            │
│    [View full breakdown]│
├─────────────────────────┤
│    INPUT SECTIONS       │
│    (stacked vertically) │
└─────────────────────────┘
```

---

## Input Panel Design

### Header
- Logo (same as landing page)
- Settings gear icon → opens configuration modal

### Section A: Country Selection (expanded by default)
- Preset bundle chips: "Big 5", "PCT Major", "Europe", "Asia-Pacific", "Custom"
- Searchable multi-select dropdown grouped by region
- Selected countries as removable tags

### Section B: Patent Details
- Patent type: Radio buttons (Utility / Design / Provisional)
- Number of claims: Number input
- Number of pages: Number input
- Technology field: Dropdown

### Section C: Filing Strategy
- Route: Radio buttons (Direct National / PCT International)
- Priority date: Date picker
- Translation needed: Toggle

---

## Results Panel Design

### Summary Header (sticky)
- Large green total figure
- Category breakdown: Official Fees | Attorney | Translation | Maintenance
- Country count

### Country Breakdown Table
| Country | Official | Attorney | Translation | Maint.(5y) | Total |
|---------|----------|----------|-------------|------------|-------|
| 🇺🇸 USA | $2,500 | $8,000 | – | $4,500 | $15,000 |
| 🇪🇺 EPO | $6,200 | $12,000 | $3,500 | $8,200 | $29,900 |

- Sortable columns
- Hover highlights row
- Click to expand detailed sub-breakdown

### Empty State
- "Select countries to see cost estimates"
- Subtle placeholder visual

---

## Settings Modal Design

### Structure
- Tabbed interface: [Official Fees] [Attorney Rates] [Translation]
- Per-country configuration with default value reference
- "Reset to defaults" button
- Save/Cancel actions

### Official Fees Tab
- Country dropdown selector
- Fee fields: Filing, Search, Examination, Grant/Issue

### Attorney Rates Tab
- Per-country fee overrides
- Or global hourly rate + estimated hours

### Translation Tab
- Cost per word/page by language

---

## Visual Design

- **Theme:** Dark (slate gradients, consistent with landing page)
- **Accent color:** Green (#4ade80 / green-400)
- **Typography:** Same as landing page
- **Components:** shadcn-svelte for forms, buttons, modals, tables

---

## Components to Build

1. `CountrySelector` - preset chips + searchable multi-select
2. `PatentDetailsForm` - patent type, claims, pages, tech field inputs
3. `FilingStrategyForm` - route, priority date, translation toggle
4. `CostSummaryCard` - total + category breakdown display
5. `CostBreakdownTable` - per-country itemized table with expandable rows
6. `SettingsModal` - tabbed configuration interface
7. Update `HomePage` - orchestrates all components

---

## Data Structures

### Country Cost Data
```typescript
interface CountryCosts {
  countryCode: string;
  name: string;
  officialFees: {
    filing: number;
    search: number;
    examination: number;
    grant: number;
  };
  attorneyFees: number;
  translationCostPerPage: number;
  maintenanceFeesYear1to5: number;
}
```

### User Configuration
```typescript
interface UserConfig {
  officialFeeOverrides: Record<string, Partial<OfficialFees>>;
  attorneyRateOverrides: Record<string, number>;
  translationRateOverrides: Record<string, number>;
}
```

### Calculation Input
```typescript
interface CalculationInput {
  countries: string[];
  patentType: 'utility' | 'design' | 'provisional';
  claims: number;
  pages: number;
  filingStrategy: 'direct' | 'pct';
  priorityDate: Date | null;
  technologyField: string;
  translationNeeded: boolean;
}
```

---

## Non-Goals (for MVP)

- User accounts / authentication
- Saving estimates
- Export to PDF/CSV
- Real-time official fee API integration
- Multi-language support
