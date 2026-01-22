<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Flag } from '$lib/components/ui/flag';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { currencyStore, SUPPORTED_CURRENCIES } from '$lib/stores/currency.svelte';
	import { strategyStudioStore } from '$lib/stores/strategy-studio.svelte';
	import { exportToPDF } from '$lib/utils/pdf-export';
	import { Download, RefreshCw } from '@lucide/svelte';
	import { onMount } from 'svelte';

	const result = $derived(calculatorStore.calculationResult);
	const hasStrategy = $derived(calculatorStore.input.filingStrategy !== null);
	const strategyCountries = $derived(strategyStudioStore.getCountriesFromBlocks());

	// Fetch exchange rates on mount
	onMount(() => {
		currencyStore.fetchRates();
	});

	function handleExportPDF() {
		if (result) {
			exportToPDF(result, calculatorStore.input);
		}
	}

	function handleCurrencyChange(value: string | undefined) {
		if (value) {
			currencyStore.setSelectedCurrency(value);
		}
	}

	// Format currency using the store
	function formatCurrency(amount: number): string {
		return currencyStore.format(amount);
	}
</script>

<Card.Root class="border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
	<Card.Content class="p-6">
		<!-- Currency Selector - Always visible -->
		<div class="mb-4 flex items-center justify-end gap-2">
			<Select.Root
				type="single"
				value={currencyStore.selectedCurrency}
				onValueChange={handleCurrencyChange}
			>
				<Select.Trigger
					class="h-8 w-[140px] border-white/10 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
					size="sm"
				>
					<span class="flex items-center gap-2">
						<Flag code={currencyStore.selectedCurrencyInfo.countryCode} size="sm" />
						<span>{currencyStore.selectedCurrency}</span>
					</span>
				</Select.Trigger>
				<Select.Content class="border-white/10 bg-slate-800">
					{#each SUPPORTED_CURRENCIES as currency}
						<Select.Item
							value={currency.code}
							label={currency.name}
							class="text-slate-300 hover:bg-slate-700 focus:bg-slate-700"
						>
							<span class="flex items-center gap-2">
								<Flag code={currency.countryCode} size="sm" />
								<span>{currency.code}</span>
								<span class="text-slate-500">- {currency.name}</span>
							</span>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if currencyStore.isLoading}
				<RefreshCw class="h-4 w-4 animate-spin text-slate-500" />
			{/if}
		</div>

		<!-- Empty State -->
		{#if !hasStrategy}
			<div class="py-8 text-center">
				<p class="text-lg text-slate-400">Select a filing strategy to see cost estimates</p>
			</div>
		{:else if strategyCountries.length === 0}
			<div class="py-8 text-center">
				<p class="text-lg text-slate-400">Add target countries to your strategy</p>
				<p class="mt-2 text-sm text-slate-500">
					Use the country selector or add entry blocks in Strategy Studio
				</p>
			</div>
		{:else if !result}
			<!-- Strategy selected but not calculated yet -->
			<div class="py-8 text-center">
				<p class="text-lg text-slate-400">
					{strategyCountries.length} {strategyCountries.length === 1 ? 'country' : 'countries'} in strategy
				</p>
				<p class="mt-2 text-sm text-slate-500">
					Click "Calculate Costs" to see the breakdown
				</p>
			</div>
		{:else}
			<!-- Calculated Results -->
			<div class="mb-6 text-center">
				<p class="text-sm font-medium tracking-wider text-slate-400 uppercase">
					Total Estimated Cost
				</p>
				<p class="mt-2 text-4xl font-bold text-green-400 lg:text-5xl">
					{formatCurrency(result.totalCost)}
				</p>
				<p class="mt-1 text-sm text-slate-500">
					{result.filingStepResults.length} filing steps &middot;
					{result.countryCount} {result.countryCount === 1 ? 'country' : 'countries'} &middot;
					{result.maintenancePeriod}y maintenance
				</p>
				<Button
					variant="outline"
					size="sm"
					onclick={handleExportPDF}
					class="mt-3 border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300"
				>
					<Download class="mr-2 h-4 w-4" />
					Export PDF
				</Button>
			</div>

			<!-- Cost Breakdown: Filing Steps + National Phase -->
			<div class="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
				<div class="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Filing Steps</p>
					<p class="mt-2 text-2xl font-bold text-slate-200">
						{formatCurrency(result.filingStepsTotal)}
					</p>
					<p class="mt-1 text-xs text-slate-500">
						{result.filingStepResults.length} steps
					</p>
				</div>
				<div class="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">National Phase</p>
					<p class="mt-2 text-2xl font-bold text-slate-200">
						{formatCurrency(result.nationalPhaseTotal)}
					</p>
					<p class="mt-1 text-xs text-slate-500">
						{result.countryCount} {result.countryCount === 1 ? 'country' : 'countries'}
					</p>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
