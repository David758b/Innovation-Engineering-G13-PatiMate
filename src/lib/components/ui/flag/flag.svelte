<script lang="ts" module>
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	export type FlagSize = 'sm' | 'md' | 'lg' | 'xl';

	export type FlagProps = HTMLAttributes<HTMLSpanElement> & {
		code: string;
		size?: FlagSize;
		square?: boolean;
	};

	// Map special country codes to flag-icons codes
	const CODE_MAP: Record<string, string> = {
		EP: 'eu' // European Patent Office -> EU flag
	};

	const SIZE_CLASSES: Record<FlagSize, string> = {
		sm: 'text-sm',
		md: 'text-base',
		lg: 'text-lg',
		xl: 'text-xl'
	};
</script>

<script lang="ts">
	let {
		code,
		size = 'md',
		square = false,
		class: className,
		...restProps
	}: FlagProps = $props();

	const flagCode = $derived((CODE_MAP[code] || code).toLowerCase());
	const flagClass = $derived(
		cn('fi', `fi-${flagCode}`, square && 'fis', SIZE_CLASSES[size], className)
	);
</script>

<span class={flagClass} role="img" aria-label={`${code} flag`} {...restProps}></span>
