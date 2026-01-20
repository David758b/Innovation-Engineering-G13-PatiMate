<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import CostBreakdownTable from '$lib/components/calculator/CostBreakdownTable.svelte';
	import CostSummaryCard from '$lib/components/calculator/CostSummaryCard.svelte';
	import CountrySelector from '$lib/components/calculator/CountrySelector.svelte';
	import FilingStrategyForm from '$lib/components/calculator/FilingStrategyForm.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import PatentDetailsForm from '$lib/components/calculator/PatentDetailsForm.svelte';
	import SettingsModal from '$lib/components/calculator/SettingsModal.svelte';
	import StrategyStudio from '$lib/components/studio/StrategyStudio.svelte';
	import StudioCanvas from '$lib/components/studio/StudioCanvas.svelte';
	import StudioMiniMap from '$lib/components/studio/StudioMiniMap.svelte';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { strategyStudioStore } from '$lib/stores/strategy-studio.svelte';

	let showStrategyStudio = $state(false);
	let lastLoadedStrategy = $state<string | null>(null);

	function handleCalculate() {
		calculatorStore.calculate();
	}

	function handleOpenStudio() {
		showStrategyStudio = true;
	}

	function handleCloseStudio() {
		showStrategyStudio = false;
	}

	const hasCountries = $derived(calculatorStore.input.countries.length > 0);
	const hasCalculationResult = $derived(calculatorStore.calculationResult !== null);
	const filingStrategy = $derived(calculatorStore.input.filingStrategy);
	const hasBlocks = $derived(strategyStudioStore.blocks.length > 0);

	// Load the appropriate strategy into the canvas when filing strategy changes
	$effect(() => {
		const strategy = filingStrategy;
		if (strategy !== lastLoadedStrategy) {
			if (strategy === 'direct') {
				strategyStudioStore.loadTemplate('direct');
			} else if (strategy === 'pct') {
				strategyStudioStore.loadTemplate('pct');
			} else if (strategy.startsWith('custom-')) {
				const customId = strategy.replace('custom-', '');
				strategyStudioStore.loadStrategy(customId);
			}
			lastLoadedStrategy = strategy;
		}
	});
</script>

{#if showStrategyStudio}
	<StrategyStudio onBack={handleCloseStudio} />
{:else}
	<div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
		<!-- Header -->
		<header class="flex items-center justify-between border-b border-white/10 px-4 py-4 lg:px-8">
			<a href="/">
				<Logo size="sm" />
			</a>
			<SettingsModal />
		</header>

		<!-- Main Content -->
		<main class="flex flex-col lg:flex-row">
			<!-- Input Panel (Left) -->
			<aside
				class="w-full space-y-4 border-b border-white/10 p-4 lg:w-[35%] lg:border-r lg:border-b-0 lg:p-6"
			>
				<h1 class="text-xl font-bold text-white lg:text-2xl">Patent Cost Calculator</h1>
				<p class="text-sm text-slate-400">Estimate patent filing costs across multiple countries</p>

				<div class="space-y-4 pt-2">
					<CountrySelector />
					<PatentDetailsForm />
					<FilingStrategyForm />
				</div>

				<!-- Calculate Button -->
				<div class="pt-4">
					<Button
						size="lg"
						disabled={!hasCountries}
						onclick={handleCalculate}
						class="w-full bg-green-500 py-6 text-lg font-semibold text-slate-900 shadow-lg shadow-green-500/25 transition-all hover:bg-green-400 hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Calculate Costs
					</Button>
				</div>
			</aside>

			<!-- Results Panel (Right) -->
			<section class="flex-1 p-4 lg:p-6">
				{#if hasCalculationResult}
					<!-- Show cost results after calculation -->
					<div class="mb-6">
						<CostSummaryCard />
					</div>

					<div class="rounded-lg border border-white/10 bg-white/5 p-4">
						<h2 class="mb-4 text-lg font-semibold text-white">Cost Breakdown by Country</h2>
						<CostBreakdownTable />
					</div>
				{:else}
					<!-- Show strategy canvas preview -->
					<div class="flex h-[calc(100vh-120px)] flex-col overflow-hidden rounded-lg border border-white/10">
						<!-- Header -->
						<div class="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
							<h2 class="text-lg font-semibold text-white">Filing Strategy Overview</h2>
							<Button
								size="sm"
								variant="outline"
								onclick={handleOpenStudio}
								class="border-white/20 text-slate-300 hover:bg-white/10"
							>
								Open Strategy Studio
							</Button>
						</div>
						<!-- Canvas (readonly preview mode) -->
						<div class="relative flex-1">
							<StudioCanvas draggedTemplate={null} onDragEnd={() => {}} readonly={true} />
							{#if hasBlocks}
								<StudioMiniMap />
							{/if}
						</div>
					</div>
				{/if}
			</section>
		</main>
	</div>
{/if}
