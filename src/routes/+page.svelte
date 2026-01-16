<script lang="ts">
	import Globe from '$lib/components/Globe.svelte';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="flex min-h-screen flex-col lg:flex-row">
	<!-- Left Panel - Content (100% mobile, 35% desktop) -->
	<div
		class="flex min-h-[50vh] w-full flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 lg:min-h-screen lg:w-[35%]"
	>
		<!-- Header -->
		<header class="flex items-center justify-center px-6 py-8 lg:justify-start lg:px-8 lg:py-10">
			<div class="flex items-center gap-3 sm:gap-4">
				<!-- Globe icon -->
				<svg
					class="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16"
					viewBox="0 0 64 64"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<!-- Outer ring -->
					<circle cx="32" cy="32" r="28" stroke="url(#globe-gradient)" stroke-width="3" />
					<!-- Horizontal line -->
					<ellipse cx="32" cy="32" rx="28" ry="10" stroke="url(#globe-gradient)" stroke-width="2" />
					<!-- Vertical line -->
					<ellipse cx="32" cy="32" rx="10" ry="28" stroke="url(#globe-gradient)" stroke-width="2" />
					<!-- Center dot -->
					<circle cx="32" cy="32" r="4" fill="#22c55e" />
					<defs>
						<linearGradient id="globe-gradient" x1="0" y1="0" x2="64" y2="64">
							<stop offset="0%" stop-color="#22c55e" />
							<stop offset="100%" stop-color="#16a34a" />
						</linearGradient>
					</defs>
				</svg>
				<!-- Text -->
				<span class="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
					Pati<span class="text-green-500">Mate</span>
				</span>
			</div>
		</header>

		<!-- Main content - vertically centered -->
		<main class="flex flex-1 flex-col justify-center px-6 pb-8 lg:px-8 lg:pb-12">
			<!-- Tagline -->
			<h1
				class="text-center text-2xl leading-tight font-bold tracking-tight text-white sm:text-3xl lg:text-left lg:text-4xl xl:text-5xl"
			>
				Estimate patent filing costs worldwide
			</h1>

			<!-- Value proposition -->
			<p
				class="mt-3 text-center text-base text-slate-400 sm:text-lg lg:mt-4 lg:text-left lg:text-xl"
			>
				Calculate costs across 190+ countries in seconds
			</p>

			<!-- CTA Button -->
			<div class="mt-6 flex justify-center lg:mt-8 lg:justify-start">
				<Button
					href="/home"
					size="lg"
					class="bg-green-500 px-6 py-5 text-base font-semibold text-slate-900 shadow-lg shadow-green-500/25 transition-all hover:bg-green-400 hover:shadow-green-500/40 sm:px-8 sm:py-6 sm:text-lg"
				>
					Get Started
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="ml-2 h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</Button>
			</div>
		</main>
	</div>

	<!-- Right Panel - Globe (100% mobile, 65% desktop) -->
	<div
		class="relative min-h-[50vh] w-full bg-gradient-to-bl from-slate-900 via-slate-950 to-slate-950 lg:min-h-screen lg:w-[65%]"
	>
		<!-- Subtle star-like dots -->
		<div
			class="absolute inset-0 opacity-20"
			style="background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px); background-size: 50px 50px;"
		></div>

		<!-- Globe container -->
		<div class="relative h-full w-full">
			<Globe />
		</div>
	</div>
</div>
