import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CalculationSummary } from '$lib/stores/calculator.svelte';
import type { CalculationInput } from '$lib/data/types';
import { currencyStore } from '$lib/stores/currency.svelte';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
	interface jsPDF {
		lastAutoTable: { finalY: number };
	}
}

// Format currency using the currency store
function formatCurrency(amount: number): string {
	return currencyStore.format(amount);
}

// Format date for the report
function formatDate(): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(new Date());
}

// Technology field labels
const TECH_FIELD_LABELS: Record<string, string> = {
	mechanical: 'Mechanical',
	electrical: 'Electrical',
	software: 'Software',
	biotech: 'Biotechnology',
	chemical: 'Chemical',
	pharma: 'Pharmaceutical',
	other: 'Other'
};

// Filing strategy labels
const FILING_STRATEGY_LABELS: Record<string, string> = {
	direct: 'Direct Filing',
	pct: 'PCT Filing'
};

// Draw the PatiMate logo (globe + text) - centered on page
function drawLogo(doc: jsPDF, pageCenter: number, yPos: number): number {
	const globeSize = 18;
	const globeCenterY = yPos + globeSize / 2;

	// Calculate text widths to center the entire logo
	doc.setFontSize(24);
	doc.setFont('helvetica', 'bold');
	const patiWidth = doc.getTextWidth('Pati');
	const mateWidth = doc.getTextWidth('Mate');
	const textWidth = patiWidth + mateWidth;
	const gap = 4; // Gap between globe and text
	const totalLogoWidth = globeSize + gap + textWidth;

	// Calculate starting X position to center everything
	const logoStartX = pageCenter - totalLogoWidth / 2;
	const globeCenterX = logoStartX + globeSize / 2;
	const textStartX = logoStartX + globeSize + gap;

	// Draw globe - outer ring
	doc.setDrawColor(34, 197, 94); // Green #22c55e
	doc.setLineWidth(0.8);
	doc.circle(globeCenterX, globeCenterY, globeSize / 2, 'S');

	// Draw globe - horizontal ellipse (equator)
	doc.setLineWidth(0.5);
	doc.ellipse(globeCenterX, globeCenterY, globeSize / 2, globeSize / 5, 'S');

	// Draw globe - vertical ellipse (meridian)
	doc.ellipse(globeCenterX, globeCenterY, globeSize / 5, globeSize / 2, 'S');

	// Draw globe - center dot
	doc.setFillColor(34, 197, 94);
	doc.circle(globeCenterX, globeCenterY, 1.5, 'F');

	// Draw "Pati" text in dark slate
	doc.setTextColor(30, 41, 59);
	doc.text('Pati', textStartX, globeCenterY + 3);

	// Draw "Mate" text in green
	doc.setTextColor(34, 197, 94);
	doc.text('Mate', textStartX + patiWidth, globeCenterY + 3);

	return yPos + globeSize + 8;
}

