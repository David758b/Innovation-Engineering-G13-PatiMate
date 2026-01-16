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
	<svg class={classes.icon} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="32" cy="32" r="28" stroke="url(#logo-globe-gradient)" stroke-width="3" />
		<ellipse cx="32" cy="32" rx="28" ry="10" stroke="url(#logo-globe-gradient)" stroke-width="2" />
		<ellipse cx="32" cy="32" rx="10" ry="28" stroke="url(#logo-globe-gradient)" stroke-width="2" />
		<circle cx="32" cy="32" r="4" fill="#22c55e" />
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
