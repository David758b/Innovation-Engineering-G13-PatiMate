// Strategy Studio Store - manages blocks, connections, and custom strategies

export type BlockType = 'filing' | 'cost' | 'custom' | 'milestone';
export type ConnectionPort = 'top' | 'bottom' | 'left' | 'right';

export interface StudioBlock {
	id: string;
	type: BlockType;
	category: string; // e.g., 'priority', 'pct', 'national', 'translation', 'attorney', etc.
	label: string;
	x: number;
	y: number;
	width: number;
	height: number;
	data: Record<string, unknown>; // Custom data like costs, deadlines, notes
}

export interface StudioConnection {
	id: string;
	fromBlockId: string;
	toBlockId: string;
	fromPort: ConnectionPort;
	toPort: ConnectionPort;
	label: string; // e.g., "12 months", "If approved"
	style: 'solid' | 'dashed';
	lineType: 'straight' | 'curved';
}

export interface CustomStrategy {
	id: string;
	name: string;
	blocks: StudioBlock[];
	connections: StudioConnection[];
	createdAt: number;
}

// Predefined block templates (costs in DKK)
export const BLOCK_TEMPLATES: Omit<StudioBlock, 'id' | 'x' | 'y'>[] = [
	// Filing Steps
	{ type: 'filing', category: 'priority', label: 'Priority Application', width: 200, height: 60, data: { cost: 25000 } },
	{ type: 'filing', category: 'pct', label: 'PCT International', width: 200, height: 60, data: { cost: 53000, deadline: '12 months' } },
	{ type: 'filing', category: 'national', label: 'National Phase Entry', width: 200, height: 60, data: { cost: 0, deadline: '30 months' } },
	{ type: 'filing', category: 'examination', label: 'Examination', width: 200, height: 60, data: { cost: 14000 } },
	{ type: 'filing', category: 'grant', label: 'Patent Grant', width: 200, height: 60, data: { cost: 7000 } },
	{ type: 'filing', category: 'maintenance', label: 'Maintenance/Annuities', width: 200, height: 60, data: { cost: 0 } },
	// Danish-specific filing steps
	{ type: 'filing', category: 'dk-application', label: 'DK Application', width: 180, height: 60, data: { cost: 14000, deadline: '0 months', note: 'Priority Date' } },
	{ type: 'filing', category: 'novelty-search', label: 'Novelty Search', width: 180, height: 60, data: { cost: 10500, deadline: '7-9 months' } },
	{ type: 'filing', category: 'publication', label: 'Publication', width: 180, height: 60, data: { cost: 0, deadline: '18 months' } },
	{ type: 'filing', category: 'office-action', label: 'Office Action(s)', width: 180, height: 60, data: { cost: 7000 } },
	{ type: 'filing', category: 'dk-patent', label: 'DK Patent', width: 180, height: 60, data: { cost: 3500, note: 'Max 20 years' } },
	// PCT-specific steps
	{ type: 'filing', category: 'pct-search', label: 'International Search Report', width: 180, height: 60, data: { cost: 15000, deadline: '16 months' } },
	{ type: 'filing', category: 'pct-publication', label: 'Publication', width: 180, height: 60, data: { cost: 0, deadline: '18 months' } },
	{ type: 'filing', category: 'pct-demand', label: 'Demand (option)', width: 180, height: 60, data: { cost: 12500, deadline: '22 months', note: 'Optional' } },
	{ type: 'filing', category: 'pct-report', label: 'PCT Final Report', width: 180, height: 60, data: { cost: 0, deadline: '28 months' } },
	// Regional entries
	{ type: 'filing', category: 'ep-entry', label: 'EP Entry', width: 140, height: 50, data: { cost: 35000, deadline: '31 months' } },
	{ type: 'filing', category: 'us-entry', label: 'US Entry', width: 140, height: 50, data: { cost: 28000, deadline: '30 months' } },
	{ type: 'filing', category: 'cn-entry', label: 'CN Entry', width: 140, height: 50, data: { cost: 21000, deadline: '30 months' } },
	// Cost Items
	{ type: 'cost', category: 'translation', label: 'Translation', width: 160, height: 50, data: { cost: 17500 } },
	{ type: 'cost', category: 'attorney', label: 'Attorney Fees', width: 160, height: 50, data: { cost: 21000 } },
	{ type: 'cost', category: 'official', label: 'Official Fees', width: 160, height: 50, data: { cost: 3500 } },
	{ type: 'cost', category: 'search', label: 'Search Fee', width: 160, height: 50, data: { cost: 15000 } },
	// Custom templates
	{ type: 'custom', category: 'review', label: 'Internal Review', width: 180, height: 50, data: {} },
	{ type: 'custom', category: 'approval', label: 'Board Approval', width: 180, height: 50, data: {} },
	{ type: 'custom', category: 'meeting', label: 'Inventor Meeting', width: 180, height: 50, data: {} },
	{ type: 'custom', category: 'note', label: 'Note', width: 160, height: 80, data: { text: '' } },
	// Preparation steps (pre-application)
	{ type: 'filing', category: 'preliminary-search', label: 'Preliminary Search (option)', width: 180, height: 50, data: { cost: 3500, note: 'Optional preliminary search' } },
	{ type: 'filing', category: 'write-application', label: 'Write Application', width: 160, height: 50, data: { cost: 14000, note: 'Write patent application' } },
	// Milestone/Junction blocks - connectable timeline markers
	{ type: 'milestone', category: 'timeline', label: '12 months', width: 130, height: 46, data: { months: 12 } },
	{ type: 'milestone', category: 'endpoint', label: 'Max. 20 years', width: 160, height: 46, data: { note: 'Maximum patent lifetime' } },
	{ type: 'milestone', category: 'timeline', label: '30-31 months', width: 155, height: 46, data: { months: 30 } },
];

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Grid settings
const GRID_SIZE = 20;

