<script lang="ts">
	import { strategyStudioStore } from '$lib/stores/strategy-studio.svelte';
	import { browser } from '$app/environment';

	// Mini-map dimensions
	const MAP_WIDTH = 150;
	const MAP_HEIGHT = 100;
	const SCALE = 0.05; // Scale factor from canvas to mini-map

	// Get window dimensions safely
	const windowWidth = $derived(browser ? window.innerWidth : 1200);
	const windowHeight = $derived(browser ? window.innerHeight : 800);

	// Calculate bounds of all blocks
	const bounds = $derived(() => {
		if (strategyStudioStore.blocks.length === 0) {
			return { minX: 0, minY: 0, maxX: 1000, maxY: 800 };
		}

		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for (const block of strategyStudioStore.blocks) {
			minX = Math.min(minX, block.x);
			minY = Math.min(minY, block.y);
			maxX = Math.max(maxX, block.x + block.width);
			maxY = Math.max(maxY, block.y + block.height);
		}

		// Add padding
		const padding = 100;
		return {
			minX: minX - padding,
			minY: minY - padding,
			maxX: maxX + padding,
			maxY: maxY + padding
		};
	});

	// Calculate scale to fit all blocks in mini-map
	const mapScale = $derived(() => {
		const b = bounds();
		const contentWidth = b.maxX - b.minX;
		const contentHeight = b.maxY - b.minY;
		return Math.min(MAP_WIDTH / contentWidth, MAP_HEIGHT / contentHeight, 0.1);
	});

	// Transform block position to mini-map coordinates
	function toMapCoords(x: number, y: number): { x: number; y: number } {
		const b = bounds();
		const scale = mapScale();
		return {
			x: (x - b.minX) * scale,
			y: (y - b.minY) * scale
		};
	}

	// Handle click on mini-map to navigate
	function handleClick(e: MouseEvent) {
		const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const clickY = e.clientY - rect.top;

		const b = bounds();
		const scale = mapScale();

		// Convert click to canvas coordinates
		const canvasX = clickX / scale + b.minX;
		const canvasY = clickY / scale + b.minY;

		// Center the view on this point
		strategyStudioStore.setCanvasOffset(
			-canvasX * strategyStudioStore.canvasZoom + windowWidth / 2,
			-canvasY * strategyStudioStore.canvasZoom + windowHeight / 2
		);
	}
</script>

<div class="absolute bottom-16 right-4 rounded-lg border border-white/20 bg-slate-900/90 p-1 shadow-lg backdrop-blur-sm">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<svg
		width={MAP_WIDTH}
		height={MAP_HEIGHT}
		class="cursor-pointer"
		onclick={handleClick}
		role="img"
		aria-label="Canvas mini-map navigation"
	>
		<!-- Background -->
		<rect
			width={MAP_WIDTH}
			height={MAP_HEIGHT}
			fill="rgba(15, 23, 42, 0.8)"
			rx="4"
		/>

		<!-- Blocks -->
		{#each strategyStudioStore.blocks as block}
			{@const pos = toMapCoords(block.x, block.y)}
			{@const scale = mapScale()}
			<rect
				x={pos.x}
				y={pos.y}
				width={block.width * scale}
				height={block.height * scale}
				fill={block.type === 'filing' ? '#22c55e' : block.type === 'cost' ? '#3b82f6' : '#a855f7'}
				opacity="0.7"
				rx="1"
			/>
		{/each}

		<!-- Connections -->
		{#each strategyStudioStore.connections as connection}
			{@const fromBlock = strategyStudioStore.blocks.find(b => b.id === connection.fromBlockId)}
			{@const toBlock = strategyStudioStore.blocks.find(b => b.id === connection.toBlockId)}
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
		{#if strategyStudioStore.blocks.length >= 0}
			{@const viewportX = (-strategyStudioStore.canvasOffset.x / strategyStudioStore.canvasZoom)}
			{@const viewportY = (-strategyStudioStore.canvasOffset.y / strategyStudioStore.canvasZoom)}
			{@const viewportW = windowWidth / strategyStudioStore.canvasZoom}
			{@const viewportH = windowHeight / strategyStudioStore.canvasZoom}
			{@const vpPos = toMapCoords(viewportX, viewportY)}
			{@const scale = mapScale()}
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
