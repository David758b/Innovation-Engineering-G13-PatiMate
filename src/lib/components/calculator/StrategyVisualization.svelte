<script lang="ts">
	import { Flag } from '$lib/components/ui/flag';
	import * as Select from '$lib/components/ui/select';
	import { calculatorStore } from '$lib/stores/calculator.svelte';
	import { COUNTRIES } from '$lib/data/countries';
	import { ChevronDown, ChevronRight, DollarSign, Clock, AlertCircle } from '@lucide/svelte';

	// Get selected countries with their full data
	const selectedCountries = $derived(
		calculatorStore.input.countries
			.map((code) => COUNTRIES.find((c) => c.code === code))
			.filter((c) => c !== undefined)
	);

	// Currently viewed country
	let selectedCountryCode = $state<string | null>(null);

	// Auto-select first country when countries change
	$effect(() => {
		if (selectedCountries.length > 0 && !selectedCountryCode) {
			selectedCountryCode = selectedCountries[0].code;
		}
		if (selectedCountryCode && !calculatorStore.input.countries.includes(selectedCountryCode)) {
			selectedCountryCode = selectedCountries[0]?.code || null;
		}
	});

	const selectedCountry = $derived(
		selectedCountries.find((c) => c.code === selectedCountryCode)
	);

	const filingStrategy = $derived(calculatorStore.input.filingStrategy);

	// Track which nodes are expanded
	let expandedNodes = $state<Set<string>>(new Set());

	function toggleNode(nodeId: string) {
		if (expandedNodes.has(nodeId)) {
			expandedNodes.delete(nodeId);
			expandedNodes = new Set(expandedNodes);
		} else {
			expandedNodes.add(nodeId);
			expandedNodes = new Set(expandedNodes);
		}
	}

	function isExpanded(nodeId: string): boolean {
		return expandedNodes.has(nodeId);
	}

	// Country-specific cost data (realistic estimates in USD)
	interface CountryCostData {
		officialFiling: number;
		officialExam: number;
		officialGrant: number;
		translation: number; // per page estimate * ~30 pages
		localAttorney: number;
		pctNationalPhase: number;
		pctDeadlineMonths: number;
		language: string;
		examRequestDeadline: string;
		avgExamTime: string;
	}

	const countryCosts: Record<string, CountryCostData> = {
		US: {
			officialFiling: 320,
			officialExam: 800,
			officialGrant: 1200,
			translation: 0,
			localAttorney: 2500,
			pctNationalPhase: 1200,
			pctDeadlineMonths: 30,
			language: 'English',
			examRequestDeadline: 'Automatic',
			avgExamTime: '18-24 months'
		},
		EP: {
			officialFiling: 280,
			officialExam: 1900,
			officialGrant: 1000,
			translation: 0, // Filing in English, validation costs separate
			localAttorney: 3500,
			pctNationalPhase: 1500,
			pctDeadlineMonths: 31,
			language: 'EN/DE/FR',
			examRequestDeadline: '6 months from search',
			avgExamTime: '24-36 months'
		},
		CN: {
			officialFiling: 150,
			officialExam: 400,
			officialGrant: 300,
			translation: 2500,
			localAttorney: 1500,
			pctNationalPhase: 800,
			pctDeadlineMonths: 30,
			language: 'Chinese',
			examRequestDeadline: '3 years',
			avgExamTime: '18-24 months'
		},
		JP: {
			officialFiling: 200,
			officialExam: 600,
			officialGrant: 400,
			translation: 3000,
			localAttorney: 2500,
			pctNationalPhase: 1000,
			pctDeadlineMonths: 30,
			language: 'Japanese',
			examRequestDeadline: '3 years',
			avgExamTime: '12-18 months'
		},
		KR: {
			officialFiling: 180,
			officialExam: 450,
			officialGrant: 350,
			translation: 2200,
			localAttorney: 1800,
			pctNationalPhase: 900,
			pctDeadlineMonths: 31,
			language: 'Korean',
			examRequestDeadline: '3 years',
			avgExamTime: '12-18 months'
		},
		IN: {
			officialFiling: 80,
			officialExam: 200,
			officialGrant: 150,
			translation: 0,
			localAttorney: 1200,
			pctNationalPhase: 600,
			pctDeadlineMonths: 31,
			language: 'English',
			examRequestDeadline: '48 months',
			avgExamTime: '24-48 months'
		},
		AU: {
			officialFiling: 250,
			officialExam: 450,
			officialGrant: 350,
			translation: 0,
			localAttorney: 2000,
			pctNationalPhase: 900,
			pctDeadlineMonths: 31,
			language: 'English',
			examRequestDeadline: '5 years',
			avgExamTime: '12-18 months'
		},
		CA: {
			officialFiling: 280,
			officialExam: 600,
			officialGrant: 400,
			translation: 0,
			localAttorney: 2200,
			pctNationalPhase: 1000,
			pctDeadlineMonths: 30,
			language: 'EN/FR',
			examRequestDeadline: '4 years',
			avgExamTime: '24-30 months'
		},
		BR: {
			officialFiling: 100,
			officialExam: 200,
			officialGrant: 150,
			translation: 1800,
			localAttorney: 1500,
			pctNationalPhase: 700,
			pctDeadlineMonths: 30,
			language: 'Portuguese',
			examRequestDeadline: '36 months',
			avgExamTime: '48-72 months'
		},
		NZ: {
			officialFiling: 200,
			officialExam: 400,
			officialGrant: 300,
			translation: 0,
			localAttorney: 1800,
			pctNationalPhase: 800,
			pctDeadlineMonths: 31,
			language: 'English',
			examRequestDeadline: '5 years',
			avgExamTime: '12-18 months'
		},
		ZA: {
			officialFiling: 120,
			officialExam: 0, // No substantive examination
			officialGrant: 100,
			translation: 0,
			localAttorney: 1000,
			pctNationalPhase: 500,
			pctDeadlineMonths: 31,
			language: 'English',
			examRequestDeadline: 'N/A (no exam)',
			avgExamTime: '3-6 months'
		}
	};

	const currentCountryCosts = $derived(
		selectedCountryCode ? countryCosts[selectedCountryCode] : null
	);

	// PCT International Phase costs (one-time, regardless of countries)
	const pctInternationalCosts = {
		internationalFilingFee: 1600, // ~1435 CHF
		searchFee: 2200, // USPTO as ISA
		transmittalFee: 280,
		attorney: 3500,
		get total() {
			return this.internationalFilingFee + this.searchFee + this.transmittalFee + this.attorney;
		}
	};

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}
</script>

