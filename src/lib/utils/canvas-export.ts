// Canvas Export Utilities for Strategy Studio
// Note: This module uses browser APIs and should only be imported dynamically on client-side

import { browser } from '$app/environment';
import { strategyStudioStore } from '$lib/stores/strategy-studio.svelte';

// Calculate bounds of all blocks with padding
function getCanvasBounds() {
	const blocks = strategyStudioStore.blocks;
	if (blocks.length === 0) {
		return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
	}

	let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
	for (const block of blocks) {
		minX = Math.min(minX, block.x);
		minY = Math.min(minY, block.y);
		maxX = Math.max(maxX, block.x + block.width);
		maxY = Math.max(maxY, block.y + block.height);
	}

	const padding = 50;
	return {
		minX: minX - padding,
		minY: minY - padding,
		maxX: maxX + padding,
		maxY: maxY + padding,
		width: maxX - minX + padding * 2,
		height: maxY - minY + padding * 2
	};
}

// Generate SVG content for the canvas
function generateSVG(): string {
	const bounds = getCanvasBounds();
	const blocks = strategyStudioStore.blocks;
	const connections = strategyStudioStore.connections;

	let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}" width="${bounds.width}" height="${bounds.height}">`;

	// Background
	svg += `<rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="#0f172a"/>`;

	// Grid pattern
	svg += `<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">`;
	svg += `<circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.05)"/></pattern></defs>`;
	svg += `<rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="url(#grid)"/>`;

	// Connections
	for (const conn of connections) {
		const fromBlock = blocks.find(b => b.id === conn.fromBlockId);
		const toBlock = blocks.find(b => b.id === conn.toBlockId);
		if (!fromBlock || !toBlock) continue;

		const startX = fromBlock.x + fromBlock.width / 2;
		const startY = fromBlock.y + fromBlock.height;
		const endX = toBlock.x + toBlock.width / 2;
		const endY = toBlock.y;
		const midY = (startY + endY) / 2;

		const dashArray = conn.style === 'dashed' ? 'stroke-dasharray="8,4"' : '';
		svg += `<path d="M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}" stroke="#64748b" stroke-width="2" fill="none" ${dashArray}/>`;
		svg += `<polygon points="${endX-6},${endY-8} ${endX},${endY} ${endX+6},${endY-8}" fill="#64748b" transform="rotate(180, ${endX}, ${endY})"/>`;

		// Label
		if (conn.label) {
			const labelX = (startX + endX) / 2;
			const labelY = (startY + endY) / 2;
			svg += `<rect x="${labelX - 30}" y="${labelY - 10}" width="60" height="20" rx="4" fill="rgba(30, 41, 59, 0.9)" stroke="#475569"/>`;
			svg += `<text x="${labelX}" y="${labelY + 4}" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="system-ui">${conn.label}</text>`;
		}
	}

	// Blocks
	for (const block of blocks) {
		const colors = {
			filing: { border: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
			cost: { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
			custom: { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' }
		};
		const color = colors[block.type] || colors.custom;

		svg += `<rect x="${block.x}" y="${block.y}" width="${block.width}" height="${block.height}" rx="8" fill="${color.bg}" stroke="${color.border}" stroke-width="2"/>`;
		svg += `<text x="${block.x + 12}" y="${block.y + 24}" fill="white" font-size="14" font-family="system-ui" font-weight="500">${block.label}</text>`;

		if (block.data.cost && (block.data.cost as number) > 0) {
			const cost = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(block.data.cost as number);
			svg += `<text x="${block.x + 12}" y="${block.y + 42}" fill="#94a3b8" font-size="12" font-family="system-ui">${cost}</text>`;
		}
	}

	svg += '</svg>';
	return svg;
}

// Export canvas as PNG
export async function exportCanvasToPNG() {
	if (!browser) return;

	const svgContent = generateSVG();
	const bounds = getCanvasBounds();

	// Create canvas
	const canvas = document.createElement('canvas');
	const scale = 2; // High DPI
	canvas.width = bounds.width * scale;
	canvas.height = bounds.height * scale;
	const ctx = canvas.getContext('2d')!;
	ctx.scale(scale, scale);

	// Convert SVG to image
	const img = new Image();
	const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(svgBlob);

	return new Promise<void>((resolve) => {
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(url);

			// Download
			const link = document.createElement('a');
			link.download = `strategy-${Date.now()}.png`;
			link.href = canvas.toDataURL('image/png');
			link.click();
			resolve();
		};
		img.src = url;
	});
}

// Export canvas as SVG
export function exportCanvasToSVG() {
	if (!browser) return;

	const svgContent = generateSVG();
	const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.download = `strategy-${Date.now()}.svg`;
	link.href = url;
	link.click();

	URL.revokeObjectURL(url);
}

// Export canvas as PDF
export async function exportCanvasToPDF() {
	if (!browser) return;

	const { jsPDF } = await import('jspdf');
	const bounds = getCanvasBounds();

	// Calculate PDF dimensions (max A4)
	const maxWidth = 595; // A4 width in points
	const maxHeight = 842; // A4 height in points
	const scale = Math.min(maxWidth / bounds.width, maxHeight / bounds.height, 1);
	const pdfWidth = bounds.width * scale;
	const pdfHeight = bounds.height * scale;

	const pdf = new jsPDF({
		orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
		unit: 'pt',
		format: [pdfWidth + 40, pdfHeight + 80]
	});

	// Title
	pdf.setFontSize(18);
	pdf.setTextColor(255, 255, 255);
	pdf.setFillColor(15, 23, 42);
	pdf.rect(0, 0, pdfWidth + 40, pdfHeight + 80, 'F');
	pdf.text('Filing Strategy', 20, 30);

	// Date
	pdf.setFontSize(10);
	pdf.setTextColor(148, 163, 184);
	pdf.text(new Date().toLocaleDateString(), 20, 45);

	// Add SVG as image
	const svgContent = generateSVG();
	const canvas = document.createElement('canvas');
	const dpiScale = 2;
	canvas.width = bounds.width * dpiScale;
	canvas.height = bounds.height * dpiScale;
	const ctx = canvas.getContext('2d')!;
	ctx.scale(dpiScale, dpiScale);

	const img = new Image();
	const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
	const url = URL.createObjectURL(svgBlob);

	return new Promise<void>((resolve) => {
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(url);

			const imgData = canvas.toDataURL('image/png');
			pdf.addImage(imgData, 'PNG', 20, 60, pdfWidth, pdfHeight);

			// Calculate total cost
			let totalCost = 0;
			for (const block of strategyStudioStore.blocks) {
				if (block.data.cost) {
					totalCost += block.data.cost as number;
				}
			}

			if (totalCost > 0) {
				pdf.setFontSize(12);
				pdf.setTextColor(34, 197, 94);
				const costText = `Total Estimated Cost: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(totalCost)}`;
				pdf.text(costText, pdfWidth + 20, pdfHeight + 70, { align: 'right' });
			}

			pdf.save(`strategy-${Date.now()}.pdf`);
			resolve();
		};
		img.src = url;
	});
}
