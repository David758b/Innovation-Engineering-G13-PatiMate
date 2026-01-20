<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import { COUNTRIES } from '$lib/data/countries';
	import { DEFAULT_COUNTRY_COSTS, DEFAULT_GLOBAL_SETTINGS } from '$lib/data/default-costs';
	import type { MaintenancePeriod } from '$lib/data/types';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { Settings, RotateCcw, Globe, MapPin } from '@lucide/svelte';

	let open = $state(false);
	let selectedCountryCode = $state('US');
	let mainTab = $state<'global' | 'country'>('global');

	const selectedCountry = $derived(COUNTRIES.find((c) => c.code === selectedCountryCode));
	const defaultCosts = $derived(DEFAULT_COUNTRY_COSTS[selectedCountryCode]);
	const globalSettings = $derived(calculatorStore.userConfig.globalSettings);
	const userOverrides = $derived({
		official: calculatorStore.userConfig.officialFeeOverrides[selectedCountryCode] || {},
		foreignAttorney: calculatorStore.userConfig.foreignAttorneyOverrides[selectedCountryCode],
		translation: calculatorStore.userConfig.translationRateOverrides[selectedCountryCode],
		maintenance: calculatorStore.userConfig.maintenanceOverrides[selectedCountryCode]
	});

	// Global settings handlers
	function handleGlobalAttorneyChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : DEFAULT_GLOBAL_SETTINGS.attorneyFee;
		calculatorStore.setGlobalAttorneyFee(value);
	}

	function handleGlobalFlatFeeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : DEFAULT_GLOBAL_SETTINGS.flatFee;
		calculatorStore.setGlobalFlatFee(value);
	}

	function handleMaintenancePeriodChange(value: string | undefined) {
		if (value) {
			calculatorStore.setMaintenancePeriod(parseInt(value) as MaintenancePeriod);
		}
	}

	// Per-country handlers
	function handleOfficialFeeChange(field: 'filing' | 'search' | 'examination' | 'grant', e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : null;
		calculatorStore.setOfficialFeeOverride(selectedCountryCode, field, value);
	}

	function handleForeignAttorneyChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : null;
		calculatorStore.setForeignAttorneyOverride(selectedCountryCode, value);
	}

	function handleTranslationRateChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : null;
		calculatorStore.setTranslationRateOverride(selectedCountryCode, value);
	}

	function handleMaintenanceChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : null;
		calculatorStore.setMaintenanceOverride(selectedCountryCode, value);
	}

	function resetGlobal() {
		calculatorStore.resetGlobalSettings();
	}

	function resetCountry() {
		calculatorStore.resetCountryOverrides(selectedCountryCode);
	}

	function resetAll() {
		calculatorStore.resetAllOverrides();
	}

	function handleCountryChange(value: string | undefined) {
		if (value) {
			selectedCountryCode = value;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button variant="ghost" size="icon" class="text-slate-400 hover:text-white">
			<Settings class="h-5 w-5" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content
		class="max-h-[85vh] max-w-2xl overflow-y-auto border-white/10 bg-slate-900 text-white"
	>
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Settings class="h-5 w-5" />
				Cost Configuration
			</Dialog.Title>
			<Dialog.Description class="text-slate-400">
				Customize cost estimates with your own rates. Changes are saved automatically.
			</Dialog.Description>
		</Dialog.Header>

		<div class="mt-4">
			<!-- Main tabs: Global vs Per-Country -->
			<Tabs.Root value={mainTab} onValueChange={(v) => (mainTab = v as 'global' | 'country')}>
				<Tabs.List class="grid w-full grid-cols-2 bg-slate-800">
					<Tabs.Trigger value="global" class="flex items-center gap-2 data-[state=active]:bg-slate-700">
						<Globe class="h-4 w-4" />
						Global Settings
					</Tabs.Trigger>
					<Tabs.Trigger value="country" class="flex items-center gap-2 data-[state=active]:bg-slate-700">
						<MapPin class="h-4 w-4" />
						Per-Country
					</Tabs.Trigger>
				</Tabs.List>

				<!-- Global Settings Tab -->
				<Tabs.Content value="global" class="mt-4 space-y-6">
					<p class="text-sm text-slate-400">
						These settings apply to all country filings.
					</p>

					<div class="space-y-4">
						<!-- Attorney Fee (Local) -->
						<div class="space-y-2">
							<Label for="global-attorney" class="text-sm text-slate-400">
								Attorney Fee (Your Local Attorney)
								<span class="ml-1 text-xs text-slate-500">
									(default: ${DEFAULT_GLOBAL_SETTINGS.attorneyFee})
								</span>
							</Label>
							<Input
								id="global-attorney"
								type="number"
								min="0"
								placeholder={String(DEFAULT_GLOBAL_SETTINGS.attorneyFee)}
								value={globalSettings.attorneyFee}
								oninput={handleGlobalAttorneyChange}
								class="border-white/20 bg-white/5 text-white"
							/>
							<p class="text-xs text-slate-500">
								Your home/local attorney's fee for handling patent filings
							</p>
						</div>

						<!-- Flat Fee -->
						<div class="space-y-2">
							<Label for="global-flat-fee" class="text-sm text-slate-400">
								Flat Fee (Service/Processing Fee)
								<span class="ml-1 text-xs text-slate-500">
									(default: ${DEFAULT_GLOBAL_SETTINGS.flatFee})
								</span>
							</Label>
							<Input
								id="global-flat-fee"
								type="number"
								min="0"
								placeholder={String(DEFAULT_GLOBAL_SETTINGS.flatFee)}
								value={globalSettings.flatFee}
								oninput={handleGlobalFlatFeeChange}
								class="border-white/20 bg-white/5 text-white"
							/>
							<p class="text-xs text-slate-500">
								Fixed service fee applied to each filing
							</p>
						</div>

						<!-- Maintenance Period -->
						<div class="space-y-2">
							<Label class="text-sm text-slate-400">
								Maintenance Period
								<span class="ml-1 text-xs text-slate-500">
									(default: {DEFAULT_GLOBAL_SETTINGS.maintenancePeriod} years)
								</span>
							</Label>
							<Select.Root
								type="single"
								value={String(globalSettings.maintenancePeriod)}
								onValueChange={handleMaintenancePeriodChange}
							>
								<Select.Trigger class="w-full border-white/20 bg-white/5 text-white">
									<span>{globalSettings.maintenancePeriod} years</span>
								</Select.Trigger>
								<Select.Content class="border-white/20 bg-slate-800">
									<Select.Item value="5" class="text-slate-300 hover:bg-slate-700">
										5 years
									</Select.Item>
									<Select.Item value="10" class="text-slate-300 hover:bg-slate-700">
										10 years
									</Select.Item>
									<Select.Item value="20" class="text-slate-300 hover:bg-slate-700">
										20 years
									</Select.Item>
								</Select.Content>
							</Select.Root>
							<p class="text-xs text-slate-500">
								Time period for maintenance fee calculations
							</p>
						</div>
					</div>

					<!-- Reset Global Button -->
					<div class="flex gap-2 border-t border-white/10 pt-4">
						<Button
							variant="outline"
							size="sm"
							class="border-white/20 text-slate-300"
							onclick={resetGlobal}
						>
							<RotateCcw class="mr-2 h-4 w-4" />
							Reset Global Settings
						</Button>
					</div>
				</Tabs.Content>

				<!-- Per-Country Tab -->
				<Tabs.Content value="country" class="mt-4 space-y-4">
					<!-- Country Selector -->
					<div>
						<Label class="text-sm text-slate-400">Select Country to Configure</Label>
						<Select.Root type="single" value={selectedCountryCode} onValueChange={handleCountryChange}>
							<Select.Trigger class="mt-1 w-full border-white/20 bg-white/5 text-white">
								<span class="flex items-center gap-2">
									<span>{selectedCountry?.flag}</span>
									<span>{selectedCountry?.name}</span>
								</span>
							</Select.Trigger>
							<Select.Content class="max-h-64 border-white/20 bg-slate-800">
								{#each COUNTRIES as country}
									<Select.Item value={country.code} class="text-slate-300 hover:bg-slate-700">
										<span class="flex items-center gap-2">
											<span>{country.flag}</span>
											<span>{country.name}</span>
										</span>
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					{#if defaultCosts}
						<Tabs.Root value="official" class="w-full">
							<Tabs.List class="grid w-full grid-cols-4 bg-slate-800 text-xs">
								<Tabs.Trigger value="official" class="data-[state=active]:bg-slate-700">
									Official
								</Tabs.Trigger>
								<Tabs.Trigger value="foreign-attorney" class="data-[state=active]:bg-slate-700">
									Foreign Atty
								</Tabs.Trigger>
								<Tabs.Trigger value="translation" class="data-[state=active]:bg-slate-700">
									Translation
								</Tabs.Trigger>
								<Tabs.Trigger value="maintenance" class="data-[state=active]:bg-slate-700">
									Maintenance
								</Tabs.Trigger>
							</Tabs.List>

							<!-- Official Fees Tab -->
							<Tabs.Content value="official" class="mt-4 space-y-4">
								<div class="grid gap-4 sm:grid-cols-2">
									<div class="space-y-2">
										<Label for="filing-fee" class="text-sm text-slate-400">
											Filing Fee
											<span class="ml-1 text-xs text-slate-500">
												(default: ${defaultCosts.officialFees.filing})
											</span>
										</Label>
										<Input
											id="filing-fee"
											type="number"
											min="0"
											placeholder={String(defaultCosts.officialFees.filing)}
											value={userOverrides.official.filing ?? ''}
											oninput={(e) => handleOfficialFeeChange('filing', e)}
											class="border-white/20 bg-white/5 text-white"
										/>
									</div>
									<div class="space-y-2">
										<Label for="search-fee" class="text-sm text-slate-400">
											Search Fee
											<span class="ml-1 text-xs text-slate-500">
												(default: ${defaultCosts.officialFees.search})
											</span>
										</Label>
										<Input
											id="search-fee"
											type="number"
											min="0"
											placeholder={String(defaultCosts.officialFees.search)}
											value={userOverrides.official.search ?? ''}
											oninput={(e) => handleOfficialFeeChange('search', e)}
											class="border-white/20 bg-white/5 text-white"
										/>
									</div>
									<div class="space-y-2">
										<Label for="examination-fee" class="text-sm text-slate-400">
											Examination Fee
											<span class="ml-1 text-xs text-slate-500">
												(default: ${defaultCosts.officialFees.examination})
											</span>
										</Label>
										<Input
											id="examination-fee"
											type="number"
											min="0"
											placeholder={String(defaultCosts.officialFees.examination)}
											value={userOverrides.official.examination ?? ''}
											oninput={(e) => handleOfficialFeeChange('examination', e)}
											class="border-white/20 bg-white/5 text-white"
										/>
									</div>
									<div class="space-y-2">
										<Label for="grant-fee" class="text-sm text-slate-400">
											Grant Fee
											<span class="ml-1 text-xs text-slate-500">
												(default: ${defaultCosts.officialFees.grant})
											</span>
										</Label>
										<Input
											id="grant-fee"
											type="number"
											min="0"
											placeholder={String(defaultCosts.officialFees.grant)}
											value={userOverrides.official.grant ?? ''}
											oninput={(e) => handleOfficialFeeChange('grant', e)}
											class="border-white/20 bg-white/5 text-white"
										/>
									</div>
								</div>
							</Tabs.Content>

							<!-- Foreign Attorney Tab -->
							<Tabs.Content value="foreign-attorney" class="mt-4 space-y-4">
								<div class="space-y-2">
									<Label for="foreign-attorney-fee" class="text-sm text-slate-400">
										Foreign Attorney Fee
										<span class="ml-1 text-xs text-slate-500">
											(default: ${defaultCosts.foreignAttorneyFee})
										</span>
									</Label>
									<Input
										id="foreign-attorney-fee"
										type="number"
										min="0"
										placeholder={String(defaultCosts.foreignAttorneyFee)}
										value={userOverrides.foreignAttorney ?? ''}
										oninput={handleForeignAttorneyChange}
										class="border-white/20 bg-white/5 text-white"
									/>
									<p class="text-xs text-slate-500">
										In-country attorney fees for {selectedCountry?.name}
									</p>
								</div>
							</Tabs.Content>

							<!-- Translation Tab -->
							<Tabs.Content value="translation" class="mt-4 space-y-4">
								<div class="space-y-2">
									<Label for="translation-rate" class="text-sm text-slate-400">
										Translation Cost per Page
										<span class="ml-1 text-xs text-slate-500">
											(default: ${defaultCosts.translationCostPerPage})
										</span>
									</Label>
									<Input
										id="translation-rate"
										type="number"
										min="0"
										placeholder={String(defaultCosts.translationCostPerPage)}
										value={userOverrides.translation ?? ''}
										oninput={handleTranslationRateChange}
										class="border-white/20 bg-white/5 text-white"
									/>
									{#if !defaultCosts.requiresTranslation}
										<p class="text-xs text-amber-400">
											Note: {selectedCountry?.name} typically doesn't require translation
										</p>
									{/if}
								</div>
							</Tabs.Content>

							<!-- Maintenance Tab -->
							<Tabs.Content value="maintenance" class="mt-4 space-y-4">
								<div class="space-y-2">
									<Label for="maintenance-fee" class="text-sm text-slate-400">
										Annual Maintenance Fee
										<span class="ml-1 text-xs text-slate-500">
											(default: ${defaultCosts.maintenanceFeesAnnual}/year)
										</span>
									</Label>
									<Input
										id="maintenance-fee"
										type="number"
										min="0"
										placeholder={String(defaultCosts.maintenanceFeesAnnual)}
										value={userOverrides.maintenance ?? ''}
										oninput={handleMaintenanceChange}
										class="border-white/20 bg-white/5 text-white"
									/>
									<p class="text-xs text-slate-500">
										Annual maintenance fee for {selectedCountry?.name} (multiplied by maintenance period)
									</p>
								</div>
							</Tabs.Content>
						</Tabs.Root>

						<!-- Reset Buttons -->
						<div class="flex gap-2 border-t border-white/10 pt-4">
							<Button
								variant="outline"
								size="sm"
								class="border-white/20 text-slate-300"
								onclick={resetCountry}
							>
								<RotateCcw class="mr-2 h-4 w-4" />
								Reset {selectedCountry?.name}
							</Button>
							<Button
								variant="outline"
								size="sm"
								class="border-white/20 text-slate-300"
								onclick={resetAll}
							>
								<RotateCcw class="mr-2 h-4 w-4" />
								Reset All
							</Button>
						</div>
					{/if}
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</Dialog.Content>
</Dialog.Root>
