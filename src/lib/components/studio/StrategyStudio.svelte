<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { strategyStudioStore, BLOCK_TEMPLATES, type StudioBlock } from '$lib/stores/strategy-studio.svelte';
	import { ArrowLeft, Plus, Save, Trash2, FileText, DollarSign, Puzzle, GripVertical, Undo2, Redo2, Grid3x3, LayoutGrid, Download, Image, FileType, FileDown, ChevronDown, X, Eye, Pencil } from '@lucide/svelte';
	import StudioCanvas from './StudioCanvas.svelte';
	import StudioPreviewCanvas from './StudioPreviewCanvas.svelte';
	import StudioPropertiesPanel from './StudioPropertiesPanel.svelte';
	import StudioMiniMap from './StudioMiniMap.svelte';

	interface Props {
		onBack: () => void;
	}

	let { onBack }: Props = $props();

	let strategyName = $state('');
	let showSaveDialog = $state(false);
	let showExportMenu = $state(false);

	// Group templates by type
	const filingBlocks = BLOCK_TEMPLATES.filter(b => b.type === 'filing');
	const costBlocks = BLOCK_TEMPLATES.filter(b => b.type === 'cost');
	const customBlocks = BLOCK_TEMPLATES.filter(b => b.type === 'custom');

	let draggedTemplate = $state<typeof BLOCK_TEMPLATES[0] | null>(null);

	function handleDragStart(template: typeof BLOCK_TEMPLATES[0]) {
		draggedTemplate = template;
	}

	function handleDragEnd() {
		draggedTemplate = null;
	}

	function handleSaveStrategy() {
		if (strategyName.trim()) {
			strategyStudioStore.saveAsStrategy(strategyName.trim());
			strategyName = '';
			showSaveDialog = false;
		}
	}

	function handleNewCanvas() {
		strategyStudioStore.clearCanvas();
	}

	function handleLoadDirect() {
		strategyStudioStore.loadTemplate('direct');
	}

	function handleLoadPCT() {
		strategyStudioStore.loadTemplate('pct');
	}

	const hasBlocks = $derived(strategyStudioStore.blocks.length > 0);
	const selectedBlock = $derived(strategyStudioStore.selectedBlock);
	const selectedConnection = $derived(strategyStudioStore.selectedConnection);
	const isPreviewMode = $derived(strategyStudioStore.isPreviewMode);
	const previewingStrategy = $derived(strategyStudioStore.previewingStrategy);

	// Export functions
	async function exportToPNG() {
		showExportMenu = false;
		const { exportCanvasToPNG } = await import('$lib/utils/canvas-export');
		exportCanvasToPNG();
	}

	async function exportToSVG() {
		showExportMenu = false;
		const { exportCanvasToSVG } = await import('$lib/utils/canvas-export');
		exportCanvasToSVG();
	}

	async function exportToPDF() {
		showExportMenu = false;
		const { exportCanvasToPDF } = await import('$lib/utils/canvas-export');
		exportCanvasToPDF();
	}

	function toggleExportMenu() {
		showExportMenu = !showExportMenu;
	}

	function closeExportMenu() {
		showExportMenu = false;
	}
</script>

