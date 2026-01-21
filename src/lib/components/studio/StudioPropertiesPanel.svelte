<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { strategyStudioStore } from '$lib/stores/strategy-studio.svelte';
	import { Trash2, X } from '@lucide/svelte';
	import { fly } from 'svelte/transition';

	const selectedBlock = $derived(strategyStudioStore.selectedBlock);
	const selectedConnection = $derived(strategyStudioStore.selectedConnection);

	function handleLabelChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (selectedBlock) {
			strategyStudioStore.updateBlock(selectedBlock.id, { label: target.value });
		}
	}

	function handleCostChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (selectedBlock) {
			strategyStudioStore.updateBlockData(selectedBlock.id, { cost: parseFloat(target.value) || 0 });
		}
	}

	function handleDeadlineChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (selectedBlock) {
			strategyStudioStore.updateBlockData(selectedBlock.id, { deadline: target.value });
		}
	}

	function handleNoteChange(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		if (selectedBlock) {
			strategyStudioStore.updateBlockData(selectedBlock.id, { text: target.value });
		}
	}

	function handleConnectionLabelChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (selectedConnection) {
			strategyStudioStore.updateConnection(selectedConnection.id, { label: target.value });
		}
	}

	function handleConnectionStyleChange(style: string) {
		if (selectedConnection) {
			strategyStudioStore.updateConnection(selectedConnection.id, { style: style as 'solid' | 'dashed' });
		}
	}

	function handleConnectionLineTypeChange(lineType: string) {
		if (selectedConnection) {
			strategyStudioStore.updateConnection(selectedConnection.id, { lineType: lineType as 'straight' | 'curved' });
		}
	}

	function handleDeleteBlock() {
		if (selectedBlock) {
			strategyStudioStore.deleteBlock(selectedBlock.id);
		}
	}

	function handleDeleteConnection() {
		if (selectedConnection) {
			strategyStudioStore.deleteConnection(selectedConnection.id);
		}
	}

	function handleClose() {
		strategyStudioStore.selectBlock(null);
		strategyStudioStore.selectConnection(null);
	}
</script>

<div class="p-4" in:fly={{ x: 50, duration: 200 }} out:fly={{ x: 50, duration: 150 }}>
	<div class="mb-4 flex items-center justify-between">
		<h3 class="text-sm font-semibold text-white">Properties</h3>
		<button onclick={handleClose} class="text-slate-500 hover:text-white">
			<X class="h-4 w-4" />
		</button>
	</div>

	{#if selectedBlock}
		<div class="space-y-4">
			<!-- Block Type indicator -->
			<div class="rounded-md border border-white/10 bg-white/5 p-2">
				<p class="text-xs text-slate-500 uppercase tracking-wide">
					{selectedBlock.type === 'filing' ? 'Filing Step' : selectedBlock.type === 'cost' ? 'Cost Item' : selectedBlock.type === 'milestone' ? 'Milestone' : 'Custom Block'}
				</p>
			</div>

			<!-- Label -->
			<div class="space-y-1.5">
				<Label class="text-xs text-slate-400">Label</Label>
				<Input
					value={selectedBlock.label}
					oninput={handleLabelChange}
					class="border-white/20 bg-white/5 text-sm text-white"
				/>
			</div>

			<!-- Cost (if applicable) -->
			{#if selectedBlock.type !== 'custom' || selectedBlock.data.cost !== undefined}
				<div class="space-y-1.5">
					<Label class="text-xs text-slate-400">Estimated Cost (DKK)</Label>
					<Input
						type="number"
						value={selectedBlock.data.cost ?? 0}
						oninput={handleCostChange}
						class="border-white/20 bg-white/5 text-sm text-white"
					/>
				</div>
			{/if}

			<!-- Deadline (if applicable) -->
			{#if selectedBlock.type === 'filing'}
				<div class="space-y-1.5">
					<Label class="text-xs text-slate-400">Deadline</Label>
					<Input
						value={selectedBlock.data.deadline ?? ''}
						oninput={handleDeadlineChange}
						placeholder="e.g., 12 months"
						class="border-white/20 bg-white/5 text-sm text-white"
					/>
				</div>
			{/if}

			<!-- Notes (for custom blocks) -->
			{#if selectedBlock.category === 'note'}
				<div class="space-y-1.5">
					<Label class="text-xs text-slate-400">Note Text</Label>
					<textarea
						value={(selectedBlock.data.text as string) ?? ''}
						oninput={handleNoteChange}
						rows="4"
						class="w-full rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
						placeholder="Add notes..."
					></textarea>
				</div>
			{/if}

			<!-- Delete button -->
			<Button
				variant="destructive"
				size="sm"
				onclick={handleDeleteBlock}
				class="w-full"
			>
				<Trash2 class="mr-2 h-4 w-4" />
				Delete Block
			</Button>
		</div>

	{:else if selectedConnection}
		<div class="space-y-4">
			<!-- Connection indicator -->
			<div class="rounded-md border border-white/10 bg-white/5 p-2">
				<p class="text-xs text-slate-500 uppercase tracking-wide">Connection</p>
			</div>

			<!-- Label -->
			<div class="space-y-1.5">
				<Label class="text-xs text-slate-400">Label</Label>
				<Input
					value={selectedConnection.label}
					oninput={handleConnectionLabelChange}
					placeholder="e.g., 12 months, If approved"
					class="border-white/20 bg-white/5 text-sm text-white"
				/>
			</div>

			<!-- Style -->
			<div class="space-y-1.5">
				<Label class="text-xs text-slate-400">Line Style</Label>
				<Select.Root
					type="single"
					value={selectedConnection.style}
					onValueChange={handleConnectionStyleChange}
				>
					<Select.Trigger class="w-full border-white/20 bg-white/5 text-white">
						{selectedConnection.style === 'solid' ? 'Solid' : 'Dashed'}
					</Select.Trigger>
					<Select.Content class="border-white/20 bg-slate-800">
						<Select.Item value="solid" class="text-slate-300 hover:bg-slate-700">
							Solid
						</Select.Item>
						<Select.Item value="dashed" class="text-slate-300 hover:bg-slate-700">
							Dashed
						</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Line Type (Straight vs Curved) -->
			<div class="space-y-1.5">
				<Label class="text-xs text-slate-400">Line Type</Label>
				<Select.Root
					type="single"
					value={selectedConnection.lineType || 'curved'}
					onValueChange={handleConnectionLineTypeChange}
				>
					<Select.Trigger class="w-full border-white/20 bg-white/5 text-white">
						{(selectedConnection.lineType || 'curved') === 'straight' ? 'Straight' : 'Curved'}
					</Select.Trigger>
					<Select.Content class="border-white/20 bg-slate-800">
						<Select.Item value="curved" class="text-slate-300 hover:bg-slate-700">
							Curved
						</Select.Item>
						<Select.Item value="straight" class="text-slate-300 hover:bg-slate-700">
							Straight
						</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Delete button -->
			<Button
				variant="destructive"
				size="sm"
				onclick={handleDeleteConnection}
				class="w-full"
			>
				<Trash2 class="mr-2 h-4 w-4" />
				Delete Connection
			</Button>
		</div>
	{/if}
</div>
