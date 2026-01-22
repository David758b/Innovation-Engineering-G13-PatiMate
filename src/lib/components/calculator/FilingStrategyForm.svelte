<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { strategyStudioStore } from '$lib/stores/strategy-studio.svelte';
	import { ChevronDown, ChevronUp, Sparkles, Plus, Trash2 } from '@lucide/svelte';

	interface Props {
		onOpenStudio?: () => void;
	}

	let { onOpenStudio }: Props = $props();

	let isExpanded = $state(false);

	const FILING_STRATEGIES: { value: 'dk-pct'; label: string; description: string }[] = [
		{
			value: 'dk-pct',
			label: 'Danish Priority + PCT',
			description: 'File in Denmark first, then PCT for international protection'
		}
	];

	// Derived list of custom strategies
	const customStrategies = $derived(strategyStudioStore.customStrategies);

	// Track selection before click to enable toggle-off behavior
	let selectionBeforeClick: string | null = null;

	function handleStrategyChange(value: string) {
		calculatorStore.setFilingStrategy(value);
	}

	function handleMouseDown(value: string) {
		// Capture what was selected before the RadioGroup processes the click
		selectionBeforeClick = calculatorStore.input.filingStrategy;
	}

	function handleStrategyClick(value: string) {
		// Only toggle off if this item was already selected BEFORE the click
		if (selectionBeforeClick === value) {
			calculatorStore.setFilingStrategy(null);
		}
		selectionBeforeClick = null;
	}

	function handleDeleteStrategy(e: Event, strategyId: string) {
		e.stopPropagation();
		// If this strategy is currently selected, deselect it first
		if (calculatorStore.input.filingStrategy === `custom-${strategyId}`) {
			calculatorStore.setFilingStrategy(null);
		}
		strategyStudioStore.deleteStrategy(strategyId);
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
					value={calculatorStore.input.filingStrategy ?? undefined}
					onValueChange={handleStrategyChange}
					class="flex flex-col gap-3"
				>
					{#each FILING_STRATEGIES as strategy}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 p-3 hover:bg-white/5"
							onmousedown={() => handleMouseDown(strategy.value)}
							onclick={() => handleStrategyClick(strategy.value)}
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
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="mb-2 flex cursor-pointer items-start gap-2 rounded-lg border border-purple-500/30 bg-purple-500/5 p-3 hover:bg-purple-500/10"
									onmousedown={() => handleMouseDown(`custom-${customStrategy.id}`)}
									onclick={() => handleStrategyClick(`custom-${customStrategy.id}`)}
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
									<button
										type="button"
										onclick={(e) => handleDeleteStrategy(e, customStrategy.id)}
										class="rounded p-1 text-slate-500 hover:bg-red-500/20 hover:text-red-400"
										title="Delete strategy"
									>
										<Trash2 class="h-4 w-4" />
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</RadioGroup.Root>
			</div>
		</div>

		<!-- Create Custom Strategy Button -->
		{#if onOpenStudio}
			<Button
				variant="outline"
				size="sm"
				onclick={onOpenStudio}
				class="w-full border-dashed border-purple-500/50 text-purple-400 hover:border-purple-500 hover:bg-purple-500/10"
			>
				<Plus class="h-4 w-4" />
			</Button>
		{/if}
	</Collapsible.Content>
</Collapsible.Root>
