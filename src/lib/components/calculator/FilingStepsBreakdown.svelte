<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { currencyStore } from '$lib/stores/currency.svelte';

	function formatCurrency(amount: number): string {
		return currencyStore.format(amount);
	}

	const result = $derived(calculatorStore.calculationResult);
</script>

{#if result && result.filingStepResults.length > 0}
	<div class="overflow-x-auto">
		<Table.Root>
			<Table.Header>
				<Table.Row class="border-white/10 hover:bg-transparent">
					<Table.Head class="text-slate-400">Filing Step</Table.Head>
					<Table.Head class="text-right text-slate-400">Cost</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each result.filingStepResults as step}
					<Table.Row class="border-white/10 hover:bg-white/5">
						<Table.Cell>
							<span class="text-slate-200">{step.label}</span>
						</Table.Cell>
						<Table.Cell class="text-right text-slate-300">
							{step.cost > 0 ? formatCurrency(step.cost) : '-'}
						</Table.Cell>
					</Table.Row>
				{/each}
				<!-- Subtotal row -->
				<Table.Row class="border-white/10 border-t-2 bg-white/5">
					<Table.Cell>
						<span class="font-semibold text-slate-200">Filing Steps Subtotal</span>
					</Table.Cell>
					<Table.Cell class="text-right font-semibold text-green-400">
						{formatCurrency(result.filingStepsTotal)}
					</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</div>
{:else if result}
	<div class="py-4 text-center text-slate-500">
		<p class="text-sm">No filing steps in current strategy</p>
	</div>
{/if}
