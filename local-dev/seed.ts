// Script to seed local development data files
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { seedPlayers, seedGames, generatePicks } from './data/seed-data';
import type { Player, Game, Pick } from '../src/types';

// Use same path logic as server.ts
const DATA_DIR = join(process.cwd(), 'local-dev', 'data');
const PLAYERS_FILE = join(DATA_DIR, 'players.json');
const GAMES_FILE = join(DATA_DIR, 'games.json');
const PICKS_FILE = join(DATA_DIR, 'picks.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Generate IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Seed players
const players: Player[] = seedPlayers.map(player => ({
  id: generateId(),
  ...player,
}));

// Seed games
const games: Game[] = seedGames.map(game => ({
  id: generateId(),
  ...game,
}));

// Generate picks for all players and games
const picks: Pick[] = generatePicks(players, games).map(pick => ({
  id: generateId(),
  ...pick,
}));

// Write data files
writeFileSync(PLAYERS_FILE, JSON.stringify(players, null, 2), 'utf-8');
writeFileSync(GAMES_FILE, JSON.stringify(games, null, 2), 'utf-8');
writeFileSync(PICKS_FILE, JSON.stringify(picks, null, 2), 'utf-8');

console.log('✅ Seeded data files:');
console.log(`   - Players: ${players.length}`);
console.log(`   - Games: ${games.length}`);
console.log(`   - Picks: ${picks.length}`);
console.log(`\n📁 Data files created in: ${DATA_DIR}`);
console.log(`\nRun from project root: cd .. && bun run local-dev/seed.ts`);
