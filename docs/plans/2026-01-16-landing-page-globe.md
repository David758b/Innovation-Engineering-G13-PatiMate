# Landing Page with Globe Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a stunning landing page with a 3D spinning globe showing animated patent filing arcs between countries, branded header, tagline, and "Try it" button routing to `/home`.

**Architecture:** SvelteKit page with a client-side rendered globe.gl component wrapped in a Svelte component. Dark/space theme using existing shadcn dark mode CSS variables. Mock patent filing data drives the arc animations.

**Tech Stack:** SvelteKit 2, Svelte 5, globe.gl (ThreeJS-based), shadcn-svelte Button, Tailwind CSS 4

---

## Pre-Implementation Analysis

### Current State

- SvelteKit 2 + Svelte 5 + Tailwind CSS 4 project
- shadcn-svelte initialized (components.json exists, utils.ts exists)
- No shadcn components installed yet (ui/ directory empty)
- Dark mode CSS variables already configured in layout.css
- Landing page at `src/routes/+page.svelte` has default content

### Key Technical Considerations

1. **globe.gl is browser-only**: Uses WebGL/ThreeJS, must be imported dynamically to avoid SSR issues
2. **Svelte 5 runes**: Use `$state`, `$effect` instead of `onMount` for lifecycle
3. **Dark mode**: Add `dark` class to html element to activate dark theme
4. **Button component**: Need to install via shadcn CLI before use

---

## Task 1: Install Dependencies

**Files:**

- Modify: `package.json`

**Step 1: Install globe.gl library**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm add globe.gl
```

Expected: Package added to dependencies

**Step 2: Add shadcn Button component**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm dlx shadcn-svelte@next add button
```

Expected: Button component files created in `src/lib/components/ui/button/`

**Step 3: Verify installations**

Run:

```bash
cat /home/david/Innovation-Engineering-G13-PatiMate/patimate/package.json | grep -E "(globe|bits-ui)"
```

Expected: Both `globe.gl` and `bits-ui` should appear

**Step 4: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: add globe.gl and shadcn button dependencies"
```

---

## Task 2: Enable Dark Mode Globally

**Files:**

- Modify: `src/app.html`

**Step 1: Add dark class to html element**

Change `src/app.html` from:

```html
<html lang="en"></html>
```

To:

```html
<html lang="en" class="dark"></html>
```

**Step 2: Verify dark mode works**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm dev
```

Open browser to http://localhost:5173 - background should now be dark (using --background from .dark CSS variables)

**Step 3: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: enable dark mode globally"
```

---

## Task 3: Create Patent Filing Data Module

**Files:**

- Create: `src/lib/data/patent-arcs.ts`

**Step 1: Create the data directory**

Run:

```bash
mkdir -p /home/david/Innovation-Engineering-G13-PatiMate/patimate/src/lib/data
```

**Step 2: Create the patent arcs data file**

Create `src/lib/data/patent-arcs.ts`:

```typescript
// Mock patent filing data showing arcs between major patent offices
// Data represents patent filing flows between countries

export interface PatentArc {
	startLat: number;
	startLng: number;
	endLat: number;
	endLng: number;
	color: string;
}

// Major patent office locations
const PATENT_OFFICES = {
	US: { lat: 38.9072, lng: -77.0369, name: 'USPTO' }, // Washington DC
	EP: { lat: 52.52, lng: 13.405, name: 'EPO' }, // Berlin (EPO has offices here)
	CN: { lat: 39.9042, lng: 116.4074, name: 'CNIPA' }, // Beijing
	JP: { lat: 35.6762, lng: 139.6503, name: 'JPO' }, // Tokyo
	KR: { lat: 37.5665, lng: 126.978, name: 'KIPO' }, // Seoul
	IN: { lat: 28.6139, lng: 77.209, name: 'IPO India' }, // New Delhi
	AU: { lat: -35.2809, lng: 149.13, name: 'IP Australia' }, // Canberra
	BR: { lat: -15.7975, lng: -47.8919, name: 'INPI Brazil' }, // Brasilia
	CA: { lat: 45.4215, lng: -75.6972, name: 'CIPO' }, // Ottawa
	GB: { lat: 51.5074, lng: -0.1278, name: 'UKIPO' } // London
};

// Cyan/teal color palette for arcs
const ARC_COLORS = [
	'rgba(6, 182, 212, 0.8)', // cyan-500
	'rgba(20, 184, 166, 0.8)', // teal-500
	'rgba(34, 211, 238, 0.7)', // cyan-400
	'rgba(45, 212, 191, 0.7)', // teal-400
	'rgba(103, 232, 249, 0.6)' // cyan-300
];

