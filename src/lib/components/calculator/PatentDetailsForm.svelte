<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import type { TechnologyField } from '$lib/data/types';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { ChevronDown, ChevronUp, Upload, FileText, X } from '@lucide/svelte';

	let isExpanded = $state(false);

	// File upload state
	let uploadedFile = $state<File | null>(null);
	let isDragOver = $state(false);
	let fileInputRef = $state<HTMLInputElement | null>(null);

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

	function processFile(file: File) {
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
	}

	function handleRemoveFile() {
		uploadedFile = null;
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
						<FileText class="h-5 w-5 text-green-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-white">{uploadedFile.name}</p>
						<p class="text-xs text-slate-400">
							{getFileExtension(uploadedFile.name)} · {formatFileSize(uploadedFile.size)}
						</p>
					</div>
					<button
						type="button"
						onclick={handleRemoveFile}
						class="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
						title="Remove file"
					>
						<X class="h-4 w-4" />
					</button>
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
