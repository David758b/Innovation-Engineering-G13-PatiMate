<script lang="ts">
	import { strategyStudioStore, type StudioConnection } from '$lib/stores/strategy-studio.svelte';
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

	// Calculate path between blocks
	const path = $derived(() => {
		if (!sourceBlock || !targetBlock) return '';

		// Start from bottom center of source
		const startX = sourceBlock.x + sourceBlock.width / 2;
		const startY = sourceBlock.y + sourceBlock.height;

		// End at top center of target
		const endX = targetBlock.x + targetBlock.width / 2;
		const endY = targetBlock.y;

		// Create a curved bezier path
		const midY = (startY + endY) / 2;

		return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
	});

	// Calculate label position (middle of the path)
	const labelPos = $derived(() => {
		if (!sourceBlock || !targetBlock) return { x: 0, y: 0 };

		const startX = sourceBlock.x + sourceBlock.width / 2;
		const startY = sourceBlock.y + sourceBlock.height;
		const endX = targetBlock.x + targetBlock.width / 2;
		const endY = targetBlock.y;

		return {
			x: (startX + endX) / 2,
			y: (startY + endY) / 2
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
			transform="translate({targetBlock.x + targetBlock.width / 2}, {targetBlock.y}) rotate(180)"
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
