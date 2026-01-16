<script lang="ts">
	import { generatePatentArcs, generatePatentPoints } from '$lib/data/patent-arcs';

	let globeContainer: HTMLDivElement;
	let globeInstance: any = $state(null);

	// Dynamic import of globe.gl (browser-only)
	$effect(() => {
		if (typeof window === 'undefined') return;

		let mounted = true;

		async function initGlobe() {
			const GlobeModule = await import('globe.gl');
			const GlobeClass = GlobeModule.default;

			if (!mounted || !globeContainer) return;

			const arcsData = generatePatentArcs();
			const pointsData = generatePatentPoints();

			// Use 'new' to properly instantiate the Globe class
			const globe = new (GlobeClass as any)(globeContainer)
				.globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
				.bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
				// No background image - CSS will handle background
				.showAtmosphere(true)
				.atmosphereColor('rgba(74, 222, 128, 0.2)')
				.atmosphereAltitude(0.25)
				// Arc layer for patent filings
				.arcsData(arcsData)
				.arcColor('color')
				.arcDashLength(0.4)
				.arcDashGap(0.2)
				.arcDashAnimateTime(4000)
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
			globe.pointOfView({ lat: 10, lng: 0, altitude: 2.2 });

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
