<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { currencyStore } from '$lib/stores/currency.svelte';

	// Format currency using the store
	function formatCurrency(amount: number): string {
		return currencyStore.format(amount);
	}

	const selectedCount = $derived(calculatorStore.input.countries.length);
	const result = $derived(calculatorStore.calculationResult);
</script>

{#if selectedCount === 0}
	<div class="flex flex-col items-center justify-center py-16 text-center">
		<div class="mb-4 text-6xl opacity-20">🌍</div>
		<p class="text-lg text-slate-400">Select countries to see cost breakdown</p>
		<p class="mt-2 text-sm text-slate-500">
			Use the preset bundles or search for specific countries
		</p>
	</div>
{:else if !result}
	<div class="flex flex-col items-center justify-center py-16 text-center">
		<div class="mb-4 text-6xl opacity-20">📊</div>
		<p class="text-lg text-slate-400">Click "Calculate Costs" to see breakdown</p>
		<p class="mt-2 text-sm text-slate-500">
			{selectedCount} {selectedCount === 1 ? 'country' : 'countries'} selected
		</p>
	</div>
{:else}
	<div class="overflow-x-auto">
		<Table.Root>
			<Table.Header>
				<Table.Row class="border-white/10 hover:bg-transparent">
					<Table.Head class="text-slate-400">Country</Table.Head>
					<Table.Head class="text-right text-slate-400">Official</Table.Head>
					<Table.Head class="hidden text-right text-slate-400 md:table-cell">Foreign Atty</Table.Head>
					<Table.Head class="text-right text-slate-400">Attorney</Table.Head>
					<Table.Head class="hidden text-right text-slate-400 md:table-cell">Flat Fee</Table.Head>
					<Table.Head class="hidden text-right text-slate-400 lg:table-cell">Translation</Table.Head>
					<Table.Head class="hidden text-right text-slate-400 lg:table-cell">
						Maint.({result.maintenancePeriod}y)
					</Table.Head>
					<Table.Head class="text-right text-green-400">Total</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each result.countryResults as country}
					<Table.Row class="border-white/10 hover:bg-white/5">
						<Table.Cell>
							<div class="flex items-center gap-2">
								<span class="text-lg">{country.flag}</span>
								<span class="text-slate-200">{country.name}</span>
							</div>
						</Table.Cell>
						<Table.Cell class="text-right text-slate-300">
							{formatCurrency(country.officialFees)}
						</Table.Cell>
						<Table.Cell class="hidden text-right text-slate-300 md:table-cell">
							{formatCurrency(country.foreignAttorneyFee)}
						</Table.Cell>
						<Table.Cell class="text-right text-slate-300">
							{formatCurrency(country.attorneyFee)}
						</Table.Cell>
						<Table.Cell class="hidden text-right text-slate-300 md:table-cell">
							{formatCurrency(country.flatFee)}
						</Table.Cell>
						<Table.Cell class="hidden text-right text-slate-300 lg:table-cell">
							{country.translationCosts > 0 ? formatCurrency(country.translationCosts) : '-'}
						</Table.Cell>
						<Table.Cell class="hidden text-right text-slate-300 lg:table-cell">
							{formatCurrency(country.maintenanceFees)}
						</Table.Cell>
						<Table.Cell class="text-right font-semibold text-green-400">
							{formatCurrency(country.total)}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Mobile summary -->
	<p class="mt-4 text-center text-xs text-slate-600 md:hidden">
		Swipe to see all columns or view on larger screen
	</p>
{/if}
