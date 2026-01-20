<script lang="ts">
	import { strategyStudioStore, type StudioBlock, type ConnectionPort } from '$lib/stores/strategy-studio.svelte';
	import StudioBlockComponent from './StudioBlock.svelte';
	import StudioConnectionComponent from './StudioConnection.svelte';

	interface Props {
		draggedTemplate: Omit<StudioBlock, 'id' | 'x' | 'y'> | null;
		onDragEnd: () => void;
		readonly?: boolean;
	}

	let { draggedTemplate, onDragEnd, readonly = false }: Props = $props();

	let canvasRef = $state<HTMLDivElement | null>(null);
	let isPanning = $state(false);
	let panStart = $state({ x: 0, y: 0 });
	let mousePos = $state({ x: 0, y: 0 });

	// Keyboard shortcuts (disabled in readonly mode)
	function handleKeyDown(e: KeyboardEvent) {
		if (readonly) return;

		// Undo: Ctrl+Z
		if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
			e.preventDefault();
			strategyStudioStore.undo();
		}
		// Redo: Ctrl+Y or Ctrl+Shift+Z
		if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
			e.preventDefault();
			strategyStudioStore.redo();
		}
		// Copy: Ctrl+C
		if (e.ctrlKey && e.key === 'c') {
			e.preventDefault();
			strategyStudioStore.copySelectedBlock();
		}
		// Paste: Ctrl+V
		if (e.ctrlKey && e.key === 'v') {
			e.preventDefault();
			// Paste at mouse position if available, otherwise offset from original
			strategyStudioStore.pasteBlock(mousePos.x, mousePos.y);
		}
		// Delete selected
		if (e.key === 'Delete' || e.key === 'Backspace') {
			if (strategyStudioStore.selectedBlockId) {
				strategyStudioStore.deleteBlock(strategyStudioStore.selectedBlockId);
			} else if (strategyStudioStore.selectedConnectionId) {
				strategyStudioStore.deleteConnection(strategyStudioStore.selectedConnectionId);
			}
		}
		// Escape: cancel connection or deselect
		if (e.key === 'Escape') {
			if (strategyStudioStore.isDrawingConnection) {
				strategyStudioStore.cancelConnection();
			} else {
				strategyStudioStore.selectBlock(null);
				strategyStudioStore.selectConnection(null);
			}
		}
	}

	// Handle drop from palette (disabled in readonly mode)
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (readonly) return;
		if (!draggedTemplate || !canvasRef) return;

		const rect = canvasRef.getBoundingClientRect();
		const x = (e.clientX - rect.left - strategyStudioStore.canvasOffset.x) / strategyStudioStore.canvasZoom;
		const y = (e.clientY - rect.top - strategyStudioStore.canvasOffset.y) / strategyStudioStore.canvasZoom;

		strategyStudioStore.addBlock(draggedTemplate, x - draggedTemplate.width / 2, y - draggedTemplate.height / 2);
		onDragEnd();
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	// Handle canvas panning with middle mouse or space+drag
	function handleMouseDown(e: MouseEvent) {
		// Middle mouse button or right click for panning (allowed in readonly)
		if (e.button === 1 || e.button === 2) {
			e.preventDefault();
			isPanning = true;
			panStart = { x: e.clientX - strategyStudioStore.canvasOffset.x, y: e.clientY - strategyStudioStore.canvasOffset.y };
		}
		// Left click on canvas background - deselect (only in edit mode)
		if (!readonly && e.button === 0 && e.target === canvasRef) {
			strategyStudioStore.selectBlock(null);
			strategyStudioStore.cancelConnection();
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (!canvasRef) return;

		const rect = canvasRef.getBoundingClientRect();
		mousePos = {
			x: (e.clientX - rect.left - strategyStudioStore.canvasOffset.x) / strategyStudioStore.canvasZoom,
			y: (e.clientY - rect.top - strategyStudioStore.canvasOffset.y) / strategyStudioStore.canvasZoom
		};

		if (isPanning) {
			strategyStudioStore.setCanvasOffset(
				e.clientX - panStart.x,
				e.clientY - panStart.y
			);
		}
	}

	function handleMouseUp() {
		isPanning = false;
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const delta = e.deltaY > 0 ? -0.1 : 0.1;
		strategyStudioStore.setCanvasZoom(strategyStudioStore.canvasZoom + delta);
	}

	function handleContextMenu(e: MouseEvent) {
		e.preventDefault();
	}

	// Get port position on a block
	function getPortPosition(block: StudioBlock, port: ConnectionPort): { x: number; y: number } {
		switch (port) {
			case 'top':
				return { x: block.x + block.width / 2, y: block.y };
			case 'bottom':
				return { x: block.x + block.width / 2, y: block.y + block.height };
			case 'left':
				return { x: block.x, y: block.y + block.height / 2 };
			case 'right':
				return { x: block.x + block.width, y: block.y + block.height / 2 };
		}
	}

	// Get control point offset direction for a port
	function getControlOffset(port: ConnectionPort, distance: number): { dx: number; dy: number } {
		switch (port) {
			case 'top':
				return { dx: 0, dy: -distance };
			case 'bottom':
				return { dx: 0, dy: distance };
			case 'left':
				return { dx: -distance, dy: 0 };
			case 'right':
				return { dx: distance, dy: 0 };
		}
	}

	// Calculate connection line from source block to mouse (not shown in readonly)
	function getConnectionPreviewPath(): string {
		if (readonly) return '';
		if (!strategyStudioStore.isDrawingConnection || !strategyStudioStore.connectionStart) return '';

		const { blockId, port } = strategyStudioStore.connectionStart;
		const sourceBlock = strategyStudioStore.blocks.find(b => b.id === blockId);
		if (!sourceBlock) return '';

		const start = getPortPosition(sourceBlock, port);
		const end = mousePos;

		// Calculate distance for control points
		const dx = Math.abs(end.x - start.x);
		const dy = Math.abs(end.y - start.y);
		const controlDistance = Math.max(50, Math.min(150, Math.max(dx, dy) / 2));

		// Get control point offset based on port direction
		const startOffset = getControlOffset(port, controlDistance);

		// Control points - start uses port direction, end just curves toward mouse
		const cp1x = start.x + startOffset.dx;
		const cp1y = start.y + startOffset.dy;
		// For preview, use a simple mid-point control that curves toward the mouse
		const cp2x = end.x;
		const cp2y = end.y - controlDistance * Math.sign(end.y - start.y || 1);

		return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={canvasRef}
	class="relative h-full w-full overflow-hidden bg-slate-950"
	class:cursor-crosshair={!readonly}
	class:cursor-grab={readonly && !isPanning}
	class:cursor-grabbing={readonly && isPanning}
	style="background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: {strategyStudioStore.GRID_SIZE}px {strategyStudioStore.GRID_SIZE}px;"
	ondrop={handleDrop}
	ondragover={handleDragOver}
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
	onwheel={handleWheel}
	oncontextmenu={handleContextMenu}
	role="application"
	aria-label={readonly ? "Strategy preview" : "Strategy canvas"}
	tabindex="-1"
>
	<!-- Transformed canvas content -->
	<div
		class="absolute origin-top-left"
		style="transform: translate({strategyStudioStore.canvasOffset.x}px, {strategyStudioStore.canvasOffset.y}px) scale({strategyStudioStore.canvasZoom})"
	>
		<!-- SVG layer for connections and guides -->
		<svg class="pointer-events-none absolute left-0 top-0 h-[5000px] w-[5000px] overflow-visible">
			<!-- Alignment guides (only in edit mode) -->
			{#if !readonly && strategyStudioStore.alignmentGuides.x !== null}
				<line
					x1={strategyStudioStore.alignmentGuides.x}
					y1="0"
					x2={strategyStudioStore.alignmentGuides.x}
					y2="5000"
					stroke="#22c55e"
					stroke-width="1"
					stroke-dasharray="4,4"
					opacity="0.7"
				/>
			{/if}
			{#if !readonly && strategyStudioStore.alignmentGuides.y !== null}
				<line
					x1="0"
					y1={strategyStudioStore.alignmentGuides.y}
					x2="5000"
					y2={strategyStudioStore.alignmentGuides.y}
					stroke="#22c55e"
					stroke-width="1"
					stroke-dasharray="4,4"
					opacity="0.7"
				/>
			{/if}

			<!-- Existing connections -->
			{#each strategyStudioStore.connections as connection (connection.id)}
				<StudioConnectionComponent {connection} {readonly} />
			{/each}

			<!-- Connection preview while drawing (not in readonly) -->
			{#if !readonly && strategyStudioStore.isDrawingConnection}
				<path
					d={getConnectionPreviewPath()}
					stroke="rgba(34, 197, 94, 0.5)"
					stroke-width="2"
					stroke-dasharray="5,5"
					fill="none"
				/>
			{/if}
		</svg>

		<!-- Blocks -->
		{#each strategyStudioStore.blocks as block (block.id)}
			<StudioBlockComponent {block} {readonly} />
		{/each}
	</div>

	<!-- Empty state -->
	{#if strategyStudioStore.blocks.length === 0}
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-center">
				{#if readonly}
					<p class="text-lg text-slate-500">No strategy loaded</p>
					<p class="mt-2 text-sm text-slate-600">Select a filing strategy to see the visualization</p>
				{:else}
					<p class="text-lg text-slate-500">Drag blocks from the palette to start</p>
					<p class="mt-2 text-sm text-slate-600">Or load a template (Direct / PCT)</p>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Zoom indicator -->
	<div class="absolute bottom-4 right-4 rounded-md bg-slate-800/80 px-2 py-1 text-xs text-slate-400">
		{Math.round(strategyStudioStore.canvasZoom * 100)}%
	</div>

	<!-- Instructions / Connection mode indicator -->
	<div class="absolute bottom-4 left-4 text-xs">
		{#if readonly}
			<p class="rounded bg-slate-800/80 px-2 py-1 text-slate-500">
				Drag to pan | Scroll to zoom | Open Strategy Studio to edit
			</p>
		{:else if strategyStudioStore.isDrawingConnection}
			<p class="rounded bg-green-500/20 px-2 py-1 text-green-400">
				Click another block to complete connection | Click canvas to cancel
			</p>
		{:else}
			<p class="text-slate-600">
				Drag to move | Handles to connect | Ctrl+C/V copy/paste | Ctrl+Z/Y undo/redo | Middle-click pan | Scroll zoom
			</p>
		{/if}
	</div>
</div>
