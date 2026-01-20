# Cost Breakdown Table Redesign

## Overview

Redesign the cost breakdown table to include a more detailed fee structure with configurable global and per-country settings.

## New Table Structure

| Column | Description | Configuration |
|--------|-------------|---------------|
| Country | Flag + country name | Static |
| Official | Filing + Search + Examination + Grant fees | Per-country |
| Foreign Attorney | In-country attorney fees (e.g., Japanese attorney for JP) | Per-country |
| Attorney | User's local/home attorney fees | **Global** |
| Flat Fee | Fixed service/processing fee per filing | **Global** |
| Translation | Cost per page × number of pages | Per-country |
| Maintenance | Fees for configured time period (5/10/20 years) | Per-country |
| **Total** | Sum of all cost columns | Calculated |

## Configuration Structure

### Global Settings
- `attorneyFee`: User's local attorney fee (applies to all filings)
- `flatFee`: Fixed service fee per filing
- `maintenancePeriod`: Time period for maintenance calculation (5, 10, or 20 years)

### Per-Country Settings
- `officialFees`: { filing, search, examination, grant }
- `foreignAttorneyFee`: In-country attorney fee
- `translationCostPerPage`: Translation cost per page
- `maintenanceFeesAnnual`: Annual maintenance fee (multiplied by period)

## Responsive Behavior

- **Mobile**: Country, Official, Attorney, Total
- **Tablet (md)**: + Foreign Attorney, Translation
- **Desktop (lg)**: All columns visible

## Files to Modify

1. `src/lib/data/types.ts` - Add new types
2. `src/lib/data/default-costs.ts` - Add foreignAttorneyFee per country
3. `src/lib/stores/calculator.svelte.ts` - Add global settings + new overrides
4. `src/lib/components/calculator/SettingsModal.svelte` - New configuration UI
5. `src/lib/components/calculator/CostBreakdownTable.svelte` - New table columns

## Default Values

### Global Defaults
- Attorney: $3,000
- Flat Fee: $500
- Maintenance Period: 5 years

### Per-Country Foreign Attorney Defaults
Based on typical market rates for each jurisdiction.
