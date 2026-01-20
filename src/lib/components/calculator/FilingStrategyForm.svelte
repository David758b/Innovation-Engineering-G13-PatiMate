<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { Switch } from '$lib/components/ui/switch';
	import type { FilingStrategy } from '$lib/data/types';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { strategyStudioStore } from '$lib/stores/strategy-studio.svelte';
	import { ChevronDown, ChevronUp, Sparkles } from '@lucide/svelte';

	let isExpanded = $state(false);

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

	// Derived list of custom strategies
	const customStrategies = $derived(strategyStudioStore.customStrategies);

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
			<div class="max-h-64 overflow-y-auto">
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

					<!-- Custom Strategies -->
					{#if customStrategies.length > 0}
						<div class="pt-2">
							<p class="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
								<Sparkles class="h-3 w-3" />
								Custom Strategies
							</p>
							{#each customStrategies as customStrategy}
								<div
									class="mb-2 flex items-start gap-2 rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 hover:bg-purple-500/10"
								>
									<RadioGroup.Item
										value={`custom-${customStrategy.id}`}
										id={`strategy-custom-${customStrategy.id}`}
										class="mt-0.5 border-white/30 text-purple-500 data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-500"
									/>
									<div class="min-w-0 flex-1">
										<Label
											for={`strategy-custom-${customStrategy.id}`}
											class="cursor-pointer text-sm font-medium text-slate-200"
										>
											{customStrategy.name}
										</Label>
										<p class="text-xs text-slate-500">
											{customStrategy.blocks.length} blocks, {customStrategy.connections.length} connections
										</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</RadioGroup.Root>
			</div>
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
