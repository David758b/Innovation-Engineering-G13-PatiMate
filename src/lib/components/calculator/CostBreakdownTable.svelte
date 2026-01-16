<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { COUNTRIES } from '$lib/data/countries';
	import { calculatorStore } from '$lib/stores/calculator.svelte';

	// Get country info for selected countries
	const selectedCountries = $derived(
		calculatorStore.input.countries
			.map((code) => COUNTRIES.find((c) => c.code === code))
			.filter((c) => c !== undefined)
	);
</script>

{#if selectedCountries.length === 0}
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
					<Table.Head class="text-slate-400">Country</Table.Head>
					<Table.Head class="text-right text-slate-400">Official</Table.Head>
					<Table.Head class="text-right text-slate-400">Attorney</Table.Head>
					<Table.Head class="hidden text-right text-slate-400 md:table-cell">Translation</Table.Head
					>
					<Table.Head class="hidden text-right text-slate-400 lg:table-cell">Maint.(5y)</Table.Head>
					<Table.Head class="text-right text-green-400">Total</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each selectedCountries as country}
					<Table.Row class="border-white/10 hover:bg-white/5">
						<Table.Cell>
							<div class="flex items-center gap-2">
								<span class="text-lg">{country.flag}</span>
								<span class="text-slate-200">{country.name}</span>
							</div>
						</Table.Cell>
						<Table.Cell class="text-right text-slate-500">--</Table.Cell>
						<Table.Cell class="text-right text-slate-500">--</Table.Cell>
						<Table.Cell class="hidden text-right text-slate-500 md:table-cell">--</Table.Cell>
						<Table.Cell class="hidden text-right text-slate-500 lg:table-cell">--</Table.Cell>
						<Table.Cell class="text-right font-semibold text-slate-500">--</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<p class="mt-4 text-center text-xs text-slate-600">Cost calculations not yet implemented</p>
{/if}
