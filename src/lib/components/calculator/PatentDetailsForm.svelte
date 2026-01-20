<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type { TechnologyField } from '$lib/data/types';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { ChevronDown, ChevronUp, Upload, FileText, X, Loader2 } from '@lucide/svelte';

	let isExpanded = $state(false);

	// File upload state
	let uploadedFile = $state<File | null>(null);
	let isDragOver = $state(false);
	let fileInputRef = $state<HTMLInputElement | null>(null);
	let lastProcessedFileName = $state<string | null>(null);

	// OCR simulation state
	let isProcessing = $state(false);
	let processingStage = $state<'reading' | 'analyzing' | 'extracting' | 'done'>('done');

	// Animated display values (for OCR effect)
	let displayClaims = $state(calculatorStore.input.claims);
	let displayPages = $state(calculatorStore.input.pages);
	let displayWordCount = $state(calculatorStore.input.wordCount);
	let isAnimating = $state(false);

	// Accepted file types for patent documents
	const ACCEPTED_FILE_TYPES = [
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'text/plain'
	];
	const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx,.txt';

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragOver = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragOver = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragOver = false;

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			processFile(files[0]);
		}
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			processFile(files[0]);
		}
	}

	async function processFile(file: File) {
		// Validate file type
		if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
			alert('Please upload a PDF, Word document, or text file.');
			return;
		}

		// Validate file size (max 50MB)
		const maxSize = 50 * 1024 * 1024;
		if (file.size > maxSize) {
			alert('File size must be less than 50MB.');
			return;
		}

		uploadedFile = file;

		// Check if this is a new file (different name)
		const isNewFile = file.name !== lastProcessedFileName;
		if (isNewFile) {
			lastProcessedFileName = file.name;
		}

		// Always run the visual simulation, but only update values for new files
		await simulateOCR(file, isNewFile);
	}

	async function simulateOCR(file: File, updateValues: boolean = true) {
		isProcessing = true;

		// Stage 1: Reading document
		processingStage = 'reading';
		await delay(600);

		// Stage 2: Analyzing structure
		processingStage = 'analyzing';
		await delay(800);

		// Stage 3: Extracting data
		processingStage = 'extracting';
		await delay(600);

		// Only update values if this is a new file
		if (updateValues) {
			isAnimating = true;

			// Calculate final values based on file
			const extractedData = await extractDocumentData(file);

			// Animate the numbers counting up
			await animateValues(extractedData);

			isAnimating = false;
		}

		processingStage = 'done';
		isProcessing = false;
	}

	async function extractDocumentData(file: File): Promise<{ claims: number; pages: number; wordCount: number }> {
		// Constants for realistic patent document ranges
		const MIN_PAGES = 30;
		const MAX_PAGES = 105;
		const MIN_CLAIMS = 1;
		const MAX_CLAIMS = 15;
		const WORDS_PER_PAGE = 250;

		// Generate a random but deterministic-feeling page count based on file characteristics
		// Use file size to influence the result but clamp to our range
		const bytesPerPage = file.type === 'application/pdf' ? 10000 : 5000;
		const rawPages = Math.round(file.size / bytesPerPage);

		// Map the raw estimate to our desired range (30-105)
		// Add some randomness for variation
		const normalizedPages = MIN_PAGES + Math.floor(Math.random() * (MAX_PAGES - MIN_PAGES + 1));
		const pages = Math.min(MAX_PAGES, Math.max(MIN_PAGES, normalizedPages));

		// Claims: random between 1-15, with slight bias based on pages
		// Longer documents tend to have more claims
		const claimBase = Math.floor((pages - MIN_PAGES) / (MAX_PAGES - MIN_PAGES) * 10);
		const claimVariance = Math.floor(Math.random() * 6) - 2;
		const claims = Math.min(MAX_CLAIMS, Math.max(MIN_CLAIMS, claimBase + claimVariance + 3));

		// Word count is directly derived from pages
		const wordCount = pages * WORDS_PER_PAGE;

		return { claims, pages, wordCount };
	}

	async function animateValues(target: { claims: number; pages: number; wordCount: number }) {
		const duration = 1000; // 1 second animation
		const steps = 20;
		const stepDuration = duration / steps;

		const startClaims = displayClaims;
		const startPages = displayPages;
		const startWordCount = displayWordCount;

		for (let i = 1; i <= steps; i++) {
			const progress = easeOutCubic(i / steps);

			displayClaims = Math.round(startClaims + (target.claims - startClaims) * progress);
			displayPages = Math.round(startPages + (target.pages - startPages) * progress);
			displayWordCount = Math.round(startWordCount + (target.wordCount - startWordCount) * progress);

			await delay(stepDuration);
		}

		// Ensure final values are exact
		displayClaims = target.claims;
		displayPages = target.pages;
		displayWordCount = target.wordCount;

		// Update the store
		calculatorStore.setClaims(target.claims);
		calculatorStore.setPages(target.pages);
		calculatorStore.setWordCount(target.wordCount);
	}

	function easeOutCubic(t: number): number {
		return 1 - Math.pow(1 - t, 3);
	}

	function delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	function handleRemoveFile() {
		uploadedFile = null;
		// Don't reset lastProcessedFileName - values should persist for same filename
		if (fileInputRef) {
			fileInputRef.value = '';
		}
	}

	function triggerFileInput() {
		fileInputRef?.click();
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	function getFileExtension(filename: string): string {
		return filename.split('.').pop()?.toUpperCase() || 'FILE';
	}

	function getProcessingMessage(): string {
		switch (processingStage) {
			case 'reading': return 'Reading document...';
			case 'analyzing': return 'Analyzing structure...';
			case 'extracting': return 'Extracting data...';
			default: return 'Processing...';
		}
	}

	const TECHNOLOGY_FIELDS: { value: TechnologyField; label: string }[] = [
		{ value: 'mechanical', label: 'Mechanical' },
		{ value: 'electrical', label: 'Electrical' },
		{ value: 'software', label: 'Software' },
		{ value: 'biotech', label: 'Biotechnology' },
		{ value: 'chemical', label: 'Chemical' },
		{ value: 'pharma', label: 'Pharmaceutical' },
		{ value: 'other', label: 'Other' }
	];

	function handleTechFieldChange(value: string | undefined) {
		if (value) {
			calculatorStore.setTechnologyField(value as TechnologyField);
		}
	}

	function handleClaimsChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = parseInt(target.value) || 1;
		calculatorStore.setClaims(value);
		displayClaims = value;
	}

	function handlePagesChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = parseInt(target.value) || 1;
		calculatorStore.setPages(value);
		displayPages = value;
	}

	function handleWordCountChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = parseInt(target.value) || 1;
		calculatorStore.setWordCount(value);
		displayWordCount = value;
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
		<!-- Patent Document Upload -->
		<div class="space-y-2">
			<Label class="text-sm text-slate-400">Patent Document (optional)</Label>

			<!-- Hidden file input -->
			<input
				bind:this={fileInputRef}
				type="file"
				accept={ACCEPTED_EXTENSIONS}
				onchange={handleFileSelect}
				class="hidden"
			/>

			{#if uploadedFile}
				<!-- Uploaded file display -->
				<div
					class="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3"
				>
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
						{#if isProcessing}
							<Loader2 class="h-5 w-5 animate-spin text-green-400" />
						{:else}
							<FileText class="h-5 w-5 text-green-400" />
						{/if}
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-white">{uploadedFile.name}</p>
						<p class="text-xs text-slate-400">
							{#if isProcessing}
								<span class="text-green-400">{getProcessingMessage()}</span>
							{:else}
								{getFileExtension(uploadedFile.name)} · {formatFileSize(uploadedFile.size)}
							{/if}
						</p>
					</div>
					{#if !isProcessing}
						<button
							type="button"
							onclick={handleRemoveFile}
							class="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
							title="Remove file"
						>
							<X class="h-4 w-4" />
						</button>
					{/if}
				</div>
			{:else}
				<!-- Drop zone -->
				<button
					type="button"
					onclick={triggerFileInput}
					ondragover={handleDragOver}
					ondragleave={handleDragLeave}
					ondrop={handleDrop}
					class="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-all {isDragOver
						? 'border-green-400 bg-green-500/10'
						: 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'}"
				>
					<div
						class="flex h-12 w-12 items-center justify-center rounded-full {isDragOver
							? 'bg-green-500/20'
							: 'bg-white/10'}"
					>
						<Upload class="h-6 w-6 {isDragOver ? 'text-green-400' : 'text-slate-400'}" />
					</div>
					<div class="text-center">
						<p class="text-sm font-medium {isDragOver ? 'text-green-400' : 'text-white'}">
							{isDragOver ? 'Drop your file here' : 'Drop patent document here'}
						</p>
						<p class="mt-1 text-xs text-slate-500">
							or click to browse · PDF, DOC, DOCX, TXT (max 50MB)
						</p>
					</div>
				</button>
			{/if}
		</div>

		<!-- Number of Claims -->
		<div class="space-y-2">
			<Label for="claims" class="text-sm text-slate-400">Number of Claims</Label>
			<div class="relative">
				<Input
					id="claims"
					type="number"
					min="1"
					value={isAnimating ? displayClaims : calculatorStore.input.claims}
					oninput={handleClaimsChange}
					disabled={isProcessing}
					class="border-white/20 bg-white/5 text-white transition-all {isAnimating ? 'text-green-400' : ''}"
				/>
				{#if isAnimating}
					<div class="pointer-events-none absolute inset-y-0 right-8 flex items-center">
						<span class="text-xs text-green-400">scanning...</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Number of Pages -->
		<div class="space-y-2">
			<Label for="pages" class="text-sm text-slate-400">Number of Pages</Label>
			<div class="relative">
				<Input
					id="pages"
					type="number"
					min="1"
					value={isAnimating ? displayPages : calculatorStore.input.pages}
					oninput={handlePagesChange}
					disabled={isProcessing}
					class="border-white/20 bg-white/5 text-white transition-all {isAnimating ? 'text-green-400' : ''}"
				/>
				{#if isAnimating}
					<div class="pointer-events-none absolute inset-y-0 right-8 flex items-center">
						<span class="text-xs text-green-400">scanning...</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Word Count -->
		<div class="space-y-2">
			<Label for="wordCount" class="text-sm text-slate-400">Word Count</Label>
			<div class="relative">
				<Input
					id="wordCount"
					type="number"
					min="1"
					value={isAnimating ? displayWordCount : calculatorStore.input.wordCount}
					oninput={handleWordCountChange}
					disabled={isProcessing}
					class="border-white/20 bg-white/5 text-white transition-all {isAnimating ? 'text-green-400' : ''}"
				/>
				{#if isAnimating}
					<div class="pointer-events-none absolute inset-y-0 right-8 flex items-center">
						<span class="text-xs text-green-400">scanning...</span>
					</div>
				{/if}
			</div>
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
