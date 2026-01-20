<script lang="ts">
	import { strategyStudioStore, type StudioBlock } from '$lib/stores/strategy-studio.svelte';
	import { FileText, DollarSign, Puzzle, Link } from '@lucide/svelte';
	import { scale, fade } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	interface Props {
		block: StudioBlock;
		readonly?: boolean;
	}

	let { block, readonly = false }: Props = $props();

	let isDragging = $state(false);
	let dragOffset = $state({ x: 0, y: 0 });

	const isSelected = $derived(!readonly && strategyStudioStore.selectedBlockId === block.id);
	const isConnectionSource = $derived(!readonly && strategyStudioStore.connectionStart === block.id);

	function handleMouseDown(e: MouseEvent) {
		if (readonly) return; // No interaction in readonly mode
		if (e.button !== 0) return;
		e.stopPropagation();

		// If we're drawing a connection, clicking on a block completes it
		if (strategyStudioStore.isDrawingConnection) {
			strategyStudioStore.completeConnection(block.id);
			return;
		}

		isDragging = true;
		dragOffset = { x: e.clientX - block.x, y: e.clientY - block.y };
		strategyStudioStore.selectBlock(block.id);
	}

	function handleMouseMove(e: MouseEvent) {
		if (readonly) return;
		if (!isDragging) return;

		const newX = (e.clientX - dragOffset.x) / strategyStudioStore.canvasZoom;
		const newY = (e.clientY - dragOffset.y) / strategyStudioStore.canvasZoom;
		strategyStudioStore.updateBlockPosition(block.id, newX, newY);
	}

	function handleMouseUp() {
		if (readonly) return;
		if (isDragging) {
			strategyStudioStore.finishBlockMove();
		}
		isDragging = false;
	}

	// Connection handles - need to handle both mousedown and click
	// mousedown to prevent block dragging, click to handle the connection
	function handleConnectionMouseDown(e: MouseEvent) {
		if (readonly) return;
		e.stopPropagation(); // Prevent block from starting to drag
		e.preventDefault();
	}

	function handleConnectionClick(e: MouseEvent) {
		if (readonly) return;
		e.stopPropagation();
		if (strategyStudioStore.isDrawingConnection) {
			// Complete the connection
			strategyStudioStore.completeConnection(block.id);
		} else {
			// Start a new connection
			strategyStudioStore.startConnection(block.id);
		}
	}

	// Get block color based on type
	function getBlockColors(): { border: string; bg: string; icon: string } {
		switch (block.type) {
			case 'filing':
				return { border: 'border-green-500/50', bg: 'bg-green-500/10', icon: 'text-green-400' };
			case 'cost':
				return { border: 'border-blue-500/50', bg: 'bg-blue-500/10', icon: 'text-blue-400' };
			case 'custom':
				return { border: 'border-purple-500/50', bg: 'bg-purple-500/10', icon: 'text-purple-400' };
			default:
				return { border: 'border-slate-500/50', bg: 'bg-slate-500/10', icon: 'text-slate-400' };
		}
	}

	const colors = $derived(getBlockColors());

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div
	class="absolute flex select-none flex-col rounded-lg border-2 transition-all duration-150 {colors.border} {colors.bg} {isSelected ? 'ring-2 ring-white/30 shadow-lg shadow-white/10' : ''} {isConnectionSource ? 'ring-2 ring-green-400 shadow-lg shadow-green-500/20' : ''}"
	class:cursor-move={!readonly}
	class:cursor-default={readonly}
	style="left: {block.x}px; top: {block.y}px; width: {block.width}px; min-height: {block.height}px;"
	onmousedown={handleMouseDown}
	role="button"
	tabindex="0"
	in:scale={{ duration: 200, start: 0.8, easing: backOut }}
	out:fade={{ duration: 150 }}
>
	<!-- Block content -->
	<div class="flex flex-1 items-center gap-2 px-3 py-2">
		{#if block.type === 'filing'}
			<FileText class="h-4 w-4 flex-shrink-0 {colors.icon}" />
		{:else if block.type === 'cost'}
			<DollarSign class="h-4 w-4 flex-shrink-0 {colors.icon}" />
		{:else}
			<Puzzle class="h-4 w-4 flex-shrink-0 {colors.icon}" />
		{/if}
		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-medium text-white">{block.label}</p>
			{#if typeof block.data.cost === 'number' && block.data.cost > 0}
				<p class="text-xs text-slate-400">{formatCurrency(block.data.cost)}</p>
			{/if}
			{#if block.data.deadline}
				<p class="text-xs text-amber-400">{block.data.deadline}</p>
			{/if}
		</div>
	</div>

	<!-- Connection handles (top and bottom) - hidden in readonly mode -->
	{#if !readonly}
		<button
			class="absolute -top-2 left-1/2 z-10 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-slate-600 bg-slate-800 transition-colors hover:border-green-400 hover:bg-green-500/20 {strategyStudioStore.isDrawingConnection ? 'animate-pulse border-green-400' : ''}"
			onmousedown={handleConnectionMouseDown}
			onclick={handleConnectionClick}
			title={strategyStudioStore.isDrawingConnection ? "Click to connect here" : "Click to start connection"}
		>
			<span class="sr-only">Connect from top</span>
		</button>

		<button
			class="absolute -bottom-2 left-1/2 z-10 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-slate-600 bg-slate-800 transition-colors hover:border-green-400 hover:bg-green-500/20 {strategyStudioStore.isDrawingConnection ? 'animate-pulse border-green-400' : ''}"
			onmousedown={handleConnectionMouseDown}
			onclick={handleConnectionClick}
			title={strategyStudioStore.isDrawingConnection ? "Click to connect here" : "Click to start connection"}
		>
			<span class="sr-only">Connect from bottom</span>
		</button>
	{/if}
</div>
