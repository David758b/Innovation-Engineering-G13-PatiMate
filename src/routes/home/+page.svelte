<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import CostBreakdownTable from '$lib/components/calculator/CostBreakdownTable.svelte';
	import CostSummaryCard from '$lib/components/calculator/CostSummaryCard.svelte';
	import CountrySelector from '$lib/components/calculator/CountrySelector.svelte';
	import FilingStepsBreakdown from '$lib/components/calculator/FilingStepsBreakdown.svelte';
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

	// Track last synced state to avoid infinite loops
	let lastSyncedFromStrategy = $state<string[]>([]);
	let lastSyncedFromCalculator = $state<string[]>([]);
	let isSyncing = $state(false);

	function handleCalculate() {
		calculatorStore.calculate();
	}

	function handleOpenStudio() {
		// Just open the studio - preserve existing canvas state
		showStrategyStudio = true;
	}

	function handleCreateNewStrategy() {
		// Prevent sync effects from running during this transition
		isSyncing = true;
		// Clear the filing strategy selection when creating a new custom strategy
		calculatorStore.setFilingStrategy(null);
		// Clear the canvas to start fresh
		strategyStudioStore.clearCanvas();
		// Set zoom to 100% for new strategies
		strategyStudioStore.setCanvasZoom(1);
		// Reset tracking state so templates can be reloaded later
		lastLoadedStrategy = null;
		// Reset sync tracking to avoid false diffs when returning
		lastSyncedFromStrategy = [];
		lastSyncedFromCalculator = [...calculatorStore.input.countries];
		showStrategyStudio = true;
		// Re-enable sync after state is settled
		isSyncing = false;
	}

	function handleCloseStudio() {
		// Update sync tracking to current state to prevent false diffs on return
		const currentStrategyCountries = strategyStudioStore.getCountriesFromBlocks();
		const currentCalcCountries = calculatorStore.input.countries;
		lastSyncedFromStrategy = [...currentStrategyCountries];
		lastSyncedFromCalculator = [...currentCalcCountries];
		showStrategyStudio = false;
	}

	const hasCalculationResult = $derived(calculatorStore.calculationResult !== null);
	const filingStrategy = $derived(calculatorStore.input.filingStrategy);
	const hasStrategySelected = $derived(filingStrategy !== null);
	const hasBlocks = $derived(strategyStudioStore.blocks.length > 0);

	// Derive countries from strategy blocks
	const strategyCountries = $derived(strategyStudioStore.getCountriesFromBlocks());
	const calculatorCountries = $derived(calculatorStore.input.countries);

	// Enable calculate button when strategy is selected (countries come from strategy)
	const canCalculate = $derived(hasStrategySelected && strategyCountries.length > 0);

	// Load the appropriate strategy into the canvas when filing strategy changes
	$effect(() => {
		// Don't run while Strategy Studio is open
		if (showStrategyStudio) return;

		const strategy = filingStrategy;
		if (strategy !== null && strategy !== lastLoadedStrategy) {
			// Remember user's current country selection before loading template
			const userCountries = [...calculatorStore.input.countries];

			if (strategy === 'dk-pct') {
				strategyStudioStore.loadTemplate('dk-pct');
			} else if (strategy.startsWith('custom-')) {
				const customId = strategy.replace('custom-', '');
				strategyStudioStore.loadStrategy(customId);
			}
			lastLoadedStrategy = strategy;

			// After loading template, sync user's countries TO the strategy
			// This adds country entry blocks for any countries the user already selected
			if (userCountries.length > 0) {
				strategyStudioStore.syncCountries(userCountries);
				lastSyncedFromStrategy = [...userCountries];
				lastSyncedFromCalculator = [...userCountries];
			} else {
				// No user countries - sync from strategy to calculator (for templates with preset countries)
				const strategyCountriesFromBlocks = strategyStudioStore.getCountriesFromBlocks();
				calculatorStore.setCountries(strategyCountriesFromBlocks);
				lastSyncedFromStrategy = [...strategyCountriesFromBlocks];
				lastSyncedFromCalculator = [...strategyCountriesFromBlocks];
			}
		}
	});

	// Sync: Strategy blocks → Calculator countries
	$effect(() => {
		if (showStrategyStudio || isSyncing || !hasStrategySelected) return;

		const currentStrategyCountries = strategyCountries;
		const prevStrategyCountries = lastSyncedFromStrategy;

		// Check if strategy countries changed
		const strategyChanged =
			currentStrategyCountries.length !== prevStrategyCountries.length ||
			!currentStrategyCountries.every((c) => prevStrategyCountries.includes(c));

		if (strategyChanged) {
			isSyncing = true;
			calculatorStore.setCountries([...currentStrategyCountries]);
			lastSyncedFromStrategy = [...currentStrategyCountries];
			lastSyncedFromCalculator = [...currentStrategyCountries];
			isSyncing = false;
		}
	});

	// Sync: Calculator countries → Strategy blocks
	$effect(() => {
		if (showStrategyStudio || isSyncing || !hasStrategySelected) return;

		const currentCalcCountries = calculatorCountries;
		const prevCalcCountries = lastSyncedFromCalculator;

		// Check if calculator countries changed
		const calcChanged =
			currentCalcCountries.length !== prevCalcCountries.length ||
			!currentCalcCountries.every((c) => prevCalcCountries.includes(c));

		if (calcChanged) {
			isSyncing = true;
			strategyStudioStore.syncCountries([...currentCalcCountries]);
			lastSyncedFromCalculator = [...currentCalcCountries];
			lastSyncedFromStrategy = [...currentCalcCountries];
			isSyncing = false;
		}
	});
