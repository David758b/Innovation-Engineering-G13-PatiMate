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
		<header class="flex items-center justify-center px-6 py-5 lg:px-8 lg:py-6">
			<img src="/patimate-logo.png" alt="PatiMate Logo" class="h-8 w-auto lg:h-10" />
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
