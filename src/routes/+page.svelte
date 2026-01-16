<script lang="ts">
	import Globe from '$lib/components/Globe.svelte';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="flex min-h-screen">
	<!-- Left Panel - Content (35%) -->
	<div
		class="flex w-[35%] flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
	>
		<!-- Header -->
		<header class="flex items-center gap-3 px-8 py-6">
			<img src="/patimate-logo.png" alt="PatiMate Logo" class="h-10 w-auto" />
		</header>

		<!-- Main content - vertically centered -->
		<main class="flex flex-1 flex-col justify-center px-8 pb-12">
			<!-- Tagline -->
			<h1 class="text-3xl font-bold leading-tight tracking-tight text-white lg:text-4xl xl:text-5xl">
				Estimate patent filing costs worldwide
			</h1>

			<!-- Value proposition -->
			<p class="mt-4 text-lg text-slate-400 lg:text-xl">
				Calculate costs across 190+ countries in seconds
			</p>

			<!-- CTA Button -->
			<div class="mt-8">
				<Button
					href="/home"
					size="lg"
					class="bg-green-500 px-8 py-6 text-lg font-semibold text-slate-900 shadow-lg shadow-green-500/25 transition-all hover:bg-green-400 hover:shadow-green-500/40"
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

	<!-- Right Panel - Globe (65%) -->
	<div class="relative w-[65%] bg-gradient-to-bl from-slate-900 via-slate-950 to-slate-950">
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
