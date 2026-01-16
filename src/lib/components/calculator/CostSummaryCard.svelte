<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { calculatorStore } from '$lib/stores/calculator.svelte';

	const selectedCount = $derived(calculatorStore.input.countries.length);
</script>

<Card.Root class="border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
	<Card.Content class="p-6">
		<!-- Empty State -->
		{#if selectedCount === 0}
			<div class="py-8 text-center">
				<p class="text-lg text-slate-400">Select countries to see cost estimates</p>
			</div>
		{:else}
			<!-- Placeholder Summary (no calculations yet) -->
			<div class="mb-6 text-center">
				<p class="text-sm font-medium tracking-wider text-slate-400 uppercase">
					Total Estimated Cost
				</p>
				<p class="mt-2 text-4xl font-bold text-slate-500 lg:text-5xl">--</p>
				<p class="mt-1 text-sm text-slate-500">
					{selectedCount}
					{selectedCount === 1 ? 'country' : 'countries'} selected
				</p>
			</div>

			<!-- Cost Breakdown Placeholders -->
			<div class="grid grid-cols-2 gap-3 border-t border-white/10 pt-4 lg:grid-cols-4">
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Official Fees</p>
					<p class="mt-1 text-lg font-semibold text-slate-500">--</p>
				</div>
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Attorney</p>
					<p class="mt-1 text-lg font-semibold text-slate-500">--</p>
				</div>
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Translation</p>
					<p class="mt-1 text-lg font-semibold text-slate-500">--</p>
				</div>
				<div class="text-center">
					<p class="text-xs font-medium tracking-wider text-slate-500 uppercase">Maintenance</p>
					<p class="mt-1 text-lg font-semibold text-slate-500">--</p>
				</div>
			</div>

			<p class="mt-4 text-center text-xs text-slate-600">Calculation logic not yet implemented</p>
		{/if}
	</Card.Content>
</Card.Root>
