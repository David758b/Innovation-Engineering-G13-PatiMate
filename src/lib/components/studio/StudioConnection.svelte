<script lang="ts">
	import { strategyStudioStore, type StudioConnection, type ConnectionPort, type StudioBlock } from '$lib/stores/strategy-studio.svelte';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	interface Props {
		connection: StudioConnection;
		readonly?: boolean;
	}

	let { connection, readonly = false }: Props = $props();

	const isSelected = $derived(!readonly && strategyStudioStore.selectedConnectionId === connection.id);
	let isHovered = $state(false);
	let pathLength = $state(0);
	let isAnimating = $state(true);
	let pathElement: SVGPathElement | null = $state(null);

	// Animate the connection drawing on mount
	onMount(() => {
		if (pathElement) {
			pathLength = pathElement.getTotalLength();
		}
		// Remove animation class after it completes
		const timer = setTimeout(() => {
			isAnimating = false;
		}, 500);
		return () => clearTimeout(timer);
	});

	// Find source and target blocks
	const sourceBlock = $derived(strategyStudioStore.blocks.find(b => b.id === connection.fromBlockId));
	const targetBlock = $derived(strategyStudioStore.blocks.find(b => b.id === connection.toBlockId));

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

	// Calculate path between blocks based on their ports
	const path = $derived(() => {
		if (!sourceBlock || !targetBlock) return '';

		const fromPort = connection.fromPort || 'bottom';
		const toPort = connection.toPort || 'top';

		const start = getPortPosition(sourceBlock, fromPort);
		const end = getPortPosition(targetBlock, toPort);

		// Calculate distance for control points
		const dx = Math.abs(end.x - start.x);
		const dy = Math.abs(end.y - start.y);
		const controlDistance = Math.max(50, Math.min(150, Math.max(dx, dy) / 2));

		// Get control point offsets based on port directions
		const startOffset = getControlOffset(fromPort, controlDistance);
		const endOffset = getControlOffset(toPort, controlDistance);

		// Control points
		const cp1x = start.x + startOffset.dx;
		const cp1y = start.y + startOffset.dy;
		const cp2x = end.x + endOffset.dx;
		const cp2y = end.y + endOffset.dy;

		return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
	});

	// Get arrow rotation based on target port
	function getArrowRotation(port: ConnectionPort): number {
		switch (port) {
			case 'top':
				return 180; // Arrow points down into top
			case 'bottom':
				return 0; // Arrow points up into bottom
			case 'left':
				return 90; // Arrow points right into left
			case 'right':
				return -90; // Arrow points left into right
		}
	}

	// Get arrow position (at the target port)
	const arrowPos = $derived(() => {
		if (!targetBlock) return { x: 0, y: 0, rotation: 0 };
		const toPort = connection.toPort || 'top';
		const pos = getPortPosition(targetBlock, toPort);
		return { ...pos, rotation: getArrowRotation(toPort) };
	});

	// Calculate label position (middle of the path)
	const labelPos = $derived(() => {
		if (!sourceBlock || !targetBlock) return { x: 0, y: 0 };

		const fromPort = connection.fromPort || 'bottom';
		const toPort = connection.toPort || 'top';

		const start = getPortPosition(sourceBlock, fromPort);
		const end = getPortPosition(targetBlock, toPort);

		return {
			x: (start.x + end.x) / 2,
			y: (start.y + end.y) / 2
		};
	});

	function handleMouseDown(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
	}

	function handleClick(e: MouseEvent) {
		if (readonly) return;
		e.stopPropagation();
		strategyStudioStore.selectConnection(connection.id);
	}

	function handleDelete(e: MouseEvent) {
		if (readonly) return;
		e.stopPropagation();
		e.preventDefault();
		strategyStudioStore.deleteConnection(connection.id);
	}

	function handleMouseEnter() {
		if (!readonly) {
			isHovered = true;
		}
	}

	function handleMouseLeave() {
		isHovered = false;
	}
</script>

{#if sourceBlock && targetBlock}
	<!-- Connection path -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<g
		class="pointer-events-auto"
		class:cursor-pointer={!readonly}
		role="button"
		tabindex="0"
		onmousedown={handleMouseDown}
		onclick={handleClick}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		out:fade={{ duration: 150 }}
	>
		<!-- Invisible wider path for easier clicking (only in edit mode) -->
		{#if !readonly}
			<path
				d={path()}
				stroke="transparent"
				stroke-width="20"
				fill="none"
			/>
		{/if}
		<!-- Visible path with draw animation -->
		<path
			bind:this={pathElement}
			d={path()}
			stroke={isSelected ? '#22c55e' : isHovered ? '#94a3b8' : '#64748b'}
			stroke-width={isSelected ? 3 : isHovered ? 2.5 : 2}
			stroke-dasharray={isAnimating ? pathLength : (connection.style === 'dashed' ? '8,4' : 'none')}
			stroke-dashoffset={isAnimating ? pathLength : 0}
			fill="none"
			class="transition-all duration-300"
			style={isAnimating ? `animation: drawLine 0.4s ease-out forwards;` : ''}
		/>
		<!-- Arrow head -->
		<polygon
			points="-6,-8 0,0 6,-8"
			fill={isSelected ? '#22c55e' : isHovered ? '#94a3b8' : '#64748b'}
			transform="translate({arrowPos().x}, {arrowPos().y}) rotate({arrowPos().rotation})"
			class="transition-all duration-300"
			style={isAnimating ? 'opacity: 0; animation: fadeIn 0.2s ease-out 0.3s forwards;' : ''}
		/>
	</g>

	<!-- Delete button (appears on hover or when selected) - hidden in readonly mode -->
	{#if !readonly && (isHovered || isSelected)}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<g
			class="pointer-events-auto cursor-pointer"
			role="button"
			onmousedown={handleMouseDown}
			onclick={handleDelete}
		>
			<circle
				cx={labelPos().x + 35}
				cy={labelPos().y}
				r="10"
				fill="#ef4444"
				class="transition-opacity"
			/>
			<!-- X icon -->
			<path
				d="M {labelPos().x + 32} {labelPos().y - 3} L {labelPos().x + 38} {labelPos().y + 3} M {labelPos().x + 38} {labelPos().y - 3} L {labelPos().x + 32} {labelPos().y + 3}"
				stroke="white"
				stroke-width="2"
				stroke-linecap="round"
			/>
		</g>
	{/if}

	<!-- Label -->
	{#if connection.label}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<g
			onmousedown={handleMouseDown}
			onclick={handleClick}
			onmouseenter={handleMouseEnter}
			onmouseleave={handleMouseLeave}
			class="pointer-events-auto"
			class:cursor-pointer={!readonly}
			role="button"
		>
			<rect
				x={labelPos().x - 30}
				y={labelPos().y - 10}
				width="60"
				height="20"
				rx="4"
				fill={isSelected ? 'rgba(34, 197, 94, 0.2)' : 'rgba(30, 41, 59, 0.9)'}
				stroke={isSelected ? '#22c55e' : isHovered ? '#94a3b8' : '#475569'}
				stroke-width="1"
			/>
			<text
				x={labelPos().x}
				y={labelPos().y + 4}
				text-anchor="middle"
				fill={isSelected ? '#22c55e' : '#94a3b8'}
				font-size="11"
				font-family="system-ui"
			>
				{connection.label}
			</text>
		</g>
	{/if}
{/if}

<style>
	@keyframes -global-drawLine {
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes -global-fadeIn {
		to {
			opacity: 1;
		}
	}
</style>
