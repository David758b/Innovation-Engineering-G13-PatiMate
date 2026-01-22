<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { currencyStore } from '$lib/stores/currency.svelte';

	// Format currency using the store
	function formatCurrency(amount: number): string {
		return currencyStore.format(amount);
	}

	const result = $derived(calculatorStore.calculationResult);
</script>

{#if !result}
	<div class="flex flex-col items-center justify-center py-8 text-center">
		<p class="text-sm text-slate-500">No calculation results yet</p>
	</div>
{:else if result.countryResults.length === 0}
	<div class="flex flex-col items-center justify-center py-8 text-center">
		<p class="text-sm text-slate-500">No national phase entries in current strategy</p>
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
				<!-- Subtotal row -->
				<Table.Row class="border-white/10 border-t-2 bg-white/5">
					<Table.Cell>
						<span class="font-semibold text-slate-200">National Phase Subtotal</span>
					</Table.Cell>
					<Table.Cell class="text-right font-semibold text-slate-300">
						{formatCurrency(result.totalOfficialFees)}
					</Table.Cell>
					<Table.Cell class="hidden text-right font-semibold text-slate-300 md:table-cell">
						{formatCurrency(result.totalForeignAttorneyFees)}
					</Table.Cell>
					<Table.Cell class="text-right font-semibold text-slate-300">
						{formatCurrency(result.totalAttorneyFees)}
					</Table.Cell>
					<Table.Cell class="hidden text-right font-semibold text-slate-300 md:table-cell">
						{formatCurrency(result.totalFlatFees)}
					</Table.Cell>
					<Table.Cell class="hidden text-right font-semibold text-slate-300 lg:table-cell">
						{result.totalTranslationCosts > 0 ? formatCurrency(result.totalTranslationCosts) : '-'}
					</Table.Cell>
					<Table.Cell class="hidden text-right font-semibold text-slate-300 lg:table-cell">
						{formatCurrency(result.totalMaintenanceFees)}
					</Table.Cell>
					<Table.Cell class="text-right font-bold text-green-400">
						{formatCurrency(result.nationalPhaseTotal)}
					</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Mobile summary -->
	<p class="mt-4 text-center text-xs text-slate-600 md:hidden">
		Swipe to see all columns or view on larger screen
	</p>
{/if}
