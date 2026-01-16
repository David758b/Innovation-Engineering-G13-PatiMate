<script lang="ts">
	type Size = 'sm' | 'md' | 'lg';

	interface Props {
		size?: Size;
	}

	let { size = 'md' }: Props = $props();

	const sizeClasses: Record<Size, { icon: string; text: string }> = {
		sm: {
			icon: 'h-8 w-8 lg:h-10 lg:w-10',
			text: 'text-xl lg:text-2xl'
		},
		md: {
			icon: 'h-10 w-10 sm:h-12 sm:w-12',
			text: 'text-2xl sm:text-3xl'
		},
		lg: {
			icon: 'h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16',
			text: 'text-4xl sm:text-5xl lg:text-6xl'
		}
	};

	const classes = $derived(sizeClasses[size]);
</script>

<div class="flex items-center gap-2 sm:gap-3">
	<!-- Globe icon -->
	<svg class="{classes.icon} globe" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<!-- Outer ring - spins on Z axis -->
		<circle class="ring-outer" cx="32" cy="32" r="28" stroke="url(#logo-globe-gradient)" stroke-width="3" />
		<!-- Equator - spins on X axis -->
		<ellipse class="ring-equator" cx="32" cy="32" rx="28" ry="10" stroke="url(#logo-globe-gradient)" stroke-width="2" />
		<!-- Meridian - spins on Y axis -->
		<ellipse class="ring-meridian" cx="32" cy="32" rx="10" ry="28" stroke="url(#logo-globe-gradient)" stroke-width="2" />
		<!-- Pulsing center dot -->
		<circle class="center-dot" cx="32" cy="32" r="4" fill="#22c55e" />
		<defs>
			<linearGradient id="logo-globe-gradient" x1="0" y1="0" x2="64" y2="64">
				<stop offset="0%" stop-color="#22c55e" />
				<stop offset="100%" stop-color="#16a34a" />
			</linearGradient>
		</defs>
	</svg>
	<!-- Text -->
	<span class="{classes.text} font-bold tracking-tight text-white">
		Pati<span class="text-green-500">Mate</span>
	</span>
</div>

<style>
	.globe {
		overflow: visible;
	}

	.ring-outer {
		transform-origin: center;
		animation: spin-z 12s linear infinite;
	}

	.ring-equator {
		transform-origin: center;
		animation: spin-x 10s linear infinite;
	}

	.ring-meridian {
		transform-origin: center;
		animation: spin-y 8s linear infinite;
	}

	.center-dot {
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes spin-z {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes spin-x {
		from {
			transform: rotateX(0deg);
		}
		to {
			transform: rotateX(360deg);
		}
	}

	@keyframes spin-y {
		from {
			transform: rotateY(0deg);
		}
		to {
			transform: rotateY(360deg);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			r: 4;
		}
		50% {
			opacity: 0.6;
			r: 5;
		}
	}
</style>