function getRandomColor(): string {
	return ARC_COLORS[Math.floor(Math.random() * ARC_COLORS.length)];
}

// Generate patent filing arcs between offices
export function generatePatentArcs(): PatentArc[] {
	const arcs: PatentArc[] = [];
	const offices = Object.values(PATENT_OFFICES);

	// Create arcs between major patent offices
	// US -> others
	arcs.push({
		startLat: PATENT_OFFICES.US.lat,
		startLng: PATENT_OFFICES.US.lng,
		endLat: PATENT_OFFICES.EP.lat,
		endLng: PATENT_OFFICES.EP.lng,
		color: getRandomColor()
	});
	arcs.push({
		startLat: PATENT_OFFICES.US.lat,
		startLng: PATENT_OFFICES.US.lng,
		endLat: PATENT_OFFICES.CN.lat,
		endLng: PATENT_OFFICES.CN.lng,
		color: getRandomColor()
	});
	arcs.push({
		startLat: PATENT_OFFICES.US.lat,
		startLng: PATENT_OFFICES.US.lng,
		endLat: PATENT_OFFICES.JP.lat,
		endLng: PATENT_OFFICES.JP.lng,
		color: getRandomColor()
	});

	// EP -> others
	arcs.push({
		startLat: PATENT_OFFICES.EP.lat,
		startLng: PATENT_OFFICES.EP.lng,
		endLat: PATENT_OFFICES.US.lat,
		endLng: PATENT_OFFICES.US.lng,
		color: getRandomColor()
	});
	arcs.push({
		startLat: PATENT_OFFICES.EP.lat,
		startLng: PATENT_OFFICES.EP.lng,
		endLat: PATENT_OFFICES.CN.lat,
		endLng: PATENT_OFFICES.CN.lng,
		color: getRandomColor()
	});

	// CN -> others
	arcs.push({
		startLat: PATENT_OFFICES.CN.lat,
		startLng: PATENT_OFFICES.CN.lng,
		endLat: PATENT_OFFICES.US.lat,
		endLng: PATENT_OFFICES.US.lng,
		color: getRandomColor()
	});
	arcs.push({
		startLat: PATENT_OFFICES.CN.lat,
		startLng: PATENT_OFFICES.CN.lng,
		endLat: PATENT_OFFICES.JP.lat,
		endLng: PATENT_OFFICES.JP.lng,
		color: getRandomColor()
	});
	arcs.push({
		startLat: PATENT_OFFICES.CN.lat,
		startLng: PATENT_OFFICES.CN.lng,
		endLat: PATENT_OFFICES.KR.lat,
		endLng: PATENT_OFFICES.KR.lng,
		color: getRandomColor()
	});

	// JP -> others
	arcs.push({
		startLat: PATENT_OFFICES.JP.lat,
		startLng: PATENT_OFFICES.JP.lng,
		endLat: PATENT_OFFICES.US.lat,
		endLng: PATENT_OFFICES.US.lng,
		color: getRandomColor()
	});
	arcs.push({
		startLat: PATENT_OFFICES.JP.lat,
		startLng: PATENT_OFFICES.JP.lng,
		endLat: PATENT_OFFICES.KR.lat,
		endLng: PATENT_OFFICES.KR.lng,
		color: getRandomColor()
	});

	// KR -> others
	arcs.push({
		startLat: PATENT_OFFICES.KR.lat,
		startLng: PATENT_OFFICES.KR.lng,
		endLat: PATENT_OFFICES.US.lat,
		endLng: PATENT_OFFICES.US.lng,
		color: getRandomColor()
	});

	// IN -> others
	arcs.push({
		startLat: PATENT_OFFICES.IN.lat,
		startLng: PATENT_OFFICES.IN.lng,
		endLat: PATENT_OFFICES.US.lat,
		endLng: PATENT_OFFICES.US.lng,
		color: getRandomColor()
	});
	arcs.push({
		startLat: PATENT_OFFICES.IN.lat,
		startLng: PATENT_OFFICES.IN.lng,
		endLat: PATENT_OFFICES.EP.lat,
		endLng: PATENT_OFFICES.EP.lng,
		color: getRandomColor()
	});

	// AU -> others
	arcs.push({
		startLat: PATENT_OFFICES.AU.lat,
		startLng: PATENT_OFFICES.AU.lng,
		endLat: PATENT_OFFICES.US.lat,
		endLng: PATENT_OFFICES.US.lng,
		color: getRandomColor()
	});

	// BR -> others
	arcs.push({
		startLat: PATENT_OFFICES.BR.lat,
		startLng: PATENT_OFFICES.BR.lng,
		endLat: PATENT_OFFICES.US.lat,
		endLng: PATENT_OFFICES.US.lng,
		color: getRandomColor()
	});

	// CA -> others
	arcs.push({
		startLat: PATENT_OFFICES.CA.lat,
		startLng: PATENT_OFFICES.CA.lng,
		endLat: PATENT_OFFICES.EP.lat,
		endLng: PATENT_OFFICES.EP.lng,
		color: getRandomColor()
	});

	// GB -> others
	arcs.push({
		startLat: PATENT_OFFICES.GB.lat,
		startLng: PATENT_OFFICES.GB.lng,
		endLat: PATENT_OFFICES.US.lat,
		endLng: PATENT_OFFICES.US.lng,
		color: getRandomColor()
	});
	arcs.push({
		startLat: PATENT_OFFICES.GB.lat,
		startLng: PATENT_OFFICES.GB.lng,
		endLat: PATENT_OFFICES.CN.lat,
		endLng: PATENT_OFFICES.CN.lng,
		color: getRandomColor()
	});

	return arcs;
}

