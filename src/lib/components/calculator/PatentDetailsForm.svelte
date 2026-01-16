<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as RadioGroup from '$lib/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import type { PatentType, TechnologyField } from '$lib/data/types';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { ChevronDown, ChevronUp } from '@lucide/svelte';

	let isExpanded = $state(false);

	const PATENT_TYPES: { value: PatentType; label: string }[] = [
		{ value: 'utility', label: 'Utility Patent' },
		{ value: 'design', label: 'Design Patent' },
		{ value: 'provisional', label: 'Provisional Application' }
	];

	const TECHNOLOGY_FIELDS: { value: TechnologyField; label: string }[] = [
		{ value: 'mechanical', label: 'Mechanical' },
		{ value: 'electrical', label: 'Electrical' },
		{ value: 'software', label: 'Software' },
		{ value: 'biotech', label: 'Biotechnology' },
		{ value: 'chemical', label: 'Chemical' },
		{ value: 'pharma', label: 'Pharmaceutical' },
		{ value: 'other', label: 'Other' }
	];

	function handlePatentTypeChange(value: string) {
		calculatorStore.setPatentType(value as PatentType);
	}

	function handleTechFieldChange(value: string | undefined) {
		if (value) {
			calculatorStore.setTechnologyField(value as TechnologyField);
		}
	}

	function handleClaimsChange(e: Event) {
		const target = e.target as HTMLInputElement;
		calculatorStore.setClaims(parseInt(target.value) || 1);
	}

	function handlePagesChange(e: Event) {
		const target = e.target as HTMLInputElement;
		calculatorStore.setPages(parseInt(target.value) || 1);
	}

	// Get currently selected tech field for Select
	const selectedTechField = $derived(
		TECHNOLOGY_FIELDS.find((f) => f.value === calculatorStore.input.technologyField)
	);
</script>

<Collapsible.Root bind:open={isExpanded} class="rounded-lg border border-white/10 bg-white/5">
	<Collapsible.Trigger
		class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
	>
		<span class="font-medium text-white">Patent Details</span>
		{#if isExpanded}
			<ChevronUp class="h-4 w-4 text-slate-400" />
		{:else}
			<ChevronDown class="h-4 w-4 text-slate-400" />
		{/if}
	</Collapsible.Trigger>

	<Collapsible.Content class="space-y-4 px-4 pb-4">
		<!-- Patent Type -->
		<div class="space-y-2">
			<Label class="text-sm text-slate-400">Patent Type</Label>
			<RadioGroup.Root
				value={calculatorStore.input.patentType}
				onValueChange={handlePatentTypeChange}
				class="flex flex-col gap-2"
			>
				{#each PATENT_TYPES as type}
					<div class="flex items-center gap-2">
						<RadioGroup.Item
							value={type.value}
							id={`patent-type-${type.value}`}
							class="border-white/30 text-green-500 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
						/>
						<Label for={`patent-type-${type.value}`} class="cursor-pointer text-sm text-slate-300">
							{type.label}
						</Label>
					</div>
				{/each}
			</RadioGroup.Root>
		</div>

		<!-- Number of Claims -->
		<div class="space-y-2">
			<Label for="claims" class="text-sm text-slate-400">Number of Claims</Label>
			<Input
				id="claims"
				type="number"
				min="1"
				value={calculatorStore.input.claims}
				oninput={handleClaimsChange}
				class="border-white/20 bg-white/5 text-white"
			/>
		</div>

		<!-- Number of Pages -->
		<div class="space-y-2">
			<Label for="pages" class="text-sm text-slate-400">Number of Pages</Label>
			<Input
				id="pages"
				type="number"
				min="1"
				value={calculatorStore.input.pages}
				oninput={handlePagesChange}
				class="border-white/20 bg-white/5 text-white"
			/>
		</div>

		<!-- Technology Field -->
		<div class="space-y-2">
			<Label class="text-sm text-slate-400">Technology Field</Label>
			<Select.Root
				type="single"
				value={calculatorStore.input.technologyField}
				onValueChange={handleTechFieldChange}
			>
				<Select.Trigger class="w-full border-white/20 bg-white/5 text-white">
					{selectedTechField?.label || 'Select field'}
				</Select.Trigger>
				<Select.Content class="border-white/20 bg-slate-800">
					{#each TECHNOLOGY_FIELDS as field}
						<Select.Item value={field.value} class="text-slate-300 hover:bg-slate-700">
							{field.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