export function exportToPDF(result: CalculationSummary, input: CalculationInput): void {
	const doc = new jsPDF();
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageCenter = pageWidth / 2;
	const contentMargin = 25; // Margin from page edges
	const contentWidth = pageWidth - contentMargin * 2;

	let yPos = 20;

	// ===== HEADER WITH LOGO =====
	yPos = drawLogo(doc, pageCenter, yPos);

	// Subtitle
	doc.setFontSize(12);
	doc.setTextColor(100, 116, 139); // Slate color
	doc.setFont('helvetica', 'normal');
	doc.text('Patent Cost Estimate Report', pageCenter, yPos, { align: 'center' });

	yPos += 7;
	doc.setFontSize(10);
	doc.setTextColor(148, 163, 184); // Lighter slate
	const currencyLabel = `${currencyStore.selectedCurrencyInfo.name} (${currencyStore.selectedCurrency})`;
	doc.text(`Generated on ${formatDate()} | Currency: ${currencyLabel}`, pageCenter, yPos, { align: 'center' });

	// Horizontal divider line
	yPos += 8;
	doc.setDrawColor(226, 232, 240); // Slate 200
	doc.setLineWidth(0.5);
	doc.line(contentMargin, yPos, pageWidth - contentMargin, yPos);

	// ===== CALCULATION PARAMETERS =====
	yPos += 12;
	doc.setFontSize(11);
	doc.setTextColor(30, 41, 59); // Dark slate
	doc.setFont('helvetica', 'bold');
	doc.text('Calculation Parameters', contentMargin, yPos);

	yPos += 8;
	doc.setFontSize(9);
	doc.setFont('helvetica', 'normal');
	doc.setTextColor(71, 85, 105); // Slate 600

	const filingStrategyLabel = input.filingStrategy
		? (FILING_STRATEGY_LABELS[input.filingStrategy] || input.filingStrategy)
		: 'Not Selected';

	const params = [
		['Countries:', `${result.countryCount} selected`],
		['Claims:', `${input.claims}`],
		['Pages:', `${input.pages}`],
		['Technology:', TECH_FIELD_LABELS[input.technologyField] || input.technologyField],
		['Filing Strategy:', filingStrategyLabel],
		['Maintenance:', `${result.maintenancePeriod} years`]
	];

	// Display params in two columns, properly aligned
	const col1X = contentMargin;
	const col2X = pageCenter + 5;
	const labelWidth = 28;

	params.forEach((param, idx) => {
		const isLeftCol = idx < 3;
		const xPos = isLeftCol ? col1X : col2X;
		const rowIdx = isLeftCol ? idx : idx - 3;
		const rowY = yPos + rowIdx * 5.5;

		doc.setFont('helvetica', 'bold');
		doc.text(param[0], xPos, rowY);
		doc.setFont('helvetica', 'normal');
		doc.text(param[1], xPos + labelWidth, rowY);
	});

	yPos += 18;

	// ===== TOTAL COST BOX =====
	const boxHeight = 22;
	doc.setFillColor(240, 253, 244); // Light green background
	doc.setDrawColor(187, 247, 208); // Green border
	doc.setLineWidth(0.3);
	doc.roundedRect(contentMargin, yPos, contentWidth, boxHeight, 3, 3, 'FD');

	yPos += 8;
	doc.setFontSize(9);
	doc.setTextColor(100, 116, 139);
	doc.setFont('helvetica', 'bold');
	doc.text('TOTAL ESTIMATED COST', pageCenter, yPos, { align: 'center' });

	yPos += 9;
	doc.setFontSize(20);
	doc.setTextColor(22, 163, 74); // Green 600
	doc.text(formatCurrency(result.totalCost), pageCenter, yPos, { align: 'center' });

	yPos += 12;

	// ===== COST SUMMARY TABLE =====
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(11);
	doc.setTextColor(30, 41, 59);
	doc.text('Cost Summary', contentMargin, yPos);

	yPos += 4;

	autoTable(doc, {
		startY: yPos,
		head: [['Category', 'Amount']],
		body: [
			['Official Fees', formatCurrency(result.totalOfficialFees)],
			['Foreign Attorney Fees', formatCurrency(result.totalForeignAttorneyFees)],
			['Attorney Fees', formatCurrency(result.totalAttorneyFees)],
			['Flat Fees', formatCurrency(result.totalFlatFees)],
			[
				'Translation Costs',
				result.totalTranslationCosts > 0 ? formatCurrency(result.totalTranslationCosts) : '-'
			],
			[`Maintenance (${result.maintenancePeriod}y)`, formatCurrency(result.totalMaintenanceFees)]
		],
		theme: 'striped',
		headStyles: {
			fillColor: [30, 41, 59],
			textColor: [255, 255, 255],
			fontStyle: 'bold',
			fontSize: 9,
			halign: 'center'
		},
		styles: {
			fontSize: 9,
			cellPadding: 3
		},
		columnStyles: {
			0: { halign: 'left' },
			1: { halign: 'right' }
		},
		tableWidth: contentWidth,
		margin: { left: contentMargin, right: contentMargin }
	});

	yPos = doc.lastAutoTable.finalY + 12;

	// ===== COUNTRY BREAKDOWN TABLE =====
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(11);
	doc.setTextColor(30, 41, 59);
	doc.text('Cost Breakdown by Country', contentMargin, yPos);

	yPos += 4;

	// Full width table for country breakdown, centered
	const countryTableWidth = contentWidth;

	autoTable(doc, {
		startY: yPos,
		head: [
			['Country', 'Official', 'Foreign Atty', 'Attorney', 'Flat Fee', 'Translation', 'Maint.', 'Total']
		],
		body: result.countryResults.map((country) => [
			country.name, // No emoji flag - just clean country name
			formatCurrency(country.officialFees),
			formatCurrency(country.foreignAttorneyFee),
			formatCurrency(country.attorneyFee),
			formatCurrency(country.flatFee),
			country.translationCosts > 0 ? formatCurrency(country.translationCosts) : '-',
			formatCurrency(country.maintenanceFees),
			formatCurrency(country.total)
		]),
		theme: 'striped',
		headStyles: {
			fillColor: [30, 41, 59],
			textColor: [255, 255, 255],
			fontStyle: 'bold',
			fontSize: 8,
			halign: 'center'
		},
		styles: {
			fontSize: 8,
			cellPadding: 2.5,
			halign: 'right'
		},
		columnStyles: {
			0: { halign: 'left', cellWidth: 45 }, // Country name left-aligned
			7: { fontStyle: 'bold', textColor: [22, 163, 74] } // Total in green bold
		},
		tableWidth: countryTableWidth,
		margin: { left: contentMargin, right: contentMargin }
	});

	// ===== FOOTER =====
	const finalY = doc.lastAutoTable.finalY + 12;
	doc.setFontSize(8);
	doc.setTextColor(148, 163, 184); // Slate 400
	doc.setFont('helvetica', 'italic');
	doc.text(
		'Estimates only. Actual costs may vary based on specific circumstances and fee changes.',
		pageCenter,
		finalY,
		{ align: 'center' }
	);

	// ===== SAVE =====
	const fileName = `PatiMate_Cost_Estimate_${new Date().toISOString().split('T')[0]}.pdf`;
	doc.save(fileName);
}