function snapToGrid(value: number): number {
	return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function createStrategyStudioStore() {
	// Current canvas state
	let blocks = $state<StudioBlock[]>([]);
	let connections = $state<StudioConnection[]>([]);
	let selectedBlockId = $state<string | null>(null);
	let selectedConnectionId = $state<string | null>(null);

	// Custom strategies created this session
	let customStrategies = $state<CustomStrategy[]>([]);

	// Canvas state
	let canvasOffset = $state({ x: 0, y: 0 });
	let canvasZoom = $state(0.35);

	// Connection drawing state
	let isDrawingConnection = $state(false);
	let connectionStart = $state<{ blockId: string; port: ConnectionPort } | null>(null);

	// Grid & snapping
	let snapEnabled = $state(true);
	let alignmentGuides = $state<{ x: number | null; y: number | null }>({ x: null, y: null });

	// Clipboard for copy/paste
	let clipboard = $state<StudioBlock | null>(null);

	// Preview mode state
	let previewingStrategyId = $state<string | null>(null);

	// Undo/redo history
	let history = $state<{ blocks: StudioBlock[]; connections: StudioConnection[] }[]>([]);
	let historyIndex = $state(-1);
	const MAX_HISTORY = 50;

	function saveToHistory() {
		// Remove any future states if we're not at the end
		if (historyIndex < history.length - 1) {
			history = history.slice(0, historyIndex + 1);
		}
		// Add current state
		history = [...history, {
			blocks: JSON.parse(JSON.stringify(blocks)),
			connections: JSON.parse(JSON.stringify(connections))
		}];
		// Keep only last MAX_HISTORY states
		if (history.length > MAX_HISTORY) {
			history = history.slice(-MAX_HISTORY);
		}
		historyIndex = history.length - 1;
	}

	function findAlignmentGuides(blockId: string, x: number, y: number): { x: number | null; y: number | null; snapX: number; snapY: number } {
		const currentBlock = blocks.find(b => b.id === blockId);
		if (!currentBlock) return { x: null, y: null, snapX: x, snapY: y };

		let guideX: number | null = null;
		let guideY: number | null = null;
		let snapX = x;
		let snapY = y;
		const threshold = 10;

		for (const block of blocks) {
			if (block.id === blockId) continue;

			// Check horizontal alignment (center to center)
			const blockCenterX = block.x + block.width / 2;
			const currentCenterX = x + currentBlock.width / 2;
			if (Math.abs(blockCenterX - currentCenterX) < threshold) {
				guideX = blockCenterX;
				snapX = blockCenterX - currentBlock.width / 2;
			}

			// Check vertical alignment (center to center)
			const blockCenterY = block.y + block.height / 2;
			const currentCenterY = y + currentBlock.height / 2;
			if (Math.abs(blockCenterY - currentCenterY) < threshold) {
				guideY = blockCenterY;
				snapY = blockCenterY - currentBlock.height / 2;
			}

			// Check left edge alignment
			if (Math.abs(block.x - x) < threshold) {
				guideX = block.x;
				snapX = block.x;
			}

			// Check top edge alignment
			if (Math.abs(block.y - y) < threshold) {
				guideY = block.y;
				snapY = block.y;
			}
		}

		return { x: guideX, y: guideY, snapX, snapY };
	}

	return {
		get blocks() { return blocks; },
		get connections() { return connections; },
		get selectedBlockId() { return selectedBlockId; },
		get selectedConnectionId() { return selectedConnectionId; },
		get customStrategies() { return customStrategies; },
		get canvasOffset() { return canvasOffset; },
		get canvasZoom() { return canvasZoom; },
		get isDrawingConnection() { return isDrawingConnection; },
		get connectionStart() { return connectionStart; },
		get snapEnabled() { return snapEnabled; },
		get alignmentGuides() { return alignmentGuides; },
		get canUndo() { return historyIndex > 0; },
		get canRedo() { return historyIndex < history.length - 1; },
		get clipboard() { return clipboard; },
		get previewingStrategyId() { return previewingStrategyId; },
		get isPreviewMode() { return previewingStrategyId !== null; },
		GRID_SIZE,

		get selectedBlock() {
			return blocks.find(b => b.id === selectedBlockId) || null;
		},

		get selectedConnection() {
			return connections.find(c => c.id === selectedConnectionId) || null;
		},

		get previewingStrategy() {
			if (!previewingStrategyId) return null;
			return customStrategies.find(s => s.id === previewingStrategyId) || null;
		},

		toggleSnap() {
			snapEnabled = !snapEnabled;
		},

		// Preview mode operations
		previewStrategy(strategyId: string) {
			previewingStrategyId = strategyId;
		},

		closePreview() {
			previewingStrategyId = null;
		},

		editPreviewedStrategy() {
			if (previewingStrategyId) {
				const strategyId = previewingStrategyId;
				previewingStrategyId = null;
				// Load the strategy into the editor
				const strategy = customStrategies.find(s => s.id === strategyId);
				if (strategy) {
					blocks = JSON.parse(JSON.stringify(strategy.blocks));
					connections = JSON.parse(JSON.stringify(strategy.connections));
					selectedBlockId = null;
					selectedConnectionId = null;
					saveToHistory();
				}
			}
		},

		// Copy/Paste operations
		copySelectedBlock() {
			if (selectedBlockId) {
				const block = blocks.find(b => b.id === selectedBlockId);
				if (block) {
					// Deep copy the block (without the id, we'll generate a new one on paste)
					clipboard = JSON.parse(JSON.stringify(block));
				}
			}
		},

		pasteBlock(x?: number, y?: number) {
			if (!clipboard) return null;

			// Calculate paste position - offset from original or use provided coordinates
			const pasteX = x ?? clipboard.x + 30;
			const pasteY = y ?? clipboard.y + 30;

			const finalX = snapEnabled ? snapToGrid(pasteX) : pasteX;
			const finalY = snapEnabled ? snapToGrid(pasteY) : pasteY;

			const newBlock: StudioBlock = {
				...clipboard,
				id: generateId(),
				x: finalX,
				y: finalY,
				data: { ...clipboard.data }
			};

			blocks = [...blocks, newBlock];
			selectedBlockId = newBlock.id;
			saveToHistory();
			return newBlock;
		},

		// Block operations
		addBlock(template: Omit<StudioBlock, 'id' | 'x' | 'y'>, x: number, y: number) {
			const finalX = snapEnabled ? snapToGrid(x) : x;
			const finalY = snapEnabled ? snapToGrid(y) : y;
			const block: StudioBlock = {
				...template,
				id: generateId(),
				x: finalX,
				y: finalY,
				data: { ...template.data }
			};
			blocks = [...blocks, block];
			saveToHistory();
			return block;
		},

		updateBlock(id: string, updates: Partial<StudioBlock>) {
			blocks = blocks.map(b => b.id === id ? { ...b, ...updates } : b);
			saveToHistory();
		},

		updateBlockPosition(id: string, x: number, y: number) {
			let finalX = x;
			let finalY = y;

			// Check for alignment guides first
			const guides = findAlignmentGuides(id, x, y);
			alignmentGuides = { x: guides.x, y: guides.y };

			if (guides.x !== null || guides.y !== null) {
				finalX = guides.snapX;
				finalY = guides.snapY;
			} else if (snapEnabled) {
				finalX = snapToGrid(x);
				finalY = snapToGrid(y);
			}

			blocks = blocks.map(b => b.id === id ? { ...b, x: finalX, y: finalY } : b);
		},

		// Called when drag ends to save history and clear guides
		finishBlockMove() {
			alignmentGuides = { x: null, y: null };
			saveToHistory();
		},

		updateBlockData(id: string, data: Record<string, unknown>) {
			blocks = blocks.map(b => b.id === id ? { ...b, data: { ...b.data, ...data } } : b);
			saveToHistory();
		},

		deleteBlock(id: string) {
			blocks = blocks.filter(b => b.id !== id);
			// Also delete connections involving this block
			connections = connections.filter(c => c.fromBlockId !== id && c.toBlockId !== id);
			if (selectedBlockId === id) selectedBlockId = null;
			saveToHistory();
		},

		// Undo/Redo
		undo() {
			if (historyIndex > 0) {
				historyIndex--;
				const state = history[historyIndex];
				blocks = JSON.parse(JSON.stringify(state.blocks));
				connections = JSON.parse(JSON.stringify(state.connections));
				selectedBlockId = null;
				selectedConnectionId = null;
			}
		},

		redo() {
			if (historyIndex < history.length - 1) {
				historyIndex++;
				const state = history[historyIndex];
				blocks = JSON.parse(JSON.stringify(state.blocks));
				connections = JSON.parse(JSON.stringify(state.connections));
				selectedBlockId = null;
				selectedConnectionId = null;
			}
		},

		selectBlock(id: string | null) {
			selectedBlockId = id;
			selectedConnectionId = null;
		},

		// Connection operations
		startConnection(fromBlockId: string, fromPort: ConnectionPort) {
			isDrawingConnection = true;
			connectionStart = { blockId: fromBlockId, port: fromPort };
		},

		cancelConnection() {
			isDrawingConnection = false;
			connectionStart = null;
		},

		completeConnection(toBlockId: string, toPort: ConnectionPort, label: string = '') {
			if (connectionStart && connectionStart.blockId !== toBlockId) {
				// Check if connection already exists (same blocks and ports)
				const exists = connections.some(
					c => c.fromBlockId === connectionStart!.blockId &&
					     c.toBlockId === toBlockId &&
					     c.fromPort === connectionStart!.port &&
					     c.toPort === toPort
				);
				if (!exists) {
					const connection: StudioConnection = {
						id: generateId(),
						fromBlockId: connectionStart.blockId,
						toBlockId,
						fromPort: connectionStart.port,
						toPort,
						label,
						style: 'solid',
						lineType: 'curved'
					};
					connections = [...connections, connection];
					saveToHistory();
				}
			}
			isDrawingConnection = false;
			connectionStart = null;
		},

		updateConnection(id: string, updates: Partial<StudioConnection>) {
			connections = connections.map(c => c.id === id ? { ...c, ...updates } : c);
			saveToHistory();
		},

		deleteConnection(id: string) {
			connections = connections.filter(c => c.id !== id);
			if (selectedConnectionId === id) selectedConnectionId = null;
			saveToHistory();
		},

		selectConnection(id: string | null) {
			selectedConnectionId = id;
			selectedBlockId = null;
		},

		// Canvas operations
		setCanvasOffset(x: number, y: number) {
			canvasOffset = { x, y };
		},

		setCanvasZoom(zoom: number) {
			canvasZoom = Math.max(0.25, Math.min(2, zoom));
		},

		// Auto-layout algorithm - arranges blocks in a flowchart layout
		autoLayout() {
			if (blocks.length === 0) return;

			// Find root nodes (blocks with no incoming connections)
			const hasIncoming = new Set(connections.map(c => c.toBlockId));
			const roots = blocks.filter(b => !hasIncoming.has(b.id));

			// If no roots, just use first block
			const startNodes = roots.length > 0 ? roots : [blocks[0]];

			// BFS to assign levels
			const levels: Map<string, number> = new Map();
			const queue: { id: string; level: number }[] = startNodes.map(b => ({ id: b.id, level: 0 }));
			const visited = new Set<string>();

			while (queue.length > 0) {
				const { id, level } = queue.shift()!;
				if (visited.has(id)) continue;
				visited.add(id);
				levels.set(id, Math.max(levels.get(id) ?? 0, level));

				// Find outgoing connections
				const outgoing = connections.filter(c => c.fromBlockId === id);
				for (const conn of outgoing) {
					if (!visited.has(conn.toBlockId)) {
						queue.push({ id: conn.toBlockId, level: level + 1 });
					}
				}
			}

			// Add any unvisited blocks
			for (const block of blocks) {
				if (!levels.has(block.id)) {
					levels.set(block.id, 0);
				}
			}

			// Group blocks by level
			const levelGroups: Map<number, StudioBlock[]> = new Map();
			for (const block of blocks) {
				const level = levels.get(block.id) ?? 0;
				if (!levelGroups.has(level)) {
					levelGroups.set(level, []);
				}
				levelGroups.get(level)!.push(block);
			}

			// Position blocks
			const verticalGap = 120;
			const horizontalGap = 40;
			const startX = 100;
			const startY = 50;

			const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);

			for (const level of sortedLevels) {
				const blocksAtLevel = levelGroups.get(level)!;
				const totalWidth = blocksAtLevel.reduce((sum, b) => sum + b.width, 0) + (blocksAtLevel.length - 1) * horizontalGap;
				let currentX = startX + (400 - totalWidth / 2); // Center around x=400

				for (const block of blocksAtLevel) {
					const newX = snapEnabled ? snapToGrid(currentX) : currentX;
					const newY = snapEnabled ? snapToGrid(startY + level * verticalGap) : startY + level * verticalGap;
					blocks = blocks.map(b => b.id === block.id ? { ...b, x: newX, y: newY } : b);
					currentX += block.width + horizontalGap;
				}
			}

			saveToHistory();
		},

		// Strategy operations
		saveAsStrategy(name: string) {
			const strategy: CustomStrategy = {
				id: generateId(),
				name,
				blocks: JSON.parse(JSON.stringify(blocks)),
				connections: JSON.parse(JSON.stringify(connections)),
				createdAt: Date.now()
			};
			customStrategies = [...customStrategies, strategy];
			return strategy;
		},

		loadStrategy(strategyId: string) {
			const strategy = customStrategies.find(s => s.id === strategyId);
			if (strategy) {
				blocks = JSON.parse(JSON.stringify(strategy.blocks));
				connections = JSON.parse(JSON.stringify(strategy.connections));
				selectedBlockId = null;
				selectedConnectionId = null;
				// Reset canvas view to ensure blocks are visible
				canvasOffset = { x: 0, y: 0 };
				canvasZoom = 0.35;
			}
		},

		deleteStrategy(strategyId: string) {
			customStrategies = customStrategies.filter(s => s.id !== strategyId);
		},

		// Load the DK+PCT predefined template
		loadTemplate(type: 'dk-pct') {
			blocks = [];
			connections = [];
			selectedBlockId = null;
			selectedConnectionId = null;

			if (type === 'dk-pct') {
				// Danish Priority + PCT Strategy (based on Danish patent filing diagram)
				// This creates two parallel paths: Danish national path and PCT international path
				// Includes preparation steps and milestone junction points for branching
				// Layout optimized for visibility with generous spacing between blocks

				// === PREPARATION STEPS ===
				// Preliminary Search (optional) - connects from top of DK Application
				const prelimSearch = this.addBlock(BLOCK_TEMPLATES[26], 320, 20);
				// Write Application - connects from left side of DK Application
				const writeApp = this.addBlock(BLOCK_TEMPLATES[27], 80, 165);

				// === TOP ROW: Danish National Path (y=160) ===
				// DK Application (Priority Date) - 0 months
				const dkApp = this.addBlock(BLOCK_TEMPLATES[6], 320, 160);
				// Novelty Search - 7-9 months
				const noveltySearch = this.addBlock(BLOCK_TEMPLATES[7], 560, 160);
				// 12 months junction milestone - aligned with Danish path
				const milestone12 = this.addBlock(BLOCK_TEMPLATES[28], 800, 167);
				// Publication - 18 months
				const dkPublication = this.addBlock(BLOCK_TEMPLATES[8], 960, 160);
				// Office Action(s)
				const officeAction = this.addBlock(BLOCK_TEMPLATES[9], 1200, 160);
				// DK Patent
				const dkPatent = this.addBlock(BLOCK_TEMPLATES[10], 1440, 160);
				// Max 20 years endpoint milestone - aligned with Danish path
				const maxYears = this.addBlock(BLOCK_TEMPLATES[29], 1680, 167);

				// === BOTTOM ROW: PCT International Path (y=400) ===
				// PCT Application (filed at 12 months) - centered under milestone12
				const pctApp = this.addBlock(BLOCK_TEMPLATES[1], 750, 400);
				// International Search Report - 16 months
				const pctSearch = this.addBlock(BLOCK_TEMPLATES[11], 1010, 400);
				// International Publication - 18 months
				const pctPublication = this.addBlock(BLOCK_TEMPLATES[12], 1250, 400);
				// Demand (Optional) - 22 months
				const pctDemand = this.addBlock(BLOCK_TEMPLATES[13], 1490, 400);
				// PCT Final Report - 28 months
				const pctReport = this.addBlock(BLOCK_TEMPLATES[14], 1730, 400);
				// 30-31 months milestone - aligned with PCT path
				const milestone30 = this.addBlock(BLOCK_TEMPLATES[30], 1970, 407);

				// === NATIONAL PHASE ENTRIES ===
				const epEntry = this.addBlock(BLOCK_TEMPLATES[15], 2150, 330);
				const usEntry = this.addBlock(BLOCK_TEMPLATES[16], 2150, 405);
				const cnEntry = this.addBlock(BLOCK_TEMPLATES[17], 2150, 480);

				connections = [
					// Preparation steps connect directly to DK Application
					{ id: generateId(), fromBlockId: prelimSearch.id, toBlockId: dkApp.id, fromPort: 'bottom', toPort: 'top', label: '', style: 'dashed', lineType: 'straight' },
					{ id: generateId(), fromBlockId: writeApp.id, toBlockId: dkApp.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },

					// Danish National Path connections
					{ id: generateId(), fromBlockId: dkApp.id, toBlockId: noveltySearch.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },
					{ id: generateId(), fromBlockId: noveltySearch.id, toBlockId: milestone12.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },

					// From 12 mdr. milestone - branches to both paths
					{ id: generateId(), fromBlockId: milestone12.id, toBlockId: dkPublication.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },
					{ id: generateId(), fromBlockId: milestone12.id, toBlockId: pctApp.id, fromPort: 'bottom', toPort: 'top', label: '', style: 'dashed', lineType: 'straight' },

					// Danish Path continues
					{ id: generateId(), fromBlockId: dkPublication.id, toBlockId: officeAction.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },
					{ id: generateId(), fromBlockId: officeAction.id, toBlockId: dkPatent.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },
					{ id: generateId(), fromBlockId: dkPatent.id, toBlockId: maxYears.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },

					// PCT Path connections
					{ id: generateId(), fromBlockId: pctApp.id, toBlockId: pctSearch.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },
					{ id: generateId(), fromBlockId: pctSearch.id, toBlockId: pctPublication.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },
					{ id: generateId(), fromBlockId: pctPublication.id, toBlockId: pctDemand.id, fromPort: 'right', toPort: 'left', label: '', style: 'dashed', lineType: 'straight' },
					{ id: generateId(), fromBlockId: pctDemand.id, toBlockId: pctReport.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },
					{ id: generateId(), fromBlockId: pctReport.id, toBlockId: milestone30.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },

					// From 30-31 mdr. milestone to National Phase entries
					{ id: generateId(), fromBlockId: milestone30.id, toBlockId: epEntry.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },
					{ id: generateId(), fromBlockId: milestone30.id, toBlockId: usEntry.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' },
					{ id: generateId(), fromBlockId: milestone30.id, toBlockId: cnEntry.id, fromPort: 'right', toPort: 'left', label: '', style: 'solid', lineType: 'straight' }
				];
			}
		},

		// Clear canvas
		clearCanvas() {
			blocks = [];
			connections = [];
			selectedBlockId = null;
			selectedConnectionId = null;
		}
	};
}

export const strategyStudioStore = createStrategyStudioStore();