<div class="flex min-h-screen flex-col bg-slate-950">
	<!-- Header with breadcrumb -->
	<header class="flex items-center justify-between border-b border-white/10 px-4 py-3">
		<div class="flex items-center gap-3">
			<button
				onclick={onBack}
				class="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
			>
				<ArrowLeft class="h-4 w-4" />
				<span class="text-sm">Calculator</span>
			</button>
			<span class="text-slate-600">/</span>
			<span class="text-sm font-medium text-white">Strategy Studio</span>
		</div>

		<div class="flex items-center gap-2">
			{#if showSaveDialog}
				<div class="flex items-center gap-2">
					<Input
						placeholder="Strategy name..."
						bind:value={strategyName}
						class="h-8 w-48 border-white/20 bg-white/5 text-sm text-white"
					/>
					<Button size="sm" onclick={handleSaveStrategy} class="bg-green-600 hover:bg-green-500">
						Save
					</Button>
					<Button size="sm" variant="ghost" onclick={() => showSaveDialog = false}>
						Cancel
					</Button>
				</div>
			{:else}
				<!-- Toolbar -->
				<div class="mr-2 flex items-center gap-1 border-r border-white/10 pr-2">
					<Button
						size="sm"
						variant="ghost"
						onclick={() => strategyStudioStore.undo()}
						disabled={!strategyStudioStore.canUndo}
						class="h-8 w-8 p-0 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
						title="Undo (Ctrl+Z)"
					>
						<Undo2 class="h-4 w-4" />
					</Button>
					<Button
						size="sm"
						variant="ghost"
						onclick={() => strategyStudioStore.redo()}
						disabled={!strategyStudioStore.canRedo}
						class="h-8 w-8 p-0 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
						title="Redo (Ctrl+Y)"
					>
						<Redo2 class="h-4 w-4" />
					</Button>
				</div>

				<div class="mr-2 flex items-center gap-1 border-r border-white/10 pr-2">
					<Button
						size="sm"
						variant="ghost"
						onclick={() => strategyStudioStore.toggleSnap()}
						class="h-8 w-8 p-0 hover:bg-white/10 {strategyStudioStore.snapEnabled ? 'text-green-400' : 'text-slate-500'}"
						title="Toggle grid snap"
					>
						<Grid3x3 class="h-4 w-4" />
					</Button>
					<Button
						size="sm"
						variant="ghost"
						onclick={() => strategyStudioStore.autoLayout()}
						disabled={!hasBlocks}
						class="h-8 w-8 p-0 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
						title="Auto-layout"
					>
						<LayoutGrid class="h-4 w-4" />
					</Button>
				</div>

				<div class="relative mr-2 flex items-center gap-1 border-r border-white/10 pr-2">
					<Button
						size="sm"
						variant="ghost"
						disabled={!hasBlocks}
						onclick={toggleExportMenu}
						class="h-8 gap-1 px-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30"
					>
						<Download class="h-4 w-4" />
						<span class="text-xs">Export</span>
						<ChevronDown class="h-3 w-3" />
					</Button>

					{#if showExportMenu}
						<!-- Backdrop to close menu -->
						<button
							class="fixed inset-0 z-40"
							onclick={closeExportMenu}
							aria-label="Close menu"
						></button>

						<!-- Dropdown menu -->
						<div class="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border border-white/20 bg-slate-800 py-1 shadow-lg">
							<button
								onclick={exportToPNG}
								class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700"
							>
								<Image class="h-4 w-4" />
								Export as PNG
							</button>
							<button
								onclick={exportToSVG}
								class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700"
							>
								<FileType class="h-4 w-4" />
								Export as SVG
							</button>
							<button
								onclick={exportToPDF}
								class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700"
							>
								<FileDown class="h-4 w-4" />
								Export as PDF
							</button>
						</div>
					{/if}
				</div>

				<Button
					size="sm"
					variant="outline"
					onclick={handleNewCanvas}
					class="border-white/20 text-slate-300 hover:bg-white/10"
				>
					<Plus class="mr-1 h-4 w-4" />
					New
				</Button>
				<Button
					size="sm"
					variant="outline"
					onclick={() => showSaveDialog = true}
					disabled={!hasBlocks}
					class="border-white/20 text-slate-300 hover:bg-white/10"
				>
					<Save class="mr-1 h-4 w-4" />
					Save
				</Button>
			{/if}
		</div>
	</header>

	<!-- Main content -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Left Palette -->
		<aside class="w-64 flex-shrink-0 overflow-y-auto border-r border-white/10 bg-slate-900/50 p-4">
			<div class="mb-4">
				<h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
					Templates
				</h3>
				<div class="flex gap-2">
					<Button
						size="sm"
						variant="outline"
						onclick={handleLoadDirect}
						class="flex-1 border-white/20 text-xs text-slate-300 hover:bg-white/10"
					>
						Direct
					</Button>
					<Button
						size="sm"
						variant="outline"
						onclick={handleLoadPCT}
						class="flex-1 border-white/20 text-xs text-slate-300 hover:bg-white/10"
					>
						PCT
					</Button>
				</div>
			</div>

			<!-- Filing Steps -->
			<div class="mb-4">
				<h3 class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
					<FileText class="h-3 w-3" />
					Filing Steps
				</h3>
				<div class="space-y-1">
					{#each filingBlocks as template}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							draggable="true"
							ondragstart={() => handleDragStart(template)}
							ondragend={handleDragEnd}
							class="flex cursor-grab items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-green-500/50 hover:bg-green-500/10 active:cursor-grabbing"
						>
							<GripVertical class="h-3 w-3 text-slate-600" />
							<span>{template.label}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Cost Items -->
			<div class="mb-4">
				<h3 class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
					<DollarSign class="h-3 w-3" />
					Cost Items
				</h3>
				<div class="space-y-1">
					{#each costBlocks as template}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							draggable="true"
							ondragstart={() => handleDragStart(template)}
							ondragend={handleDragEnd}
							class="flex cursor-grab items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-blue-500/50 hover:bg-blue-500/10 active:cursor-grabbing"
						>
							<GripVertical class="h-3 w-3 text-slate-600" />
							<span>{template.label}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Custom Blocks -->
			<div class="mb-4">
				<h3 class="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
					<Puzzle class="h-3 w-3" />
					Custom
				</h3>
				<div class="space-y-1">
					{#each customBlocks as template}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							draggable="true"
							ondragstart={() => handleDragStart(template)}
							ondragend={handleDragEnd}
							class="flex cursor-grab items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-purple-500/50 hover:bg-purple-500/10 active:cursor-grabbing"
						>
							<GripVertical class="h-3 w-3 text-slate-600" />
							<span>{template.label}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Saved Strategies -->
			{#if strategyStudioStore.customStrategies.length > 0}
				<div>
					<h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
						Saved Strategies
					</h3>
					<div class="space-y-1">
						{#each strategyStudioStore.customStrategies as strategy}
							{@const isCurrentPreview = strategyStudioStore.previewingStrategyId === strategy.id}
							<div class="flex items-center justify-between rounded-md border px-3 py-2 transition-colors {isCurrentPreview ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}">
								<button
									onclick={() => strategyStudioStore.previewStrategy(strategy.id)}
									class="flex items-center gap-2 text-sm {isCurrentPreview ? 'text-blue-400' : 'text-slate-300 hover:text-white'}"
								>
									<Eye class="h-3 w-3" />
									{strategy.name}
								</button>
								<button
									onclick={() => strategyStudioStore.deleteStrategy(strategy.id)}
									class="text-slate-500 hover:text-red-400"
								>
									<Trash2 class="h-3 w-3" />
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</aside>

		<!-- Canvas -->
		<div class="relative flex-1 overflow-hidden">
			{#if isPreviewMode && previewingStrategy}
				<!-- Preview Mode -->
				<StudioPreviewCanvas
					blocks={previewingStrategy.blocks}
					connections={previewingStrategy.connections}
				/>
				<!-- Preview header overlay -->
				<div class="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-white/10 bg-slate-900/95 px-4 py-2 backdrop-blur-sm">
					<div class="flex items-center gap-3">
						<Eye class="h-4 w-4 text-blue-400" />
						<span class="text-sm font-medium text-white">{previewingStrategy.name}</span>
						<span class="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">Preview</span>
					</div>
					<div class="flex items-center gap-2">
						<Button
							size="sm"
							onclick={() => strategyStudioStore.editPreviewedStrategy()}
							class="bg-green-600 hover:bg-green-500"
						>
							<Pencil class="mr-1 h-3 w-3" />
							Edit
						</Button>
						<Button
							size="sm"
							variant="ghost"
							onclick={() => strategyStudioStore.closePreview()}
							class="text-slate-400 hover:bg-white/10 hover:text-white"
						>
							<X class="h-4 w-4" />
						</Button>
					</div>
				</div>
			{:else}
				<!-- Edit Mode -->
				<StudioCanvas {draggedTemplate} onDragEnd={handleDragEnd} />
				<!-- Mini-map -->
				{#if hasBlocks}
					<StudioMiniMap />
				{/if}
			{/if}
		</div>

		<!-- Right Properties Panel (hidden in preview mode) -->
		{#if !isPreviewMode && (selectedBlock || selectedConnection)}
			<aside class="w-72 flex-shrink-0 overflow-y-auto border-l border-white/10 bg-slate-900/50">
				<StudioPropertiesPanel />
			</aside>
		{/if}
	</div>
</div>