// Patent office points for the globe
export interface PatentPoint {
	lat: number;
	lng: number;
	name: string;
	size: number;
	color: string;
}

export function generatePatentPoints(): PatentPoint[] {
	return Object.values(PATENT_OFFICES).map((office) => ({
		lat: office.lat,
		lng: office.lng,
		name: office.name,
		size: 0.5,
		color: 'rgba(6, 182, 212, 1)' // cyan-500
	}));
}
```

**Step 3: Verify TypeScript compiles**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: No errors

**Step 4: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: add patent filing arc data module"
```

---

## Task 4: Create Globe Component

**Files:**

- Create: `src/lib/components/Globe.svelte`

**Step 1: Create the Globe component**

Create `src/lib/components/Globe.svelte`:

```svelte
<script lang="ts">
	import { generatePatentArcs, generatePatentPoints } from '$lib/data/patent-arcs';

	let globeContainer: HTMLDivElement;
	let globeInstance: any = $state(null);

	// Dynamic import of globe.gl (browser-only)
	$effect(() => {
		if (typeof window === 'undefined') return;

		let mounted = true;

		async function initGlobe() {
			const Globe = (await import('globe.gl')).default;

			if (!mounted || !globeContainer) return;

			const arcsData = generatePatentArcs();
			const pointsData = generatePatentPoints();

			const globe = Globe()(globeContainer)
				.globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
				.bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
				.backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
				.showAtmosphere(true)
				.atmosphereColor('rgba(6, 182, 212, 0.3)')
				.atmosphereAltitude(0.25)
				// Arc layer for patent filings
				.arcsData(arcsData)
				.arcColor('color')
				.arcDashLength(0.4)
				.arcDashGap(0.2)
				.arcDashAnimateTime(2000)
				.arcStroke(0.5)
				// Points layer for patent offices
				.pointsData(pointsData)
				.pointColor('color')
				.pointAltitude(0.01)
				.pointRadius('size')
				// Labels for patent offices
				.labelsData(pointsData)
				.labelLat('lat')
				.labelLng('lng')
				.labelText('name')
				.labelSize(1.2)
				.labelColor(() => 'rgba(255, 255, 255, 0.75)')
				.labelDotRadius(0.4)
				.labelAltitude(0.02);

			// Auto-rotate
			globe.controls().autoRotate = true;
			globe.controls().autoRotateSpeed = 0.5;
			globe.controls().enableZoom = false;

			// Set initial point of view
			globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

			globeInstance = globe;
		}

		initGlobe();

		return () => {
			mounted = false;
			if (globeInstance) {
				globeInstance._destructor?.();
			}
		};
	});

	// Handle resize
	$effect(() => {
		if (typeof window === 'undefined' || !globeInstance) return;

		function handleResize() {
			if (globeInstance && globeContainer) {
				globeInstance.width(globeContainer.clientWidth);
				globeInstance.height(globeContainer.clientHeight);
			}
		}

		window.addEventListener('resize', handleResize);
		handleResize();

		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<div bind:this={globeContainer} class="h-full w-full"></div>
```