</script>

{#if showStrategyStudio}
	<StrategyStudio onBack={handleCloseStudio} />
{:else}
	<div class="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
		<!-- Header -->
		<header class="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 lg:px-8">
			<a href="/">
				<Logo size="sm" />
			</a>
			<div class="flex items-center gap-2">
				<SettingsModal />
			</div>
		</header>

		<!-- Main Content -->
		<main class="flex flex-1 flex-col overflow-hidden lg:flex-row">
			<!-- Input Panel (Left) -->
			<aside class="w-full border-b border-white/10 lg:w-[35%] lg:border-r lg:border-b-0">
				<ScrollArea class="h-full" orientation="vertical">
					<div class="space-y-4 p-4 lg:p-6">
						<h1 class="text-xl font-bold text-white lg:text-2xl">Patent Cost Calculator</h1>
						<p class="text-sm text-slate-400">Estimate patent filing costs across multiple countries</p>

						<div class="space-y-4 pt-2">
							<CountrySelector />
							<PatentDetailsForm />
							<FilingStrategyForm onOpenStudio={handleCreateNewStrategy} />
						</div>

						<!-- Calculate Button -->
						<div class="pt-4">
							<Button
								size="lg"
								disabled={!canCalculate}
								onclick={handleCalculate}
								class="w-full bg-green-500 py-6 text-lg font-semibold text-slate-900 shadow-lg shadow-green-500/25 transition-all hover:bg-green-400 hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Calculate Costs
							</Button>
						</div>
					</div>
				</ScrollArea>
			</aside>

			<!-- Results Panel (Right) -->
			<section class="flex-1 overflow-hidden">
				{#if hasCalculationResult}
					<!-- Show cost results after calculation -->
					<ScrollArea class="h-full" orientation="vertical">
						<div class="p-4 lg:p-6">
							<div class="mb-6">
								<CostSummaryCard />
							</div>

							<!-- Filing Steps Breakdown -->
							<div class="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
								<h2 class="mb-4 text-lg font-semibold text-white">Filing Steps</h2>
								<FilingStepsBreakdown />
							</div>

							<!-- National Phase Breakdown -->
							<div class="rounded-lg border border-white/10 bg-white/5 p-4">
								<h2 class="mb-4 text-lg font-semibold text-white">National Phase Entries</h2>
								<CostBreakdownTable />
							</div>
						</div>
					</ScrollArea>
				{:else if hasStrategySelected}
					<!-- Show strategy canvas preview when a strategy is selected -->
					<div class="m-4 flex h-[calc(100%-2rem)] flex-col overflow-hidden rounded-lg border border-white/10 lg:m-6 lg:h-[calc(100%-3rem)]">
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
				{:else}
					<!-- No strategy selected - centered globe watermark -->
					<div class="relative m-4 flex h-[calc(100%-2rem)] items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-slate-950/50 lg:m-6 lg:h-[calc(100%-3rem)]">
						<!-- Globe watermark -->
						<svg class="h-64 w-64 opacity-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle class="globe-ring-outer" cx="32" cy="32" r="28" stroke="url(#watermark-gradient)" stroke-width="3" />
							<ellipse class="globe-ring-equator" cx="32" cy="32" rx="28" ry="10" stroke="url(#watermark-gradient)" stroke-width="2" />
							<ellipse class="globe-ring-meridian" cx="32" cy="32" rx="10" ry="28" stroke="url(#watermark-gradient)" stroke-width="2" />
							<circle class="globe-center-dot" cx="32" cy="32" r="4" fill="#22c55e" />
							<defs>
								<linearGradient id="watermark-gradient" x1="0" y1="0" x2="64" y2="64">
									<stop offset="0%" stop-color="#22c55e" />
									<stop offset="100%" stop-color="#16a34a" />
								</linearGradient>
							</defs>
						</svg>
					</div>
				{/if}
			</section>
		</main>
	</div>
{/if}

<style>
	.globe-ring-outer {
		transform-origin: center;
		animation: spin-z 12s linear infinite;
	}
	.globe-ring-equator {
		transform-origin: center;
		animation: spin-x 10s linear infinite;
	}
	.globe-ring-meridian {
		transform-origin: center;
		animation: spin-y 8s linear infinite;
	}
	.globe-center-dot {
		animation: pulse 2s ease-in-out infinite;
	}
	@keyframes spin-z {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
	@keyframes spin-x {
		from { transform: rotateX(0deg); }
		to { transform: rotateX(360deg); }
	}
	@keyframes spin-y {
		from { transform: rotateY(0deg); }
		to { transform: rotateY(360deg); }
	}
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}
</style>
