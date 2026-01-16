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

// Green color palette for arcs (matching brand)
const ARC_COLORS = [
	'rgba(74, 222, 128, 0.9)', // green-400
	'rgba(34, 197, 94, 0.85)', // green-500
	'rgba(22, 163, 74, 0.8)', // green-600
	'rgba(21, 128, 61, 0.75)', // green-700
	'rgba(134, 239, 172, 0.7)' // green-300
];

function getRandomColor(): string {
	return ARC_COLORS[Math.floor(Math.random() * ARC_COLORS.length)];
}

// Generate patent filing arcs between offices
export function generatePatentArcs(): PatentArc[] {
	const arcs: PatentArc[] = [];

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
		endLat: PATENT_OFFICES.US.lat,
		endLng: PATENT_OFFICES.US.lng,
		color: getRandomColor()
	});
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
		color: 'rgba(74, 222, 128, 1)' // green-400
	}));
}