<div class="space-y-4">
	<!-- Country Selector -->
	{#if selectedCountries.length > 0}
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<span class="text-sm text-slate-400">View costs for:</span>
				<Select.Root
					type="single"
					value={selectedCountryCode || ''}
					onValueChange={(v) => selectedCountryCode = v}
				>
					<Select.Trigger class="w-48 border-white/20 bg-white/5 text-white">
						{#if selectedCountry}
							<span class="flex items-center gap-2">
								<Flag code={selectedCountry.code} />
								<span>{selectedCountry.name}</span>
							</span>
						{:else}
							Select country
						{/if}
					</Select.Trigger>
					<Select.Content class="border-white/20 bg-slate-800">
						{#each selectedCountries as country}
							<Select.Item value={country.code} class="text-slate-300 hover:bg-slate-700">
								<span class="flex items-center gap-2">
									<Flag code={country.code} />
									<span>{country.name}</span>
								</span>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	{/if}

	<!-- Cost Flowchart -->
	{#if selectedCountry && currentCountryCosts}
		<div class="rounded-lg border border-white/10 bg-white/5 p-5">

			{#if filingStrategy === 'direct'}
				<!-- DIRECT FILING FLOWCHART -->
				<div class="space-y-3">
					<!-- Stage 1: Priority Filing -->
					<div class="cost-node">
						<button class="node-header" onclick={() => toggleNode('d-priority')}>
							<div class="node-timeline">
								<span class="timeline-badge">Month 0</span>
							</div>
							<div class="node-main">
								<h4 class="node-title">Priority Application (Home Country)</h4>
								<div class="node-cost-preview">
									<span class="text-slate-400">Est.</span>
									<span class="text-green-400 font-semibold">{formatCurrency(3500)}</span>
								</div>
							</div>
							<div class="node-expand">
								{#if isExpanded('d-priority')}
									<ChevronDown class="h-4 w-4 text-slate-500" />
								{:else}
									<ChevronRight class="h-4 w-4 text-slate-500" />
								{/if}
							</div>
						</button>
						{#if isExpanded('d-priority')}
							<div class="node-details">
								<div class="cost-breakdown">
									<div class="cost-row">
										<span>Official fees</span>
										<span>{formatCurrency(320)}</span>
									</div>
									<div class="cost-row">
										<span>Attorney (drafting & filing)</span>
										<span>{formatCurrency(3000)}</span>
									</div>
									<div class="cost-row">
										<span>Drawings</span>
										<span>{formatCurrency(180)}</span>
									</div>
								</div>
							</div>
						{/if}
					</div>

					<!-- Arrow with deadline -->
					<div class="flow-arrow">
						<div class="arrow-line"></div>
						<div class="deadline-badge deadline-warning">
							<Clock class="h-3 w-3" />
							<span>12 month deadline</span>
						</div>
					</div>

					<!-- Stage 2: National Filing -->
					<div class="cost-node">
						<button class="node-header" onclick={() => toggleNode('d-national')}>
							<div class="node-timeline">
								<span class="timeline-badge">Month 12</span>
							</div>
							<div class="node-main">
								<h4 class="node-title">File in {selectedCountry.name}</h4>
								<div class="node-cost-preview">
									<span class="text-slate-400">Est.</span>
									<span class="text-green-400 font-semibold">
										{formatCurrency(currentCountryCosts.officialFiling + currentCountryCosts.translation + currentCountryCosts.localAttorney)}
									</span>
								</div>
							</div>
							<div class="node-expand">
								{#if isExpanded('d-national')}
									<ChevronDown class="h-4 w-4 text-slate-500" />
								{:else}
									<ChevronRight class="h-4 w-4 text-slate-500" />
								{/if}
							</div>
						</button>
						{#if isExpanded('d-national')}
							<div class="node-details">
								<div class="cost-breakdown">
									<div class="cost-row">
										<span>Official filing fee</span>
										<span>{formatCurrency(currentCountryCosts.officialFiling)}</span>
									</div>
									{#if currentCountryCosts.translation > 0}
										<div class="cost-row">
											<span>Translation ({currentCountryCosts.language})</span>
											<span>{formatCurrency(currentCountryCosts.translation)}</span>
										</div>
									{/if}
									<div class="cost-row">
										<span>Local attorney</span>
										<span>{formatCurrency(currentCountryCosts.localAttorney)}</span>
									</div>
								</div>
								<div class="node-meta">
									<span>Language: {currentCountryCosts.language}</span>
								</div>
							</div>
						{/if}
					</div>

					<!-- Arrow -->
					<div class="flow-arrow">
						<div class="arrow-line"></div>
						<div class="deadline-badge">
							<span>Exam request: {currentCountryCosts.examRequestDeadline}</span>
						</div>
					</div>

					<!-- Stage 3: Examination -->
					<div class="cost-node">
						<button class="node-header" onclick={() => toggleNode('d-exam')}>
							<div class="node-timeline">
								<span class="timeline-badge timeline-variable">Variable</span>
							</div>
							<div class="node-main">
								<h4 class="node-title">Examination & Prosecution</h4>
								<div class="node-cost-preview">
									<span class="text-slate-400">Est.</span>
									<span class="text-green-400 font-semibold">
										{formatCurrency(currentCountryCosts.officialExam + 1500)}
									</span>
								</div>
							</div>
							<div class="node-expand">
								{#if isExpanded('d-exam')}
									<ChevronDown class="h-4 w-4 text-slate-500" />
								{:else}
									<ChevronRight class="h-4 w-4 text-slate-500" />
								{/if}
							</div>
						</button>
						{#if isExpanded('d-exam')}
							<div class="node-details">
								<div class="cost-breakdown">
									<div class="cost-row">
										<span>Examination fee</span>
										<span>{formatCurrency(currentCountryCosts.officialExam)}</span>
									</div>
									<div class="cost-row">
										<span>Office action responses (est. 2)</span>
										<span>{formatCurrency(1500)}</span>
									</div>
								</div>
								<div class="node-meta">
									<span>Avg. duration: {currentCountryCosts.avgExamTime}</span>
								</div>
							</div>
						{/if}
					</div>

					<!-- Arrow -->
					<div class="flow-arrow">
						<div class="arrow-line"></div>
					</div>

					<!-- Stage 4: Grant -->
					<div class="cost-node node-success">
						<button class="node-header" onclick={() => toggleNode('d-grant')}>
							<div class="node-timeline">
								<span class="timeline-badge timeline-success">Grant</span>
							</div>
							<div class="node-main">
								<h4 class="node-title">Patent Granted</h4>
								<div class="node-cost-preview">
									<span class="text-slate-400">Est.</span>
									<span class="text-green-400 font-semibold">
										{formatCurrency(currentCountryCosts.officialGrant)}
									</span>
								</div>
							</div>
							<div class="node-expand">
								{#if isExpanded('d-grant')}
									<ChevronDown class="h-4 w-4 text-slate-500" />
								{:else}
									<ChevronRight class="h-4 w-4 text-slate-500" />
								{/if}
							</div>
						</button>
						{#if isExpanded('d-grant')}
							<div class="node-details">
								<div class="cost-breakdown">
									<div class="cost-row">
										<span>Grant/Issue fee</span>
										<span>{formatCurrency(currentCountryCosts.officialGrant)}</span>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>

			{:else}
				<!-- PCT FLOWCHART -->
				<div class="space-y-3">
					<!-- Stage 1: Priority Filing -->
					<div class="cost-node">
						<button class="node-header" onclick={() => toggleNode('p-priority')}>
							<div class="node-timeline">
								<span class="timeline-badge">Month 0</span>
							</div>
							<div class="node-main">
								<h4 class="node-title">Priority Application</h4>
								<div class="node-cost-preview">
									<span class="text-slate-400">Est.</span>
									<span class="text-green-400 font-semibold">{formatCurrency(3500)}</span>
								</div>
							</div>
							<div class="node-expand">
								{#if isExpanded('p-priority')}
									<ChevronDown class="h-4 w-4 text-slate-500" />
								{:else}
									<ChevronRight class="h-4 w-4 text-slate-500" />
								{/if}
							</div>
						</button>
						{#if isExpanded('p-priority')}
							<div class="node-details">
								<div class="cost-breakdown">
									<div class="cost-row">
										<span>Official fees</span>
										<span>{formatCurrency(320)}</span>
									</div>
									<div class="cost-row">
										<span>Attorney (drafting & filing)</span>
										<span>{formatCurrency(3000)}</span>
									</div>
								</div>
							</div>
						{/if}
					</div>

					<!-- Arrow -->
					<div class="flow-arrow">
						<div class="arrow-line"></div>
						<div class="deadline-badge deadline-warning">
							<Clock class="h-3 w-3" />
							<span>Within 12 months</span>
						</div>
					</div>

					<!-- Stage 2: PCT International Filing -->
					<div class="cost-node node-highlight">
						<button class="node-header" onclick={() => toggleNode('p-pct')}>
							<div class="node-timeline">
								<span class="timeline-badge">Month 12</span>
							</div>
							<div class="node-main">
								<h4 class="node-title">PCT International Application</h4>
								<div class="node-cost-preview">
									<span class="text-slate-400">Est.</span>
									<span class="text-blue-400 font-semibold">{formatCurrency(pctInternationalCosts.total)}</span>
								</div>
							</div>
							<div class="node-expand">
								{#if isExpanded('p-pct')}
									<ChevronDown class="h-4 w-4 text-slate-500" />
								{:else}
									<ChevronRight class="h-4 w-4 text-slate-500" />
								{/if}
							</div>
						</button>
						{#if isExpanded('p-pct')}
							<div class="node-details">
								<div class="cost-breakdown">
									<div class="cost-row">
										<span>International filing fee (WIPO)</span>
										<span>{formatCurrency(pctInternationalCosts.internationalFilingFee)}</span>
									</div>
									<div class="cost-row">
										<span>Search fee (USPTO ISA)</span>
										<span>{formatCurrency(pctInternationalCosts.searchFee)}</span>
									</div>
									<div class="cost-row">
										<span>Transmittal fee</span>
										<span>{formatCurrency(pctInternationalCosts.transmittalFee)}</span>
									</div>
									<div class="cost-row">
										<span>Attorney</span>
										<span>{formatCurrency(pctInternationalCosts.attorney)}</span>
									</div>
								</div>
								<div class="node-note">
									<AlertCircle class="h-3.5 w-3.5 text-blue-400" />
									<span>One-time cost covering all {selectedCountries.length} selected countries</span>
								</div>
							</div>
						{/if}
					</div>

					<!-- Arrow -->
					<div class="flow-arrow">
						<div class="arrow-line"></div>
						<div class="deadline-badge">
							<span>ISR + Written Opinion ~16-18 mo</span>
						</div>
					</div>

					<!-- Stage 3: National Phase Entry -->
					<div class="cost-node">
						<button class="node-header" onclick={() => toggleNode('p-national')}>
							<div class="node-timeline">
								<span class="timeline-badge">{currentCountryCosts.pctDeadlineMonths} months</span>
							</div>
							<div class="node-main">
								<h4 class="node-title">National Phase - {selectedCountry.name}</h4>
								<div class="node-cost-preview">
									<span class="text-slate-400">Est.</span>
									<span class="text-green-400 font-semibold">
										{formatCurrency(currentCountryCosts.pctNationalPhase + currentCountryCosts.translation + currentCountryCosts.localAttorney)}
									</span>
								</div>
							</div>
							<div class="node-expand">
								{#if isExpanded('p-national')}
									<ChevronDown class="h-4 w-4 text-slate-500" />
								{:else}
									<ChevronRight class="h-4 w-4 text-slate-500" />
								{/if}
							</div>
						</button>
						{#if isExpanded('p-national')}
							<div class="node-details">
								<div class="cost-breakdown">
									<div class="cost-row">
										<span>National phase fee</span>
										<span>{formatCurrency(currentCountryCosts.pctNationalPhase)}</span>
									</div>
									{#if currentCountryCosts.translation > 0}
										<div class="cost-row">
											<span>Translation ({currentCountryCosts.language})</span>
											<span>{formatCurrency(currentCountryCosts.translation)}</span>
										</div>
									{/if}
									<div class="cost-row">
										<span>Local attorney</span>
										<span>{formatCurrency(currentCountryCosts.localAttorney)}</span>
									</div>
								</div>
								<div class="node-meta">
									<span>Deadline: {currentCountryCosts.pctDeadlineMonths} months from priority</span>
								</div>
							</div>
						{/if}
					</div>

					<!-- Arrow -->
					<div class="flow-arrow">
						<div class="arrow-line"></div>
						<div class="deadline-badge">
							<span>Exam: {currentCountryCosts.examRequestDeadline}</span>
						</div>
					</div>

					<!-- Stage 4: Examination -->
					<div class="cost-node">
						<button class="node-header" onclick={() => toggleNode('p-exam')}>
							<div class="node-timeline">
								<span class="timeline-badge timeline-variable">Variable</span>
							</div>
							<div class="node-main">
								<h4 class="node-title">Examination & Prosecution</h4>
								<div class="node-cost-preview">
									<span class="text-slate-400">Est.</span>
									<span class="text-green-400 font-semibold">
										{formatCurrency(currentCountryCosts.officialExam + 1500)}
									</span>
								</div>
							</div>
							<div class="node-expand">
								{#if isExpanded('p-exam')}
									<ChevronDown class="h-4 w-4 text-slate-500" />
								{:else}
									<ChevronRight class="h-4 w-4 text-slate-500" />
								{/if}
							</div>
						</button>
						{#if isExpanded('p-exam')}
							<div class="node-details">
								<div class="cost-breakdown">
									<div class="cost-row">
										<span>Examination fee</span>
										<span>{formatCurrency(currentCountryCosts.officialExam)}</span>
									</div>
									<div class="cost-row">
										<span>Office action responses (est.)</span>
										<span>{formatCurrency(1500)}</span>
									</div>
								</div>
								<div class="node-meta">
									<span>Avg. duration: {currentCountryCosts.avgExamTime}</span>
								</div>
							</div>
						{/if}
					</div>

					<!-- Arrow -->
					<div class="flow-arrow">
						<div class="arrow-line"></div>
					</div>

					<!-- Stage 5: Grant -->
					<div class="cost-node node-success">
						<button class="node-header" onclick={() => toggleNode('p-grant')}>
							<div class="node-timeline">
								<span class="timeline-badge timeline-success">Grant</span>
							</div>
							<div class="node-main">
								<h4 class="node-title">Patent Granted</h4>
								<div class="node-cost-preview">
									<span class="text-slate-400">Est.</span>
									<span class="text-green-400 font-semibold">
										{formatCurrency(currentCountryCosts.officialGrant)}
									</span>
								</div>
							</div>
							<div class="node-expand">
								{#if isExpanded('p-grant')}
									<ChevronDown class="h-4 w-4 text-slate-500" />
								{:else}
									<ChevronRight class="h-4 w-4 text-slate-500" />
								{/if}
							</div>
						</button>
						{#if isExpanded('p-grant')}
							<div class="node-details">
								<div class="cost-breakdown">
									<div class="cost-row">
										<span>Grant/Issue fee</span>
										<span>{formatCurrency(currentCountryCosts.officialGrant)}</span>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/if}

		</div>
	{:else if selectedCountries.length === 0}
		<div class="flex flex-col items-center justify-center py-16 text-center">
			<div class="mb-4 text-6xl opacity-20">🗺️</div>
			<p class="text-lg text-slate-400">Select countries to see filing costs</p>
			<p class="mt-2 text-sm text-slate-500">
				Choose countries from the left panel
			</p>
		</div>
	{/if}
</div>

<style>
	.cost-node {
		border-radius: 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.02);
		overflow: hidden;
	}

	.cost-node.node-highlight {
		border-color: rgba(59, 130, 246, 0.3);
		background: rgba(59, 130, 246, 0.05);
	}

	.cost-node.node-success {
		border-color: rgba(34, 197, 94, 0.3);
		background: rgba(34, 197, 94, 0.05);
	}

	.node-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		width: 100%;
		text-align: left;
		transition: background 0.15s;
	}

	.node-header:hover {
		background: rgba(255, 255, 255, 0.03);
	}

	.node-timeline {
		flex-shrink: 0;
		width: 5rem;
	}

	.timeline-badge {
		display: inline-block;
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		background: rgba(100, 116, 139, 0.3);
		color: rgb(148, 163, 184);
	}

	.timeline-badge.timeline-variable {
		background: rgba(251, 191, 36, 0.2);
		color: rgb(251, 191, 36);
	}

	.timeline-badge.timeline-success {
		background: rgba(34, 197, 94, 0.2);
		color: rgb(74, 222, 128);
	}

	.node-main {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.node-title {
		font-weight: 500;
		color: white;
		font-size: 0.875rem;
	}

	.node-cost-preview {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
	}

	.node-expand {
		flex-shrink: 0;
	}

	.node-details {
		padding: 0.75rem 1rem 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		background: rgba(0, 0, 0, 0.15);
	}

	.cost-breakdown {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.cost-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.8125rem;
	}

	.cost-row span:first-child {
		color: rgb(148, 163, 184);
	}

	.cost-row span:last-child {
		color: rgb(226, 232, 240);
		font-weight: 500;
	}

	.node-meta {
		margin-top: 0.75rem;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		font-size: 0.75rem;
		color: rgb(100, 116, 139);
	}

	.node-note {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 0.75rem;
		padding: 0.5rem;
		border-radius: 0.375rem;
		background: rgba(59, 130, 246, 0.1);
		font-size: 0.75rem;
		color: rgb(147, 197, 253);
	}

	.flow-arrow {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.125rem 0;
	}

	.arrow-line {
		width: 2px;
		height: 1.25rem;
		background: linear-gradient(to bottom, rgba(34, 197, 94, 0.6), rgba(34, 197, 94, 0.2));
	}

	.deadline-badge {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.625rem;
		color: rgb(148, 163, 184);
		background: rgba(255, 255, 255, 0.05);
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		margin-top: 0.25rem;
	}

	.deadline-badge.deadline-warning {
		background: rgba(251, 191, 36, 0.15);
		color: rgb(251, 191, 36);
	}
</style>
