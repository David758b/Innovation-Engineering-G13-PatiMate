# Landing Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the landing page with an immersive full-viewport globe background, glassmorphism content card, and unified green brand colors.

**Architecture:** Globe becomes a fixed background layer covering the entire viewport. Content overlays with a glassmorphism card (backdrop-blur + transparency). Header displays logo. Arc colors change from cyan to green to match brand.

**Tech Stack:** SvelteKit 2, Svelte 5, globe.gl, Tailwind CSS 4, shadcn-svelte

---

## Task 1: Update Patent Arc Colors to Green

**Files:**

- Modify: `src/lib/data/patent-arcs.ts`

**Step 1: Update the ARC_COLORS array from cyan/teal to green**

Change the `ARC_COLORS` constant from cyan colors to green colors that match the logo:

```typescript
// Green color palette for arcs (matching brand)
const ARC_COLORS = [
	'rgba(74, 222, 128, 0.9)', // green-400
	'rgba(34, 197, 94, 0.85)', // green-500
	'rgba(22, 163, 74, 0.8)', // green-600
	'rgba(21, 128, 61, 0.75)', // green-700
	'rgba(134, 239, 172, 0.7)' // green-300
];
```

**Step 2: Update the point color in generatePatentPoints()**

Change the point color from cyan to green:

```typescript
color: 'rgba(74, 222, 128, 1)'; // green-400
```

**Step 3: Verify TypeScript compiles**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: No errors

**Step 4: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: update arc colors from cyan to green brand color"
```

---

## Task 2: Update Globe Component for Full-Viewport Background

**Files:**

- Modify: `src/lib/components/Globe.svelte`

**Step 1: Remove the background image and update atmosphere color**

In the globe initialization, remove `.backgroundImageUrl()` and change atmosphere to green:

Change:

```typescript
.backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
.atmosphereColor('rgba(6, 182, 212, 0.3)')
```

To:

```typescript
// No background image - CSS will handle background
.atmosphereColor('rgba(74, 222, 128, 0.2)')
```

**Step 2: Update the container div to be fixed and full-viewport**

Change the template from:

```svelte
<div bind:this={globeContainer} class="h-full w-full"></div>
```

To:

```svelte
<div bind:this={globeContainer} class="fixed inset-0 h-screen w-screen"></div>
```

**Step 3: Adjust initial point of view for better centering**

The globe should be slightly lower so content card doesn't overlap the center. Update:

```typescript
globe.pointOfView({ lat: 10, lng: 0, altitude: 2.2 });
```

**Step 4: Verify no errors**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

**Step 5: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: make globe full-viewport background layer"
```

---

## Task 3: Redesign Landing Page Layout

**Files:**

- Modify: `src/routes/+page.svelte`

**Step 1: Replace the entire landing page with new design**

Replace contents of `src/routes/+page.svelte` with:

```svelte
<script lang="ts">
	import Globe from '$lib/components/Globe.svelte';
	import { Button } from '$lib/components/ui/button';
</script>

<!-- Background gradient layer -->
<div class="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
	<!-- Subtle star-like dots -->
	<div
		class="absolute inset-0 opacity-30"
		style="background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px); background-size: 50px 50px;"
	></div>
</div>

<!-- Globe layer -->
<Globe />

<!-- Gradient overlay for text readability -->
<div
	class="pointer-events-none fixed inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40"
></div>

<!-- Content layer -->
<div class="relative z-20 flex min-h-screen flex-col">
	<!-- Header -->
	<header class="flex items-center gap-3 px-6 py-5 md:px-12">
		<img src="/patimate-logo.png" alt="PatiMate Logo" class="h-10 w-auto" />
	</header>

	<!-- Main content - centered card -->
	<main class="flex flex-1 flex-col items-center justify-center px-6 pb-20">
		<!-- Glassmorphism card -->
		<div
			class="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-md md:p-10"
		>
			<!-- Tagline -->
			<h1 class="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
				Estimate patent filing costs worldwide
			</h1>

			<!-- Value proposition -->
			<p class="mt-4 text-lg text-slate-300 md:text-xl">
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
					>
						<path
							fill-rule="evenodd"
							d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</Button>
			</div>
		</div>
	</main>
</div>
```

**Step 2: Verify no TypeScript errors**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

**Step 3: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: redesign landing page with glassmorphism card overlay"
```

---

## Task 4: Test and Polish

**Files:**

- Possibly adjust: `src/routes/+page.svelte`, `src/lib/components/Globe.svelte`

**Step 1: Run dev server and verify visually**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm dev
```

Open http://localhost:5173 and verify:

- Dark gradient background with subtle star pattern
- Globe renders as full-viewport background with green arcs
- Glassmorphism card is visible and readable
- Logo appears in header
- Button has green styling and hover effect
- Button navigates to /home

**Step 2: Run build to verify production readiness**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm build
```

Expected: Build succeeds

**Step 3: Format code**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm format
```

**Step 4: Final commit if any adjustments made**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: landing page redesign complete"
```

---

## Summary of Changes

| Action | File Path                                         |
| ------ | ------------------------------------------------- |
| Modify | `src/lib/data/patent-arcs.ts` (green colors)      |
| Modify | `src/lib/components/Globe.svelte` (full-viewport) |
| Modify | `src/routes/+page.svelte` (new layout)            |

## Visual Changes

- Globe: Cyan → Green arcs
- Background: Contained box → Full-viewport with CSS gradient
- Layout: Stacked → Overlaid glassmorphism card
- Header: Plain text → Logo image
- Button: Default → Green with glow effect
- Overall: Generic dark → Immersive space theme
