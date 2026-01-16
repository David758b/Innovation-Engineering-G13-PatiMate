<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import { COUNTRIES } from '$lib/data/countries';
	import { DEFAULT_COUNTRY_COSTS } from '$lib/data/default-costs';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { Settings, RotateCcw } from '@lucide/svelte';

	let open = $state(false);
	let selectedCountryCode = $state('US');

	const selectedCountry = $derived(COUNTRIES.find((c) => c.code === selectedCountryCode));
	const defaultCosts = $derived(DEFAULT_COUNTRY_COSTS[selectedCountryCode]);
	const userOverrides = $derived({
		official: calculatorStore.userConfig.officialFeeOverrides[selectedCountryCode] || {},
		attorney: calculatorStore.userConfig.attorneyRateOverrides[selectedCountryCode],
		translation: calculatorStore.userConfig.translationRateOverrides[selectedCountryCode]
	});

	function handleOfficialFeeChange(field: 'filing' | 'search' | 'examination' | 'grant', e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : null;
		calculatorStore.setOfficialFeeOverride(selectedCountryCode, field, value);
	}

	function handleAttorneyRateChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : null;
		calculatorStore.setAttorneyRateOverride(selectedCountryCode, value);
	}

	function handleTranslationRateChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : null;
		calculatorStore.setTranslationRateOverride(selectedCountryCode, value);
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
			<!-- Country Selector -->
			<div class="mb-4">
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
					<Tabs.List class="grid w-full grid-cols-3 bg-slate-800">
						<Tabs.Trigger value="official" class="data-[state=active]:bg-slate-700">
							Official Fees
						</Tabs.Trigger>
						<Tabs.Trigger value="attorney" class="data-[state=active]:bg-slate-700">
							Attorney
						</Tabs.Trigger>
						<Tabs.Trigger value="translation" class="data-[state=active]:bg-slate-700">
							Translation
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

					<!-- Attorney Tab -->
					<Tabs.Content value="attorney" class="mt-4 space-y-4">
						<div class="space-y-2">
							<Label for="attorney-fee" class="text-sm text-slate-400">
								Attorney Fees (total)
								<span class="ml-1 text-xs text-slate-500">
									(default: ${defaultCosts.attorneyFees})
								</span>
							</Label>
							<Input
								id="attorney-fee"
								type="number"
								min="0"
								placeholder={String(defaultCosts.attorneyFees)}
								value={userOverrides.attorney ?? ''}
								oninput={handleAttorneyRateChange}
								class="border-white/20 bg-white/5 text-white"
							/>
							<p class="text-xs text-slate-500">
								Total attorney fees for filing in {selectedCountry?.name}
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
				</Tabs.Root>

				<!-- Reset Buttons -->
				<div class="mt-6 flex gap-2 border-t border-white/10 pt-4">
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
						Reset All Countries
					</Button>
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
