<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { COUNTRIES, COUNTRY_PRESETS, REGIONS, getCountriesByRegion } from '$lib/data/countries';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { ChevronDown, ChevronUp, X } from '@lucide/svelte';

	let searchQuery = $state('');
	let isExpanded = $state(false);
	let activePreset = $state<string | null>(null);

	// Filtered countries based on search
	const filteredCountries = $derived(
		searchQuery.trim()
			? COUNTRIES.filter(
					(c) =>
						c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						c.code.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: COUNTRIES
	);

	// Check if a preset matches current selection
	function checkActivePreset() {
		for (const preset of COUNTRY_PRESETS) {
			if (
				preset.countries.length === calculatorStore.input.countries.length &&
				preset.countries.every((c) => calculatorStore.input.countries.includes(c))
			) {
				return preset.id;
			}
		}
		return null;
	}

	$effect(() => {
		activePreset = checkActivePreset();
	});

	function selectPreset(presetId: string) {
		const preset = COUNTRY_PRESETS.find((p) => p.id === presetId);
		if (preset) {
			calculatorStore.setCountries([...preset.countries]);
		}
	}

	function toggleCountry(code: string) {
		if (calculatorStore.input.countries.includes(code)) {
			calculatorStore.removeCountry(code);
		} else {
			calculatorStore.addCountry(code);
		}
	}

	function clearAll() {
		calculatorStore.setCountries([]);
	}
</script>

<Collapsible.Root bind:open={isExpanded} class="rounded-lg border border-white/10 bg-white/5">
	<Collapsible.Trigger
		class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
	>
		<div class="flex items-center gap-2">
			<span class="font-medium text-white">Target Countries</span>
			{#if calculatorStore.input.countries.length > 0}
				<Badge variant="secondary" class="bg-green-500/20 text-green-400">
					{calculatorStore.input.countries.length} selected
				</Badge>
			{/if}
		</div>
		{#if isExpanded}
			<ChevronUp class="h-4 w-4 text-slate-400" />
		{:else}
			<ChevronDown class="h-4 w-4 text-slate-400" />
		{/if}
	</Collapsible.Trigger>

	<Collapsible.Content class="px-4 pb-4">
		<!-- Preset Bundles -->
		<div class="mb-4 flex flex-wrap gap-2">
			{#each COUNTRY_PRESETS as preset}
				<Button
					variant={activePreset === preset.id ? 'default' : 'outline'}
					size="sm"
					class={activePreset === preset.id
						? 'bg-green-500 text-slate-900 hover:bg-green-400'
						: 'border-white/20 text-slate-300 hover:bg-white/10'}
					onclick={() => selectPreset(preset.id)}
				>
					{preset.name}
				</Button>
			{/each}
		</div>

		<!-- Selected Countries Tags -->
		{#if calculatorStore.input.countries.length > 0}
			<div class="mb-4 flex flex-wrap gap-2">
				{#each calculatorStore.input.countries as code}
					{@const country = COUNTRIES.find((c) => c.code === code)}
					{#if country}
						<Badge
							variant="secondary"
							class="flex items-center gap-1 bg-slate-700 pr-1 text-slate-200"
						>
							<span>{country.flag}</span>
							<span>{country.name}</span>
							<button
								onclick={() => calculatorStore.removeCountry(code)}
								class="ml-1 rounded p-0.5 hover:bg-slate-600"
							>
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}
				{/each}
				<Button variant="ghost" size="sm" class="h-6 text-xs text-slate-400" onclick={clearAll}>
					Clear all
				</Button>
			</div>
		{/if}

		<!-- Search Input -->
		<Input
			type="text"
			placeholder="Search countries..."
			bind:value={searchQuery}
			class="mb-4 border-white/20 bg-white/5 text-white placeholder:text-slate-500"
		/>

		<!-- Country List by Region -->
		<div class="max-h-64 space-y-4 overflow-y-auto">
			{#each REGIONS as region}
				{@const regionCountries = getCountriesByRegion(region).filter((c) =>
					filteredCountries.includes(c)
				)}
				{#if regionCountries.length > 0}
					<div>
						<h4 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
							{region}
						</h4>
						<div class="space-y-1">
							{#each regionCountries as country}
								<label
									class="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 hover:bg-white/5"
								>
									<Checkbox
										checked={calculatorStore.input.countries.includes(country.code)}
										onCheckedChange={() => toggleCountry(country.code)}
										class="border-white/30 data-[state=checked]:bg-green-500 data-[state=checked]:text-slate-900"
									/>
									<span class="text-lg">{country.flag}</span>
									<span class="text-sm text-slate-300">{country.name}</span>
								</label>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</Collapsible.Content>
</Collapsible.Root>
