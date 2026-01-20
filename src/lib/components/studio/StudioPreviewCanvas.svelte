<script lang="ts">
	import { strategyStudioStore, type StudioBlock, type StudioConnection } from '$lib/stores/strategy-studio.svelte';
	import { FileText, DollarSign, Puzzle } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	interface Props {
		blocks: StudioBlock[];
		connections: StudioConnection[];
	}

	let { blocks, connections }: Props = $props();

	let canvasRef = $state<HTMLDivElement | null>(null);
	let isPanning = $state(false);
	let panStart = $state({ x: 0, y: 0 });

	// Local pan/zoom state for preview
	let previewOffset = $state({ x: 0, y: 0 });
	let previewZoom = $state(1);
	let hasInitialized = $state(false);

	// Calculate bounds of all blocks
	function getContentBounds() {
		if (blocks.length === 0) {
			return { minX: 0, minY: 0, maxX: 400, maxY: 300, width: 400, height: 300 };
		}

		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for (const block of blocks) {
			minX = Math.min(minX, block.x);
			minY = Math.min(minY, block.y);
			maxX = Math.max(maxX, block.x + block.width);
			maxY = Math.max(maxY, block.y + block.height);
		}

		const padding = 60;
		return {
			minX: minX - padding,
			minY: minY - padding,
			maxX: maxX + padding,
			maxY: maxY + padding,
			width: maxX - minX + padding * 2,
			height: maxY - minY + padding * 2
		};
	}

	// Center and fit content in view
	function fitToView() {
		if (!canvasRef || !browser) return;

		const rect = canvasRef.getBoundingClientRect();
		const bounds = getContentBounds();

		// Calculate zoom to fit content
		const scaleX = rect.width / bounds.width;
		const scaleY = rect.height / bounds.height;
		const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in more than 100%

		previewZoom = Math.max(0.25, Math.min(1, scale * 0.9)); // 90% to add some margin

		// Center content
		const centerX = bounds.minX + bounds.width / 2;
		const centerY = bounds.minY + bounds.height / 2;

		previewOffset = {
			x: rect.width / 2 - centerX * previewZoom,
			y: rect.height / 2 - centerY * previewZoom
		};

		hasInitialized = true;
	}

	// Fit to view on mount and when blocks change
	onMount(() => {
		// Small delay to ensure container is properly sized
		setTimeout(fitToView, 50);
	});

	// Re-fit when blocks change significantly
	$effect(() => {
		if (blocks.length > 0 && canvasRef && !hasInitialized) {
			fitToView();
		}
	});

	// Keyboard shortcuts for preview mode
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			strategyStudioStore.closePreview();
		}
		// Fit to view with 'f' key
		if (e.key === 'f' || e.key === 'F') {
			e.preventDefault();
			fitToView();
		}
	}

	// Handle canvas panning
	function handleMouseDown(e: MouseEvent) {
		if (e.button === 0 || e.button === 1 || e.button === 2) {
			e.preventDefault();
			isPanning = true;
			panStart = { x: e.clientX - previewOffset.x, y: e.clientY - previewOffset.y };
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (isPanning) {
			previewOffset = {
				x: e.clientX - panStart.x,
				y: e.clientY - panStart.y
			};
		}
	}

	function handleMouseUp() {
		isPanning = false;
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const delta = e.deltaY > 0 ? -0.1 : 0.1;
		previewZoom = Math.max(0.25, Math.min(2, previewZoom + delta));
	}

	function handleContextMenu(e: MouseEvent) {
		e.preventDefault();
	}

	// Get block color based on type
	function getBlockColors(type: string): { border: string; bg: string; icon: string } {
		switch (type) {
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

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// Calculate connection path
	function getConnectionPath(conn: StudioConnection): string {
		const fromBlock = blocks.find(b => b.id === conn.fromBlockId);
		const toBlock = blocks.find(b => b.id === conn.toBlockId);
		if (!fromBlock || !toBlock) return '';

		const startX = fromBlock.x + fromBlock.width / 2;
		const startY = fromBlock.y + fromBlock.height;
		const endX = toBlock.x + toBlock.width / 2;
		const endY = toBlock.y;
		const midY = (startY + endY) / 2;

		return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
	}

	// Get label position for connection
	function getLabelPos(conn: StudioConnection): { x: number; y: number } {
		const fromBlock = blocks.find(b => b.id === conn.fromBlockId);
		const toBlock = blocks.find(b => b.id === conn.toBlockId);
		if (!fromBlock || !toBlock) return { x: 0, y: 0 };

		const startX = fromBlock.x + fromBlock.width / 2;
		const startY = fromBlock.y + fromBlock.height;
		const endX = toBlock.x + toBlock.width / 2;
		const endY = toBlock.y;

		return {
			x: (startX + endX) / 2,
			y: (startY + endY) / 2
		};
	}

	// Mini-map calculations
	const MAP_WIDTH = 120;
	const MAP_HEIGHT = 80;

	function getMapScale() {
		const bounds = getContentBounds();
		return Math.min(MAP_WIDTH / bounds.width, MAP_HEIGHT / bounds.height, 0.08);
	}

	function toMapCoords(x: number, y: number): { x: number; y: number } {
		const bounds = getContentBounds();
		const scale = getMapScale();
		return {
			x: (x - bounds.minX) * scale,
			y: (y - bounds.minY) * scale
		};
	}

	function handleMiniMapClick(e: MouseEvent) {
		if (!canvasRef) return;
		const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const clickY = e.clientY - rect.top;

		const bounds = getContentBounds();
		const scale = getMapScale();
		const canvasRect = canvasRef.getBoundingClientRect();

		const canvasX = clickX / scale + bounds.minX;
		const canvasY = clickY / scale + bounds.minY;

		previewOffset = {
			x: -canvasX * previewZoom + canvasRect.width / 2,
			y: -canvasY * previewZoom + canvasRect.height / 2
		};
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={canvasRef}
	class="relative h-full w-full overflow-hidden bg-slate-950"
	class:cursor-grab={!isPanning}
	class:cursor-grabbing={isPanning}
	style="background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 20px 20px;"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
	onwheel={handleWheel}
	oncontextmenu={handleContextMenu}
	role="img"
	aria-label="Strategy preview"
	tabindex="-1"
>
	<!-- Transformed canvas content -->
	<div
		class="absolute origin-top-left"
		style="transform: translate({previewOffset.x}px, {previewOffset.y}px) scale({previewZoom})"
	>
		<!-- SVG layer for connections -->
		<svg class="pointer-events-none absolute left-0 top-0 h-[5000px] w-[5000px] overflow-visible">
			{#each connections as conn (conn.id)}
				{@const fromBlock = blocks.find(b => b.id === conn.fromBlockId)}
				{@const toBlock = blocks.find(b => b.id === conn.toBlockId)}
				{#if fromBlock && toBlock}
					<!-- Connection path -->
					<path
						d={getConnectionPath(conn)}
						stroke="#64748b"
						stroke-width="2"
						stroke-dasharray={conn.style === 'dashed' ? '8,4' : 'none'}
						fill="none"
					/>
					<!-- Arrow head -->
					<polygon
						points="-6,-8 0,0 6,-8"
						fill="#64748b"
						transform="translate({toBlock.x + toBlock.width / 2}, {toBlock.y}) rotate(180)"
					/>
					<!-- Label -->
					{#if conn.label}
						{@const labelPos = getLabelPos(conn)}
						<rect
							x={labelPos.x - 30}
							y={labelPos.y - 10}
							width="60"
							height="20"
							rx="4"
							fill="rgba(30, 41, 59, 0.9)"
							stroke="#475569"
							stroke-width="1"
						/>
						<text
							x={labelPos.x}
							y={labelPos.y + 4}
							text-anchor="middle"
							fill="#94a3b8"
							font-size="11"
							font-family="system-ui"
						>
							{conn.label}
						</text>
					{/if}
				{/if}
			{/each}
		</svg>

		<!-- Blocks (read-only display) -->
		{#each blocks as block (block.id)}
			{@const colors = getBlockColors(block.type)}
			<div
				class="absolute flex select-none flex-col rounded-lg border-2 {colors.border} {colors.bg}"
				style="left: {block.x}px; top: {block.y}px; width: {block.width}px; min-height: {block.height}px;"
			>
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
			</div>
		{/each}
	</div>

	<!-- Mini-map -->
	{#if blocks.length > 0}
		<div class="absolute bottom-16 right-4 rounded-lg border border-white/20 bg-slate-900/90 p-1 shadow-lg backdrop-blur-sm">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<svg
				width={MAP_WIDTH}
				height={MAP_HEIGHT}
				class="cursor-pointer"
				onclick={handleMiniMapClick}
				role="img"
				aria-label="Mini-map navigation"
			>
				<rect
					width={MAP_WIDTH}
					height={MAP_HEIGHT}
					fill="rgba(15, 23, 42, 0.8)"
					rx="4"
				/>
				<!-- Blocks on mini-map -->
				{#each blocks as block}
					{@const pos = toMapCoords(block.x, block.y)}
					{@const scale = getMapScale()}
					<rect
						x={pos.x}
						y={pos.y}
						width={Math.max(block.width * scale, 2)}
						height={Math.max(block.height * scale, 2)}
						fill={block.type === 'filing' ? '#22c55e' : block.type === 'cost' ? '#3b82f6' : '#a855f7'}
						opacity="0.7"
						rx="1"
					/>
				{/each}
				<!-- Connections on mini-map -->
				{#each connections as conn}
					{@const fromBlock = blocks.find(b => b.id === conn.fromBlockId)}
					{@const toBlock = blocks.find(b => b.id === conn.toBlockId)}
					{#if fromBlock && toBlock}
						{@const from = toMapCoords(fromBlock.x + fromBlock.width / 2, fromBlock.y + fromBlock.height)}
						{@const to = toMapCoords(toBlock.x + toBlock.width / 2, toBlock.y)}
						<line
							x1={from.x}
							y1={from.y}
							x2={to.x}
							y2={to.y}
							stroke="#64748b"
							stroke-width="1"
							opacity="0.5"
						/>
					{/if}
				{/each}
				<!-- Viewport indicator -->
				{#if canvasRef}
					{@const canvasRect = canvasRef.getBoundingClientRect()}
					{@const viewportX = -previewOffset.x / previewZoom}
					{@const viewportY = -previewOffset.y / previewZoom}
					{@const viewportW = canvasRect.width / previewZoom}
					{@const viewportH = canvasRect.height / previewZoom}
					{@const vpPos = toMapCoords(viewportX, viewportY)}
					{@const scale = getMapScale()}
					<rect
						x={vpPos.x}
						y={vpPos.y}
						width={viewportW * scale}
						height={viewportH * scale}
						fill="none"
						stroke="#22c55e"
						stroke-width="1.5"
						opacity="0.8"
					/>
				{/if}
			</svg>
		</div>
	{/if}

	<!-- Zoom indicator -->
	<div class="absolute bottom-4 right-4 rounded-md bg-slate-800/80 px-2 py-1 text-xs text-slate-400">
		{Math.round(previewZoom * 100)}%
	</div>

	<!-- Instructions -->
	<div class="absolute bottom-4 left-4 text-xs">
		<p class="rounded bg-slate-800/80 px-2 py-1 text-slate-500">
			Drag to pan | Scroll to zoom | Press F to fit
		</p>
	</div>

	<!-- Empty state -->
	{#if blocks.length === 0}
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-center">
				<p class="text-lg text-slate-500">No blocks in this strategy</p>
			</div>
		</div>
	{/if}
</div>
