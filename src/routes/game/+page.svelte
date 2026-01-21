<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import {
		ArrowLeft,
		Play,
		RotateCcw,
		Trophy,
		DollarSign,
		Globe,
		Zap,
		Heart,
		Flame,
		Volume2,
		VolumeX,
		Award
	} from '@lucide/svelte';

	// ============== GAME CONSTANTS ==============
	const GRID_SIZE = 20;
	const CELL_SIZE = 28;
	const INITIAL_BUDGET = 100000;
	const BUDGET_DRAIN_RATE = 30;
	const INITIAL_SPEED = 140;
	const MIN_SPEED = 60;
	const SPEED_INCREASE_PER_COUNTRY = 5;
	const INITIAL_LIVES = 3;
	const COMBO_TIMEOUT = 3000;
	const TROLL_SPAWN_INTERVAL = 5;
	const TROLL_DURATION = 8000;

	// ============== GAME STATE ==============
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animationFrame: number;
	let lastTime = 0;
	let accumulator = 0;

	let gameState = $state<'menu' | 'countdown' | 'playing' | 'paused' | 'gameover' | 'victory'>(
		'menu'
	);
	let countdownValue = $state(3);
	let score = $state(0);
	let budget = $state(INITIAL_BUDGET);
	let lives = $state(INITIAL_LIVES);
	let combo = $state(0);
	let comboTimer = $state(0);
	let currentSpeed = $state(INITIAL_SPEED);
	let countriesCollected = $state<string[]>([]);
	let currentMessage = $state('');
	let messageType = $state<'info' | 'success' | 'danger' | 'combo'>('info');
	let highScore = $state(0);
	let soundEnabled = $state(true);
	let screenShake = $state({ x: 0, y: 0, intensity: 0 });
	let showAchievementPopup = $state(false);
	let latestAchievement = $state('');

	// Snake state
	let snake: { x: number; y: number; targetX: number; targetY: number }[] = [];
	let direction: { x: number; y: number } = { x: 1, y: 0 };
	let nextDirection: { x: number; y: number } = { x: 1, y: 0 };
	let snakeSkin = $state<'green' | 'gold' | 'rainbow' | 'fire'>('green');

	// Patent Troll
	let troll = $state<{ x: number; y: number; active: boolean; timer: number }>({
		x: 0,
		y: 0,
		active: false,
		timer: 0
	});
	let trollPath = $state<{ x: number; y: number }[]>([]);

	// Particles
	interface Particle {
		x: number;
		y: number;
		vx: number;
		vy: number;
		life: number;
		maxLife: number;
		color: string;
		size: number;
		type: 'sparkle' | 'explosion' | 'trail' | 'combo';
	}
	let particles: Particle[] = [];

	// Items
	interface GameItem {
		x: number;
		y: number;
		type: 'country' | 'obstacle' | 'powerup';
		pulsePhase: number;
		data: {
			name: string;
			value?: number;
			effect?: string;
			emoji?: string;
			region?: string;
		};
	}
	let items: GameItem[] = [];

	// Achievements
	interface Achievement {
		id: string;
		name: string;
		description: string;
		icon: string;
		unlocked: boolean;
	}
	let achievements = $state<Achievement[]>([
		{
			id: 'first_filing',
			name: 'First Filing',
			description: 'Collect your first country',
			icon: '📝',
			unlocked: false
		},
		{
			id: 'globe_trotter',
			name: 'Globe Trotter',
			description: 'Collect 5 countries in one game',
			icon: '🌍',
			unlocked: false
		},
		{
			id: 'combo_master',
			name: 'Combo Master',
			description: 'Reach a 5x combo',
			icon: '🔥',
			unlocked: false
		},
		{
			id: 'troll_survivor',
			name: 'Troll Survivor',
			description: 'Escape the Patent Troll',
			icon: '👹',
			unlocked: false
		},
		{
			id: 'eu_master',
			name: 'EU Master',
			description: 'Collect 3 EU countries in one game',
			icon: '🇪🇺',
			unlocked: false
		},
		{
			id: 'budget_boss',
			name: 'Budget Boss',
			description: 'Win with over $50,000 remaining',
			icon: '💰',
			unlocked: false
		},
		{
			id: 'speed_demon',
			name: 'Speed Demon',
			description: 'Win at maximum speed',
			icon: '⚡',
			unlocked: false
		},
		{
			id: 'perfectionist',
			name: 'Perfectionist',
			description: 'Win without losing any lives',
			icon: '✨',
			unlocked: false
		}
	]);

	// ============== GAME DATA ==============
	const COUNTRIES = [
		{ name: 'USA', emoji: '🇺🇸', value: 5000, region: 'americas' },
		{ name: 'EU', emoji: '🇪🇺', value: 4000, region: 'eu' },
		{ name: 'Japan', emoji: '🇯🇵', value: 3500, region: 'asia' },
		{ name: 'China', emoji: '🇨🇳', value: 3000, region: 'asia' },
		{ name: 'Korea', emoji: '🇰🇷', value: 2500, region: 'asia' },
		{ name: 'UK', emoji: '🇬🇧', value: 2000, region: 'eu' },
		{ name: 'Germany', emoji: '🇩🇪', value: 2500, region: 'eu' },
		{ name: 'France', emoji: '🇫🇷', value: 2000, region: 'eu' },
		{ name: 'Canada', emoji: '🇨🇦', value: 1500, region: 'americas' },
		{ name: 'Australia', emoji: '🇦🇺', value: 1500, region: 'oceania' },
		{ name: 'India', emoji: '🇮🇳', value: 1000, region: 'asia' },
		{ name: 'Brazil', emoji: '🇧🇷', value: 1000, region: 'americas' },
		{ name: 'Mexico', emoji: '🇲🇽', value: 800, region: 'americas' },
		{ name: 'Singapore', emoji: '🇸🇬', value: 1200, region: 'asia' },
		{ name: 'Switzerland', emoji: '🇨🇭', value: 2200, region: 'eu' }
	];

	const OBSTACLES = [
		{ name: 'Rejection', emoji: '❌', effect: 'Lose $10,000', damage: 10000 },
		{ name: 'Office Action', emoji: '📋', effect: 'Lose $5,000', damage: 5000 },
		{ name: 'Translation Fee', emoji: '🔤', effect: 'Lose $3,000', damage: 3000 },
		{ name: 'Missed Deadline', emoji: '⏰', effect: 'Lose a life!', damage: 0, loseLife: true },
		{ name: 'Prior Art', emoji: '📚', effect: 'Lose $8,000', damage: 8000 },
		{ name: 'Attorney Fee', emoji: '👔', effect: 'Lose $7,000', damage: 7000 },
		{ name: 'Examiner Query', emoji: '🔍', effect: 'Lose $4,000', damage: 4000 }
	];

	const POWERUPS = [
		{ name: 'PCT Filing', emoji: '🛡️', effect: '+1 Life', grantLife: true },
		{ name: 'Fast Track', emoji: '⚡', effect: 'Bonus Points!', bonus: 8000 },
		{ name: 'Grant!', emoji: '✅', effect: '+$15,000', bonus: 15000 },
		{ name: 'IP Insurance', emoji: '🏦', effect: '+$10,000', bonus: 10000 }
	];

	const STRUGGLE_MESSAGES = [
		'Average patent takes 2-3 years to grant...',
		'Translation costs can exceed $50,000...',
		'60% of patents face at least one rejection...',
		'Maintenance fees continue for 20 years...',
		'Each country has different requirements...',
		'Missing a deadline = losing your rights...',
		'Patent trolls cost businesses $29B yearly...',
		'Only 50% of patent applications succeed...',
		'China receives most patent applications...',
		'PCT gives you 30 months to decide countries...'
	];

	// ============== AUDIO SYSTEM ==============
	let audioContext: AudioContext | null = null;

	function initAudio() {
		if (typeof window !== 'undefined' && !audioContext) {
			audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		}
	}

	function playSound(
		type: 'collect' | 'hit' | 'powerup' | 'combo' | 'gameover' | 'victory' | 'countdown' | 'troll'
	) {
		if (!soundEnabled || !audioContext) return;

		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		const now = audioContext.currentTime;

		switch (type) {
			case 'collect':
				oscillator.frequency.setValueAtTime(523.25, now); // C5
				oscillator.frequency.setValueAtTime(659.25, now + 0.1); // E5
				gainNode.gain.setValueAtTime(0.3, now);
				expDecay(gainNode,0.01, now + 0.2);
				oscillator.start(now);
				oscillator.stop(now + 0.2);
				break;
			case 'hit':
				oscillator.type = 'sawtooth';
				oscillator.frequency.setValueAtTime(200, now);
				oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
				gainNode.gain.setValueAtTime(0.4, now);
				expDecay(gainNode,0.01, now + 0.3);
				oscillator.start(now);
				oscillator.stop(now + 0.3);
				break;
			case 'powerup':
				oscillator.frequency.setValueAtTime(440, now);
				oscillator.frequency.setValueAtTime(554.37, now + 0.1);
				oscillator.frequency.setValueAtTime(659.25, now + 0.2);
				oscillator.frequency.setValueAtTime(880, now + 0.3);
				gainNode.gain.setValueAtTime(0.3, now);
				expDecay(gainNode,0.01, now + 0.4);
				oscillator.start(now);
				oscillator.stop(now + 0.4);
				break;
			case 'combo':
				oscillator.type = 'triangle';
				oscillator.frequency.setValueAtTime(880, now);
				oscillator.frequency.setValueAtTime(1108.73, now + 0.05);
				oscillator.frequency.setValueAtTime(1318.51, now + 0.1);
				gainNode.gain.setValueAtTime(0.25, now);
				expDecay(gainNode,0.01, now + 0.15);
				oscillator.start(now);
				oscillator.stop(now + 0.15);
				break;
			case 'gameover':
				oscillator.type = 'sawtooth';
				oscillator.frequency.setValueAtTime(440, now);
				oscillator.frequency.exponentialRampToValueAtTime(55, now + 1);
				gainNode.gain.setValueAtTime(0.4, now);
				expDecay(gainNode,0.01, now + 1);
				oscillator.start(now);
				oscillator.stop(now + 1);
				break;
			case 'victory':
				const notes = [523.25, 659.25, 783.99, 1046.5];
				notes.forEach((freq, i) => {
					const osc = audioContext!.createOscillator();
					const victoryGain = audioContext!.createGain();
					osc.connect(victoryGain);
					victoryGain.connect(audioContext!.destination);
					osc.frequency.setValueAtTime(freq, now + i * 0.15);
					victoryGain.gain.setValueAtTime(0.3, now + i * 0.15);
					victoryGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.15 + 0.3);
					osc.start(now + i * 0.15);
					osc.stop(now + i * 0.15 + 0.3);
				});
				return;
			case 'countdown':
				oscillator.frequency.setValueAtTime(440, now);
				gainNode.gain.setValueAtTime(0.3, now);
				expDecay(gainNode,0.01, now + 0.1);
				oscillator.start(now);
				oscillator.stop(now + 0.1);
				break;
			case 'troll':
				oscillator.type = 'sawtooth';
				oscillator.frequency.setValueAtTime(100, now);
				oscillator.frequency.setValueAtTime(150, now + 0.1);
				oscillator.frequency.setValueAtTime(100, now + 0.2);
				gainNode.gain.setValueAtTime(0.5, now);
				expDecay(gainNode,0.01, now + 0.3);
				oscillator.start(now);
				oscillator.stop(now + 0.3);
				break;
		}
	}

	// Helper for exponential decay
	function expDecay(gain: GainNode, value: number, endTime: number) {
		gain.gain.exponentialRampToValueAtTime(Math.max(value, 0.0001), endTime);
	}

	// ============== PARTICLE SYSTEM ==============
	function spawnParticles(
		x: number,
		y: number,
		count: number,
		color: string,
		type: Particle['type'] = 'sparkle'
	) {
		for (let i = 0; i < count; i++) {
			const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
			const speed = 2 + Math.random() * 4;
			particles.push({
				x: x * CELL_SIZE + CELL_SIZE / 2,
				y: y * CELL_SIZE + CELL_SIZE / 2,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life: 1,
				maxLife: 1,
				color,
				size: type === 'combo' ? 8 + Math.random() * 6 : 3 + Math.random() * 4,
				type
			});
		}
	}

	function spawnTrailParticle(x: number, y: number) {
		if (Math.random() > 0.3) return;
		const colors =
			snakeSkin === 'rainbow'
				? ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
				: snakeSkin === 'fire'
					? ['#ef4444', '#f97316', '#eab308']
					: snakeSkin === 'gold'
						? ['#fbbf24', '#f59e0b', '#d97706']
						: ['#22c55e', '#16a34a', '#15803d'];

		particles.push({
			x: x * CELL_SIZE + CELL_SIZE / 2 + (Math.random() - 0.5) * 10,
			y: y * CELL_SIZE + CELL_SIZE / 2 + (Math.random() - 0.5) * 10,
			vx: (Math.random() - 0.5) * 2,
			vy: (Math.random() - 0.5) * 2,
			life: 1,
			maxLife: 1,
			color: colors[Math.floor(Math.random() * colors.length)],
			size: 2 + Math.random() * 3,
			type: 'trail'
		});
	}

	function updateParticles(dt: number) {
		for (let i = particles.length - 1; i >= 0; i--) {
			const p = particles[i];
			p.x += p.vx;
			p.y += p.vy;
			p.vy += 0.1; // gravity
			p.life -= dt * 0.003;

			if (p.life <= 0) {
				particles.splice(i, 1);
			}
		}
	}

	function renderParticles() {
		for (const p of particles) {
			ctx.globalAlpha = p.life;
			ctx.fillStyle = p.color;

			if (p.type === 'sparkle' || p.type === 'combo') {
				// Star shape
				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.life * Math.PI * 2);
				ctx.beginPath();
				for (let i = 0; i < 5; i++) {
					const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
					const r = i % 2 === 0 ? p.size : p.size / 2;
					if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
					else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
				}
				ctx.closePath();
				ctx.fill();
				ctx.restore();
			} else {
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
				ctx.fill();
			}
		}
		ctx.globalAlpha = 1;
	}

	// ============== SCREEN SHAKE ==============
	function triggerShake(intensity: number) {
		screenShake.intensity = intensity;
	}

	function updateShake() {
		if (screenShake.intensity > 0) {
			screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
			screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
			screenShake.intensity *= 0.9;
			if (screenShake.intensity < 0.5) {
				screenShake.intensity = 0;
				screenShake.x = 0;
				screenShake.y = 0;
			}
		}
	}

	// ============== GAME INITIALIZATION ==============
	function initGame() {
		snake = [
			{ x: 5, y: 10, targetX: 5, targetY: 10 },
			{ x: 4, y: 10, targetX: 4, targetY: 10 },
			{ x: 3, y: 10, targetX: 3, targetY: 10 }
		];
		direction = { x: 1, y: 0 };
		nextDirection = { x: 1, y: 0 };
		budget = INITIAL_BUDGET;
		score = 0;
		lives = INITIAL_LIVES;
		combo = 0;
		comboTimer = 0;
		currentSpeed = INITIAL_SPEED;
		countriesCollected = [];
		currentMessage = '';
		items = [];
		particles = [];
		troll = { x: 0, y: 0, active: false, timer: 0 };

		// Spawn initial items
		for (let i = 0; i < 3; i++) spawnItem('country');
		spawnItem('obstacle');
		spawnItem('powerup');
	}

	function spawnItem(type: 'country' | 'obstacle' | 'powerup') {
		let x: number, y: number;
		let attempts = 0;

		do {
			x = Math.floor(Math.random() * GRID_SIZE);
			y = Math.floor(Math.random() * GRID_SIZE);
			attempts++;
		} while (isOccupied(x, y) && attempts < 100);

		if (attempts >= 100) return;

		let data: GameItem['data'];

		if (type === 'country') {
			const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
			data = {
				name: country.name,
				value: country.value,
				emoji: country.emoji,
				region: country.region
			};
		} else if (type === 'obstacle') {
			const obstacle = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
			data = { name: obstacle.name, effect: obstacle.effect, emoji: obstacle.emoji };
		} else {
			const powerup = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
			data = { name: powerup.name, effect: powerup.effect, emoji: powerup.emoji };
		}

		items.push({ x, y, type, pulsePhase: Math.random() * Math.PI * 2, data });
	}

	function isOccupied(x: number, y: number): boolean {
		if (snake.some((s) => s.x === x && s.y === y)) return true;
		if (items.some((i) => i.x === x && i.y === y)) return true;
		if (troll.active && troll.x === x && troll.y === y) return true;
		return false;
	}

	// ============== PATENT TROLL ==============
	function spawnTroll() {
		// Spawn troll at random edge
		const edge = Math.floor(Math.random() * 4);
		switch (edge) {
			case 0:
				troll.x = 0;
				troll.y = Math.floor(Math.random() * GRID_SIZE);
				break;
			case 1:
				troll.x = GRID_SIZE - 1;
				troll.y = Math.floor(Math.random() * GRID_SIZE);
				break;
			case 2:
				troll.x = Math.floor(Math.random() * GRID_SIZE);
				troll.y = 0;
				break;
			case 3:
				troll.x = Math.floor(Math.random() * GRID_SIZE);
				troll.y = GRID_SIZE - 1;
				break;
		}
		troll.active = true;
		troll.timer = TROLL_DURATION;
		trollPath = [];

		playSound('troll');
		showMessage('Patent Troll incoming!', 'danger');
	}

	function updateTroll(dt: number) {
		if (!troll.active) return;

		troll.timer -= dt;
		if (troll.timer <= 0) {
			troll.active = false;
			unlockAchievement('troll_survivor');
			showMessage('Patent Troll retreated!', 'success');
			return;
		}

		// Move troll towards snake head (simple pathfinding)
		if (Math.random() < 0.1) {
			const head = snake[0];
			const dx = head.x - troll.x;
			const dy = head.y - troll.y;

			if (Math.abs(dx) > Math.abs(dy)) {
				troll.x += Math.sign(dx);
			} else {
				troll.y += Math.sign(dy);
			}

			// Keep trail
			trollPath.push({ x: troll.x, y: troll.y });
			if (trollPath.length > 5) trollPath.shift();
		}

		// Check collision with snake
		if (troll.x === snake[0].x && troll.y === snake[0].y) {
			handleTrollCollision();
		}
	}

	function handleTrollCollision() {
		lives--;
		playSound('hit');
		triggerShake(20);
		spawnParticles(snake[0].x, snake[0].y, 20, '#ef4444', 'explosion');

		if (lives <= 0) {
			endGame('Caught by the Patent Troll!');
		} else {
			showMessage(`Patent Troll attack! Lives: ${lives}`, 'danger');
			troll.active = false;
		}
	}

	// ============== COMBO SYSTEM ==============
	function addCombo() {
		combo++;
		comboTimer = COMBO_TIMEOUT;

		if (combo >= 2) {
			playSound('combo');
			const multiplier = Math.min(combo, 10);
			spawnParticles(
				snake[0].x,
				snake[0].y,
				combo * 3,
				combo >= 5 ? '#f59e0b' : '#22c55e',
				'combo'
			);
			showMessage(`${multiplier}x COMBO!`, 'combo');
		}

		if (combo >= 5) {
			unlockAchievement('combo_master');
		}
	}

	function updateCombo(dt: number) {
		if (comboTimer > 0) {
			comboTimer -= dt;
			if (comboTimer <= 0) {
				combo = 0;
			}
		}
	}

	// ============== ACHIEVEMENTS ==============
	function unlockAchievement(id: string) {
		const achievement = achievements.find((a) => a.id === id);
		if (achievement && !achievement.unlocked) {
			achievement.unlocked = true;
			achievements = [...achievements];
			latestAchievement = `${achievement.icon} ${achievement.name}`;
			showAchievementPopup = true;

			// Save to localStorage
			const unlocked = achievements.filter((a) => a.unlocked).map((a) => a.id);
			localStorage.setItem('patimate_achievements', JSON.stringify(unlocked));

			// Unlock skins based on achievements
			const unlockedCount = achievements.filter((a) => a.unlocked).length;
			if (unlockedCount >= 3 && snakeSkin === 'green') {
				// Gold skin unlocked silently
			}
			if (unlockedCount >= 5) {
				// Rainbow skin unlocked silently
			}
			if (unlockedCount >= 7) {
				// Fire skin unlocked silently
			}

			setTimeout(() => {
				showAchievementPopup = false;
			}, 3000);
		}
	}

	function loadAchievements() {
		const stored = localStorage.getItem('patimate_achievements');
		if (stored) {
			const unlocked: string[] = JSON.parse(stored);
			achievements = achievements.map((a) => ({
				...a,
				unlocked: unlocked.includes(a.id)
			}));
		}
	}

	// ============== REGIONAL BONUS ==============
	function checkRegionalBonus() {
		const euCountries = countriesCollected.filter((c) => {
			const country = COUNTRIES.find((cc) => cc.name === c);
			return country?.region === 'eu';
		});

		if (euCountries.length >= 3) {
			unlockAchievement('eu_master');
			score += 10000;
			showMessage('EU Master Bonus! +$10,000', 'success');
		}
	}

	// ============== GAME STEP ==============
	function gameStep() {
		if (gameState !== 'playing') return;

		direction = nextDirection;

		const head = snake[0];
		const newHead = {
			x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
			y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
			targetX: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
			targetY: (head.y + direction.y + GRID_SIZE) % GRID_SIZE
		};

		// Self-collision
		if (snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
			lives--;
			playSound('hit');
			triggerShake(15);
			spawnParticles(newHead.x, newHead.y, 15, '#ef4444', 'explosion');

			if (lives <= 0) {
				endGame('You tangled your patent portfolio!');
				return;
			}

			showMessage(`Ouch! Lives remaining: ${lives}`, 'danger');
			// Reset position
			snake = [
				{ x: 5, y: 10, targetX: 5, targetY: 10 },
				{ x: 4, y: 10, targetX: 4, targetY: 10 },
				{ x: 3, y: 10, targetX: 3, targetY: 10 }
			];
			direction = { x: 1, y: 0 };
			nextDirection = { x: 1, y: 0 };
			return;
		}

		snake.unshift(newHead);

		// Trail particles
		spawnTrailParticle(newHead.x, newHead.y);

		// Item collision
		const itemIndex = items.findIndex((i) => i.x === newHead.x && i.y === newHead.y);
		if (itemIndex !== -1) {
			const item = items[itemIndex];
			handleItemCollision(item);
			items.splice(itemIndex, 1);

			// Respawn items
			if (item.type === 'country') {
				spawnItem('country');
				if (Math.random() < 0.4) spawnItem('obstacle');
				if (Math.random() < 0.2) spawnItem('powerup');
			} else if (item.type === 'obstacle') {
				spawnItem('obstacle');
				if (Math.random() < 0.25) spawnItem('powerup');
			} else {
				if (Math.random() < 0.5) spawnItem('powerup');
			}
		} else {
			snake.pop();
		}

		// Drain budget
		budget -= BUDGET_DRAIN_RATE;

		// Random messages
		if (Math.random() < 0.015) {
			showMessage(STRUGGLE_MESSAGES[Math.floor(Math.random() * STRUGGLE_MESSAGES.length)], 'info');
		}

		// Spawn troll
		if (
			countriesCollected.length > 0 &&
			countriesCollected.length % TROLL_SPAWN_INTERVAL === 0 &&
			!troll.active
		) {
			if (countriesCollected.length / TROLL_SPAWN_INTERVAL > trollSpawnCount) {
				trollSpawnCount++;
				spawnTroll();
			}
		}

		// Check budget
		if (budget <= 0) {
			endGame('You ran out of budget!');
			return;
		}

		// Victory
		if (countriesCollected.length >= 10) {
			victory();
			return;
		}
	}

	let trollSpawnCount = 0;

	function handleItemCollision(item: GameItem) {
		if (item.type === 'country') {
			const baseValue = item.data.value || 1000;
			const multiplier = Math.min(combo + 1, 10);
			const finalValue = baseValue * multiplier;

			score += finalValue;
			countriesCollected = [...countriesCollected, item.data.name];
			addCombo();

			playSound('collect');
			spawnParticles(item.x, item.y, 12, '#22c55e', 'sparkle');

			// Increase difficulty
			currentSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - countriesCollected.length * SPEED_INCREASE_PER_COUNTRY);

			showMessage(
				`Filed in ${item.data.name}! +$${finalValue.toLocaleString()}${multiplier > 1 ? ` (${multiplier}x)` : ''}`,
				'success'
			);

			// Achievement checks
			if (countriesCollected.length === 1) unlockAchievement('first_filing');
			if (countriesCollected.length >= 5) unlockAchievement('globe_trotter');

			checkRegionalBonus();
		} else if (item.type === 'obstacle') {
			const obstacle = OBSTACLES.find((o) => o.name === item.data.name);

			if (obstacle?.loseLife) {
				lives--;
				playSound('hit');
				triggerShake(20);
				spawnParticles(item.x, item.y, 20, '#ef4444', 'explosion');

				if (lives <= 0) {
					endGame('You missed a critical deadline!');
					return;
				}
				showMessage(`${item.data.emoji} Missed Deadline! Lives: ${lives}`, 'danger');
			} else {
				const damage = obstacle?.damage || 5000;
				budget -= damage;
				combo = 0; // Reset combo
				playSound('hit');
				triggerShake(10);
				spawnParticles(item.x, item.y, 10, '#ef4444', 'explosion');
				showMessage(`${item.data.emoji} ${item.data.name}: -$${damage.toLocaleString()}`, 'danger');
			}

			// Shrink snake
			if (snake.length > 3) {
				snake.pop();
			}
		} else if (item.type === 'powerup') {
			const powerup = POWERUPS.find((p) => p.name === item.data.name);

			if (powerup?.grantLife) {
				lives = Math.min(lives + 1, 5);
				playSound('powerup');
				spawnParticles(item.x, item.y, 15, '#3b82f6', 'sparkle');
				showMessage(`${item.data.emoji} Extra Life! Lives: ${lives}`, 'success');
			} else if (powerup?.bonus) {
				budget += powerup.bonus;
				score += powerup.bonus;
				playSound('powerup');
				spawnParticles(item.x, item.y, 15, '#fbbf24', 'sparkle');
				showMessage(`${item.data.emoji} ${item.data.name}: +$${powerup.bonus.toLocaleString()}`, 'success');
			}
		}
	}

	function showMessage(msg: string, type: 'info' | 'success' | 'danger' | 'combo') {
		currentMessage = msg;
		messageType = type;
		setTimeout(() => {
			if (currentMessage === msg) currentMessage = '';
		}, 2500);
	}

	function endGame(reason: string) {
		gameState = 'gameover';
		playSound('gameover');
		currentMessage = reason;

		if (score > highScore) {
			highScore = score;
			localStorage.setItem('patimate_game_highscore', String(highScore));
		}

		if (animationFrame) cancelAnimationFrame(animationFrame);
	}

	function victory() {
		gameState = 'victory';
		playSound('victory');
		currentMessage = 'Patent portfolio complete!';
		score += budget; // Remaining budget bonus

		// Achievement checks
		if (budget >= 50000) unlockAchievement('budget_boss');
		if (currentSpeed <= MIN_SPEED + 10) unlockAchievement('speed_demon');
		if (lives === INITIAL_LIVES) unlockAchievement('perfectionist');

		if (score > highScore) {
			highScore = score;
			localStorage.setItem('patimate_game_highscore', String(highScore));
		}

		if (animationFrame) cancelAnimationFrame(animationFrame);
	}

	// ============== RENDERING ==============
	function render(time: number) {
		if (!ctx) return;

		const width = GRID_SIZE * CELL_SIZE;
		const height = GRID_SIZE * CELL_SIZE;

		// Update shake
		updateShake();

		// Clear with shake offset
		ctx.save();
		ctx.translate(screenShake.x, screenShake.y);

		// Background
		ctx.fillStyle = '#0f172a';
		ctx.fillRect(0, 0, width, height);

		// Grid with subtle gradient
		const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
		gradient.addColorStop(0, '#1e293b');
		gradient.addColorStop(1, '#0f172a');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);

		// Grid lines
		ctx.strokeStyle = '#1e293b';
		ctx.lineWidth = 1;
		for (let i = 0; i <= GRID_SIZE; i++) {
			ctx.beginPath();
			ctx.moveTo(i * CELL_SIZE, 0);
			ctx.lineTo(i * CELL_SIZE, height);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(0, i * CELL_SIZE);
			ctx.lineTo(width, i * CELL_SIZE);
			ctx.stroke();
		}

		// Update item pulse phases
		for (const item of items) {
			item.pulsePhase += 0.1;
		}

		// Draw items with glow
		for (const item of items) {
			const pulse = Math.sin(item.pulsePhase) * 0.3 + 1;
			const glow = item.type === 'powerup' ? '#fbbf24' : item.type === 'country' ? '#22c55e' : '#ef4444';

			// Glow effect
			ctx.shadowColor = glow;
			ctx.shadowBlur = 15 * pulse;

			ctx.font = `${(CELL_SIZE - 4) * pulse}px sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(
				item.data.emoji || '?',
				item.x * CELL_SIZE + CELL_SIZE / 2,
				item.y * CELL_SIZE + CELL_SIZE / 2
			);

			ctx.shadowBlur = 0;
		}

		// Draw troll
		if (troll.active) {
			// Troll trail
			ctx.globalAlpha = 0.3;
			for (let i = 0; i < trollPath.length; i++) {
				const p = trollPath[i];
				ctx.fillStyle = '#7c3aed';
				ctx.beginPath();
				ctx.arc(
					p.x * CELL_SIZE + CELL_SIZE / 2,
					p.y * CELL_SIZE + CELL_SIZE / 2,
					CELL_SIZE / 3,
					0,
					Math.PI * 2
				);
				ctx.fill();
			}
			ctx.globalAlpha = 1;

			// Troll body
			const trollPulse = Math.sin(time * 0.01) * 0.2 + 1;
			ctx.shadowColor = '#7c3aed';
			ctx.shadowBlur = 20 * trollPulse;
			ctx.font = `${CELL_SIZE * trollPulse}px sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('👹', troll.x * CELL_SIZE + CELL_SIZE / 2, troll.y * CELL_SIZE + CELL_SIZE / 2);
			ctx.shadowBlur = 0;
		}

		// Draw snake
		const skinColors = {
			green: { head: '#22c55e', body: (i: number, len: number) => `rgb(34, ${197 - (i / len) * 80}, 94)` },
			gold: { head: '#fbbf24', body: (i: number, len: number) => `rgb(${251 - (i / len) * 50}, ${191 - (i / len) * 50}, 36)` },
			rainbow: {
				head: '#ef4444',
				body: (i: number, _len: number) => {
					const hue = (i * 30) % 360;
					return `hsl(${hue}, 70%, 50%)`;
				}
			},
			fire: {
				head: '#ef4444',
				body: (i: number, len: number) => {
					const ratio = i / len;
					return ratio < 0.5 ? '#f97316' : '#eab308';
				}
			}
		};

		const colors = skinColors[snakeSkin];

		for (let i = snake.length - 1; i >= 0; i--) {
			const segment = snake[i];
			const isHead = i === 0;

			if (isHead) {
				// Head glow
				ctx.shadowColor = colors.head;
				ctx.shadowBlur = 15;

				ctx.fillStyle = colors.head;
				ctx.beginPath();
				ctx.arc(
					segment.x * CELL_SIZE + CELL_SIZE / 2,
					segment.y * CELL_SIZE + CELL_SIZE / 2,
					CELL_SIZE / 2 - 2,
					0,
					Math.PI * 2
				);
				ctx.fill();

				ctx.shadowBlur = 0;

				// Eyes
				ctx.fillStyle = 'white';
				const eyeOffset = 5;
				ctx.beginPath();
				ctx.arc(
					segment.x * CELL_SIZE + CELL_SIZE / 2 - eyeOffset,
					segment.y * CELL_SIZE + CELL_SIZE / 2 - 4,
					4,
					0,
					Math.PI * 2
				);
				ctx.arc(
					segment.x * CELL_SIZE + CELL_SIZE / 2 + eyeOffset,
					segment.y * CELL_SIZE + CELL_SIZE / 2 - 4,
					4,
					0,
					Math.PI * 2
				);
				ctx.fill();

				// Pupils
				ctx.fillStyle = '#0f172a';
				ctx.beginPath();
				ctx.arc(
					segment.x * CELL_SIZE + CELL_SIZE / 2 - eyeOffset + direction.x * 2,
					segment.y * CELL_SIZE + CELL_SIZE / 2 - 4 + direction.y * 2,
					2,
					0,
					Math.PI * 2
				);
				ctx.arc(
					segment.x * CELL_SIZE + CELL_SIZE / 2 + eyeOffset + direction.x * 2,
					segment.y * CELL_SIZE + CELL_SIZE / 2 - 4 + direction.y * 2,
					2,
					0,
					Math.PI * 2
				);
				ctx.fill();
			} else {
				ctx.fillStyle = colors.body(i, snake.length);
				ctx.beginPath();
				ctx.roundRect(
					segment.x * CELL_SIZE + 3,
					segment.y * CELL_SIZE + 3,
					CELL_SIZE - 6,
					CELL_SIZE - 6,
					5
				);
				ctx.fill();
			}
		}

		// Draw particles
		renderParticles();

		// Combo indicator
		if (combo >= 2 && comboTimer > 0) {
			const comboAlpha = comboTimer / COMBO_TIMEOUT;
			ctx.globalAlpha = comboAlpha;
			ctx.fillStyle = combo >= 5 ? '#f59e0b' : '#22c55e';
			ctx.font = 'bold 24px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(
				`${Math.min(combo, 10)}x`,
				snake[0].x * CELL_SIZE + CELL_SIZE / 2,
				snake[0].y * CELL_SIZE - 10
			);
			ctx.globalAlpha = 1;
		}

		ctx.restore();
	}

	// ============== GAME LOOP ==============
	function gameLoop(time: number) {
		if (gameState !== 'playing') return;

		const dt = time - lastTime;
		lastTime = time;
		accumulator += dt;

		// Update combo
		updateCombo(dt);

		// Update troll
		updateTroll(dt);

		// Update particles
		updateParticles(dt);

		// Fixed timestep for game logic
		while (accumulator >= currentSpeed) {
			gameStep();
			accumulator -= currentSpeed;
		}

		// Render
		render(time);

		animationFrame = requestAnimationFrame(gameLoop);
	}

	// ============== COUNTDOWN ==============
	async function startCountdown() {
		initGame();
		trollSpawnCount = 0;
		gameState = 'countdown';
		render(0);

		for (let i = 3; i > 0; i--) {
			countdownValue = i;
			playSound('countdown');
			await new Promise((r) => setTimeout(r, 800));
		}

		gameState = 'playing';
		lastTime = performance.now();
		accumulator = 0;
		animationFrame = requestAnimationFrame(gameLoop);
	}

	// ============== INPUT ==============
	function handleKeydown(e: KeyboardEvent) {
		if (gameState === 'menu' || gameState === 'gameover' || gameState === 'victory') {
			if (e.key === ' ' || e.key === 'Enter') {
				initAudio();
				startCountdown();
			}
			return;
		}

		if (gameState !== 'playing') return;

		switch (e.key) {
			case 'ArrowUp':
			case 'w':
			case 'W':
				if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
				break;
			case 'ArrowDown':
			case 's':
			case 'S':
				if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
				break;
			case 'ArrowLeft':
			case 'a':
			case 'A':
				if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
				break;
			case 'ArrowRight':
			case 'd':
			case 'D':
				if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
				break;
		}
	}

	function cycleSkin() {
		const skins: typeof snakeSkin[] = ['green', 'gold', 'rainbow', 'fire'];
		const unlockedCount = achievements.filter((a) => a.unlocked).length;

		// Unlock skins based on achievement count
		const availableSkins = skins.slice(0, Math.min(1 + Math.floor(unlockedCount / 2), 4));
		const currentIndex = availableSkins.indexOf(snakeSkin);
		snakeSkin = availableSkins[(currentIndex + 1) % availableSkins.length];
	}

	// ============== LIFECYCLE ==============
	onMount(() => {
		ctx = canvas.getContext('2d')!;

		// Load data
		const storedScore = localStorage.getItem('patimate_game_highscore');
		if (storedScore) highScore = parseInt(storedScore);
		loadAchievements();

		// Initial render
		initGame();
		render(0);

		window.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		if (animationFrame) cancelAnimationFrame(animationFrame);
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeydown);
		}
	});

	function formatMoney(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}