**Step 2: Verify no TypeScript errors**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm check
```

Expected: May show warning about `any` type for globe.gl (acceptable - no types available)

**Step 3: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: create Globe component with patent filing arcs"
```

---

## Task 5: Create /home Route Placeholder

**Files:**

- Create: `src/routes/home/+page.svelte`

**Step 1: Create the home directory and page**

Run:

```bash
mkdir -p /home/david/Innovation-Engineering-G13-PatiMate/patimate/src/routes/home
```

**Step 2: Create the placeholder page**

Create `src/routes/home/+page.svelte`:

```svelte
<script lang="ts">
	// Placeholder page - content to be added later
</script>

<div class="flex min-h-screen items-center justify-center">
	<h1 class="text-2xl font-semibold text-foreground">Welcome to PatiMate</h1>
</div>
```

**Step 3: Verify route works**

Run dev server and navigate to http://localhost:5173/home

Expected: Shows "Welcome to PatiMate" centered on dark background

**Step 4: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: add /home route placeholder"
```

---

## Task 6: Build the Landing Page

**Files:**

- Modify: `src/routes/+page.svelte`

**Step 1: Replace landing page content**

Replace entire contents of `src/routes/+page.svelte`:

```svelte
<script lang="ts">
	import Globe from '$lib/components/Globe.svelte';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="relative flex min-h-screen flex-col overflow-hidden bg-background">
	<!-- Header -->
	<header class="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
		<div class="flex items-center gap-2">
			<span class="text-2xl font-bold tracking-tight text-foreground">PatiMate</span>
		</div>
	</header>

	<!-- Main content -->
	<main class="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
		<!-- Tagline -->
		<h1
			class="mb-8 text-center text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl"
		>
			Estimate patent filing costs worldwide
		</h1>

		<!-- Globe container -->
		<div class="relative h-[50vh] w-full max-w-3xl md:h-[55vh]">
			<Globe />
		</div>

		<!-- CTA Button -->
		<div class="mt-8">
			<Button href="/home" size="lg" class="px-8 py-6 text-lg">Try it</Button>
		</div>
	</main>

	<!-- Subtle footer space -->
	<footer class="relative z-10 py-6"></footer>
</div>
```

**Step 2: Verify the page renders**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm dev
```

Open http://localhost:5173 and verify:

- Dark background
- "PatiMate" header in top-left
- Tagline centered
- Globe renders with spinning animation and cyan arcs
- "Try it" button at bottom
- Button navigates to /home when clicked

**Step 3: Fix any styling issues**

If globe doesn't render properly, check browser console for errors.

**Step 4: Commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: implement landing page with globe and CTA"
```

---

## Task 7: Final Polish and Testing

**Files:**

- Possibly adjust: `src/routes/+page.svelte`, `src/lib/components/Globe.svelte`

**Step 1: Test responsive behavior**

Check the page at various viewport sizes:

- Mobile (375px)
- Tablet (768px)
- Desktop (1440px)

Globe should scale appropriately.

**Step 2: Test button navigation**

Click "Try it" button and verify it navigates to /home.

**Step 3: Verify auto-rotation**

Globe should slowly rotate without user interaction.

**Step 4: Check for console errors**

Open browser DevTools and verify no JavaScript errors.

**Step 5: Run build to verify production readiness**

Run:

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && pnpm build
```

Expected: Build succeeds without errors

**Step 6: Final commit**

```bash
cd /home/david/Innovation-Engineering-G13-PatiMate/patimate && git add -A && git commit -m "feat: landing page with globe - complete"
```

---

## Summary of Files

| Action | File Path                           |
| ------ | ----------------------------------- |
| Modify | `package.json` (dependencies added) |
| Modify | `src/app.html` (dark class)         |
| Create | `src/lib/data/patent-arcs.ts`       |
| Create | `src/lib/components/Globe.svelte`   |
| Create | `src/routes/home/+page.svelte`      |
| Modify | `src/routes/+page.svelte`           |

## Dependencies to Install

- `globe.gl` - 3D globe visualization
- `bits-ui` - shadcn-svelte primitives (installed via button component)

## Potential Issues & Solutions

1. **Globe doesn't render**: Check if container has explicit height. Globe.gl needs dimensions.
2. **SSR errors**: globe.gl is browser-only; the dynamic import handles this.
3. **Button not found**: Ensure shadcn button was installed correctly.
4. **Dark mode not working**: Verify `dark` class is on `<html>` element.
