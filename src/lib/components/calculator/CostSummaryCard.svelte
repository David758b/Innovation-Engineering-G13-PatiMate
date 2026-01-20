<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { calculatorStore } from '$lib/stores/calculator.svelte';

	const selectedCount = $derived(calculatorStore.input.countries.length);
	const result = $derived(calculatorStore.calculationResult);

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}
</script>

<Card.Root class="border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
	<Card.Content class="p-6">
		<!-- Empty State -->
		{#if selectedCount === 0}
			<div class="py-8 text-center">
				<p class="text-lg text-slate-400">Select countries to see cost estimates</p>
			</div>
		{:else if !result}
			<!-- Countries selected but not calculated yet -->
			<div class="py-8 text-center">
				<p class="text-lg text-slate-400">
					{selectedCount} {selectedCount === 1 ? 'country' : 'countries'} selected
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
					{result.countryCount}
					{result.countryCount === 1 ? 'country' : 'countries'} &middot;
					{result.maintenancePeriod} year maintenance
				</p>
			</div>

			<!-- Cost Breakdown -->
			<div class="grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-3 lg:grid-cols-6">
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Official</p>
					<p class="mt-1 text-lg font-semibold text-slate-300">
						{formatCurrency(result.totalOfficialFees)}
					</p>
				</div>
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Foreign Atty</p>
					<p class="mt-1 text-lg font-semibold text-slate-300">
						{formatCurrency(result.totalForeignAttorneyFees)}
					</p>
				</div>
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Attorney</p>
					<p class="mt-1 text-lg font-semibold text-slate-300">
						{formatCurrency(result.totalAttorneyFees)}
					</p>
				</div>
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Flat Fee</p>
					<p class="mt-1 text-lg font-semibold text-slate-300">
						{formatCurrency(result.totalFlatFees)}
					</p>
				</div>
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Translation</p>
					<p class="mt-1 text-lg font-semibold text-slate-300">
						{result.totalTranslationCosts > 0 ? formatCurrency(result.totalTranslationCosts) : '-'}
					</p>
				</div>
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">
						Maint.({result.maintenancePeriod}y)
					</p>
					<p class="mt-1 text-lg font-semibold text-slate-300">
						{formatCurrency(result.totalMaintenanceFees)}
					</p>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