</script>

<svelte:head>
	<title>Patent Rush - PatiMate</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
	<!-- Header -->
	<header class="border-b border-white/10 bg-slate-900/50 px-6 py-4">
		<div class="mx-auto flex max-w-6xl items-center justify-between">
			<Button variant="ghost" onclick={() => goto('/home')} class="text-slate-400 hover:text-white">
				<ArrowLeft class="mr-2 h-4 w-4" />
				Back
			</Button>
			<div class="flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					onclick={() => (soundEnabled = !soundEnabled)}
					class="text-slate-400 hover:text-white"
				>
					{#if soundEnabled}
						<Volume2 class="h-5 w-5" />
					{:else}
						<VolumeX class="h-5 w-5" />
					{/if}
				</Button>
				<div class="flex items-center gap-2 text-yellow-400">
					<Trophy class="h-5 w-5" />
					<span class="font-mono text-lg">{formatMoney(highScore)}</span>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Game Area -->
	<main class="flex flex-1 flex-col items-center justify-center gap-4 p-4">
		<h1 class="text-4xl font-bold text-white">
			Patent <span class="text-green-400">Rush</span>
		</h1>

		<!-- Game Stats -->
		<div class="flex flex-wrap justify-center gap-4 rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2">
			<div class="flex items-center gap-2">
				<DollarSign class="h-4 w-4 text-green-400" />
				<span
					class="font-mono text-sm text-white transition-colors"
					class:text-red-400={budget < 20000}
					class:animate-pulse={budget < 10000}
				>
					{formatMoney(budget)}
				</span>
			</div>
			<div class="flex items-center gap-2">
				<Globe class="h-4 w-4 text-blue-400" />
				<span class="font-mono text-sm text-white">{countriesCollected.length}/10</span>
			</div>
			<div class="flex items-center gap-2">
				<Zap class="h-4 w-4 text-yellow-400" />
				<span class="font-mono text-sm text-white">{formatMoney(score)}</span>
			</div>
			<div class="flex items-center gap-1">
				{#each Array(lives) as _, i}
					<Heart class="h-4 w-4 fill-red-500 text-red-500" />
				{/each}
				{#each Array(INITIAL_LIVES - lives) as _, i}
					<Heart class="h-4 w-4 text-slate-600" />
				{/each}
			</div>
			{#if combo >= 2}
				<div class="flex items-center gap-1 rounded bg-orange-500/20 px-2 py-0.5">
					<Flame class="h-4 w-4 text-orange-400" />
					<span class="font-mono text-sm font-bold text-orange-400">{combo}x</span>
				</div>
			{/if}
		</div>

		<!-- Game Canvas Container -->
		<div class="relative">
			<canvas
				bind:this={canvas}
				width={GRID_SIZE * CELL_SIZE}
				height={GRID_SIZE * CELL_SIZE}
				class="rounded-lg border-2 border-white/20 shadow-2xl"
			></canvas>

			<!-- Message Overlay -->
			{#if currentMessage && gameState === 'playing'}
				<div
					class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg px-4 py-2 text-center font-medium text-white transition-all {messageType === 'success' ? 'bg-green-500/90' : messageType === 'danger' ? 'bg-red-500/90' : messageType === 'combo' ? 'bg-orange-500/90 scale-110' : 'bg-slate-800/90'}"
				>
					{currentMessage}
				</div>
			{/if}

			<!-- Countdown Overlay -->
			{#if gameState === 'countdown'}
				<div
					class="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/70"
				>
					<div class="text-8xl font-bold text-green-400 animate-pulse">
						{countdownValue}
					</div>
					<p class="mt-4 text-xl text-white">Get Ready!</p>
				</div>
			{/if}

			<!-- Menu Overlay -->
			{#if gameState === 'menu'}
				<div
					class="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/80 p-6"
				>
					<h2 class="mb-2 text-2xl font-bold text-white">Ready to File?</h2>
					<p class="mb-4 max-w-xs text-center text-sm text-slate-400">
						Navigate the complex world of international patent filing. Collect countries, avoid obstacles, escape the Patent Troll!
					</p>

					<div class="mb-4 grid grid-cols-3 gap-2 text-xs text-slate-400">
						<div class="flex flex-col items-center">
							<span class="text-2xl">🇺🇸🇪🇺</span>
							<span>Collect</span>
						</div>
						<div class="flex flex-col items-center">
							<span class="text-2xl">❌⏰</span>
							<span>Avoid</span>
						</div>
						<div class="flex flex-col items-center">
							<span class="text-2xl">👹</span>
							<span>Escape!</span>
						</div>
					</div>

					<Button onclick={() => { initAudio(); startCountdown(); }} class="bg-green-600 hover:bg-green-500">
						<Play class="mr-2 h-4 w-4" />
						Start Game
					</Button>

					<p class="mt-4 text-xs text-slate-500">Arrow keys or WASD to move</p>

					<!-- Skin selector -->
					<button
						onclick={cycleSkin}
						class="mt-4 flex items-center gap-2 rounded border border-white/10 px-3 py-1 text-xs text-slate-400 hover:bg-white/5"
					>
						Snake Skin:
						<span
							class="h-4 w-4 rounded-full"
							class:bg-green-500={snakeSkin === 'green'}
							class:bg-yellow-500={snakeSkin === 'gold'}
							class:bg-gradient-to-r={snakeSkin === 'rainbow'}
							class:from-red-500={snakeSkin === 'rainbow'}
							class:via-yellow-500={snakeSkin === 'rainbow'}
							class:to-blue-500={snakeSkin === 'rainbow'}
							class:bg-orange-500={snakeSkin === 'fire'}
						></span>
						{snakeSkin}
					</button>
				</div>
			{/if}

			<!-- Game Over Overlay -->
			{#if gameState === 'gameover'}
				<div
					class="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/80"
				>
					<h2 class="mb-2 text-3xl font-bold text-red-400">Game Over</h2>
					<p class="mb-4 text-white">{currentMessage}</p>
					<div class="mb-4 text-center">
						<p class="text-slate-400">Countries Filed: {countriesCollected.length}</p>
						<p class="text-2xl font-bold text-green-400">{formatMoney(score)}</p>
					</div>
					{#if countriesCollected.length > 0}
						<div class="mb-4 flex flex-wrap justify-center gap-1">
							{#each countriesCollected as country}
								<span class="rounded bg-green-600/20 px-2 py-0.5 text-xs text-green-400"
									>{country}</span
								>
							{/each}
						</div>
					{/if}
					<Button onclick={() => { initAudio(); startCountdown(); }} class="bg-green-600 hover:bg-green-500">
						<RotateCcw class="mr-2 h-4 w-4" />
						Try Again
					</Button>
				</div>
			{/if}

			<!-- Victory Overlay -->
			{#if gameState === 'victory'}
				<div
					class="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/80"
				>
					<h2 class="mb-2 text-3xl font-bold text-yellow-400">Victory!</h2>
					<p class="mb-2 text-white">{currentMessage}</p>
					<p class="mb-4 text-sm text-slate-400">Budget Bonus: +{formatMoney(budget)}</p>
					<div class="mb-4 flex flex-wrap justify-center gap-1">
						{#each countriesCollected as country}
							<span class="rounded bg-green-600/20 px-2 py-0.5 text-xs text-green-400"
								>{country}</span
							>
						{/each}
					</div>
					<p class="mb-4 text-3xl font-bold text-green-400">{formatMoney(score)}</p>
					<Button onclick={() => { initAudio(); startCountdown(); }} class="bg-green-600 hover:bg-green-500">
						<Play class="mr-2 h-4 w-4" />
						Play Again
					</Button>
				</div>
			{/if}

			<!-- Achievement Popup -->
			{#if showAchievementPopup}
				<div
					class="absolute top-4 left-1/2 -translate-x-1/2 animate-bounce rounded-lg border border-yellow-500/50 bg-yellow-500/20 px-4 py-2"
				>
					<div class="flex items-center gap-2 text-yellow-400">
						<Award class="h-5 w-5" />
						<span class="font-bold">Achievement Unlocked!</span>
					</div>
					<p class="text-center text-white">{latestAchievement}</p>
				</div>
			{/if}
		</div>

		<!-- Countries collected -->
		{#if countriesCollected.length > 0 && gameState === 'playing'}
			<div class="flex flex-wrap justify-center gap-1">
				{#each countriesCollected as country}
					<span class="rounded bg-green-600/20 px-2 py-0.5 text-xs text-green-400">{country}</span>
				{/each}
			</div>
		{/if}

		<!-- Troll Warning -->
		{#if troll.active && gameState === 'playing'}
			<div class="animate-pulse rounded-lg border border-purple-500/50 bg-purple-500/20 px-4 py-2">
				<span class="flex items-center gap-2 text-purple-400">
					<span class="text-xl">👹</span>
					<span class="font-bold">Patent Troll is chasing you!</span>
					<span class="text-sm">({Math.ceil(troll.timer / 1000)}s)</span>
				</span>
			</div>
		{/if}

		<!-- Achievements -->
		<div class="flex flex-wrap justify-center gap-2">
			{#each achievements as achievement}
				<div
					class="flex items-center gap-1 rounded px-2 py-1 text-xs transition-all {achievement.unlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800/50 text-slate-600'}"
					title={achievement.description}
				>
					<span>{achievement.icon}</span>
					<span class={achievement.unlocked ? '' : 'line-through'}>{achievement.name}</span>
				</div>
			{/each}
		</div>
	</main>
</div>
