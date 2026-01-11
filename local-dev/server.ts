// Local development server that simulates the Lambda API
// Run with: bun run local-dev/server.ts
// or: node --loader ts-node/esm local-dev/server.ts

import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { Player, Game, Pick } from '../src/types';

const app = express();
const PORT = 3001;
const DATA_DIR = join(process.cwd(), 'local-dev', 'data');
const PLAYERS_FILE = join(DATA_DIR, 'players.json');
const GAMES_FILE = join(DATA_DIR, 'games.json');
const PICKS_FILE = join(DATA_DIR, 'picks.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
if (!existsSync(PLAYERS_FILE)) {
  writeFileSync(PLAYERS_FILE, '[]', 'utf-8');
}
if (!existsSync(GAMES_FILE)) {
  writeFileSync(GAMES_FILE, '[]', 'utf-8');
}
if (!existsSync(PICKS_FILE)) {
  writeFileSync(PICKS_FILE, '[]', 'utf-8');
}

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions
function readData<T>(file: string): T[] {
  try {
    const data = readFileSync(file, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    return [];
  }
}

function writeData<T>(file: string, data: T[]): void {
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// Generate ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Routes

// GET /players
app.get('/players', (req, res) => {
  const players = readData<Player>(PLAYERS_FILE);
  res.json({ players });
});

// POST /players (admin only - no auth for local dev)
app.post('/players', (req, res) => {
  const players = readData<Player>(PLAYERS_FILE);
  const { name, color } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const player: Player = {
    id: generateId(),
    name,
    color,
  };
  
  players.push(player);
  writeData(PLAYERS_FILE, players);
  res.status(201).json({ player });
});

// PUT /players/:id
app.put('/players/:id', (req, res) => {
  const players = readData<Player>(PLAYERS_FILE);
  const index = players.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Player not found' });
  }
  
  const { name, color } = req.body;
  if (name !== undefined) players[index].name = name;
  if (color !== undefined) players[index].color = color;
  
  writeData(PLAYERS_FILE, players);
  res.json({ player: players[index] });
});

// DELETE /players/:id
app.delete('/players/:id', (req, res) => {
  const players = readData<Player>(PLAYERS_FILE);
  const index = players.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Player not found' });
  }
  
  players.splice(index, 1);
  writeData(PLAYERS_FILE, players);
  res.json({ success: true });
});

// GET /games
app.get('/games', (req, res) => {
  console.log('Reading games from:', GAMES_FILE);
  const games = readData<Game>(GAMES_FILE);
  console.log(`Found ${games.length} games`);
  games.sort((a, b) => {
    const roundOrder = ['Wild Card', 'Divisional', 'Conference', 'Super Bowl'];
    const roundDiff = roundOrder.indexOf(a.round) - roundOrder.indexOf(b.round);
    if (roundDiff !== 0) return roundDiff;
    return a.week - b.week;
  });
  res.json({ games });
});

// POST /games
app.post('/games', (req, res) => {
  const games = readData<Game>(GAMES_FILE);
  const { round, conference, week, homeTeam, awayTeam } = req.body;
  
  if (!round || !homeTeam || !awayTeam) {
    return res.status(400).json({ error: 'Round, homeTeam, and awayTeam are required' });
  }
  
  const game: Game = {
    id: generateId(),
    round,
    conference, // AFC, NFC, or undefined for Super Bowl
    week: week || 1,
    homeTeam,
    awayTeam,
    completed: false,
  };
  
  games.push(game);
  writeData(GAMES_FILE, games);
  res.status(201).json({ game });
});

// PUT /games/:id
app.put('/games/:id', (req, res) => {
  const games = readData<Game>(GAMES_FILE);
  const index = games.findIndex(g => g.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  const updates = req.body;
  Object.keys(updates).forEach(key => {
    if (key !== 'id') {
      (games[index] as any)[key] = updates[key];
    }
  });
  
  // If winner is set, update pick correctness
  if (updates.winner && updates.completed) {
    const picks = readData<Pick>(PICKS_FILE);
    picks.forEach(pick => {
      if (pick.gameId === games[index].id) {
        pick.isCorrect = pick.pickedTeam === updates.winner;
      }
    });
    writeData(PICKS_FILE, picks);
  }
  
  writeData(GAMES_FILE, games);
  res.json({ game: games[index] });
});

// GET /picks
app.get('/picks', (req, res) => {
  const picks = readData<Pick>(PICKS_FILE);
  const { playerId, gameId } = req.query;
  
  let filteredPicks = picks;
  if (playerId) {
    filteredPicks = filteredPicks.filter(p => p.playerId === playerId);
  }
  if (gameId) {
    filteredPicks = filteredPicks.filter(p => p.gameId === gameId);
  }
  
  res.json({ picks: filteredPicks });
});

// POST /picks
app.post('/picks', (req, res) => {
  const picks = readData<Pick>(PICKS_FILE);
  const games = readData<Game>(GAMES_FILE);
  const { playerId, gameId, pickedTeam } = req.body;
  
  if (!playerId || !gameId || !pickedTeam) {
    return res.status(400).json({ error: 'playerId, gameId, and pickedTeam are required' });
  }
  
  const game = games.find(g => g.id === gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  if (pickedTeam !== game.homeTeam && pickedTeam !== game.awayTeam) {
    return res.status(400).json({ error: 'pickedTeam must be either homeTeam or awayTeam' });
  }
  
  // Check if pick already exists
  const existingIndex = picks.findIndex(p => p.playerId === playerId && p.gameId === gameId);
  
  let isCorrect: boolean | undefined;
  if (game.completed && game.winner) {
    isCorrect = pickedTeam === game.winner;
  }
  
  if (existingIndex !== -1) {
    // Update existing pick
    picks[existingIndex].pickedTeam = pickedTeam;
    picks[existingIndex].isCorrect = isCorrect;
    writeData(PICKS_FILE, picks);
    return res.json({ pick: picks[existingIndex] });
  }
  
  const pick: Pick = {
    id: generateId(),
    playerId,
    gameId,
    pickedTeam,
    isCorrect,
  };
  
  picks.push(pick);
  writeData(PICKS_FILE, picks);
  res.status(201).json({ pick });
});

// PUT /picks/:id
app.put('/picks/:id', (req, res) => {
  const picks = readData<Pick>(PICKS_FILE);
  const games = readData<Game>(GAMES_FILE);
  const index = picks.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Pick not found' });
  }
  
  const updates = req.body;
  
  if (updates.pickedTeam) {
    const game = games.find(g => g.id === picks[index].gameId);
    if (game && updates.pickedTeam !== game.homeTeam && updates.pickedTeam !== game.awayTeam) {
      return res.status(400).json({ error: 'pickedTeam must be either homeTeam or awayTeam' });
    }
    
    if (game && game.completed && game.winner) {
      updates.isCorrect = updates.pickedTeam === game.winner;
    }
  }
  
  Object.keys(updates).forEach(key => {
    if (key !== 'id') {
      (picks[index] as any)[key] = updates[key];
    }
  });
  
  writeData(PICKS_FILE, picks);
  res.json({ pick: picks[index] });
});

// GET /scoreboard
app.get('/scoreboard', (req, res) => {
  const players = readData<Player>(PLAYERS_FILE);
  const picks = readData<Pick>(PICKS_FILE);
  const games = readData<Game>(GAMES_FILE);
  
  const gameWinners = new Map<string, string>();
  games.forEach(game => {
    if (game.winner) {
      gameWinners.set(game.id, game.winner);
    }
  });
  
  const scores = players.map(player => {
    const playerPicks = picks.filter(p => p.playerId === player.id);
    const completedPicks = playerPicks.filter(p => gameWinners.has(p.gameId));
    
    let totalCorrect = 0;
    completedPicks.forEach(pick => {
      const winner = gameWinners.get(pick.gameId);
      if (winner === pick.pickedTeam) {
        totalCorrect++;
      }
    });
    
    return {
      playerId: player.id,
      playerName: player.name,
      totalCorrect,
      totalPicks: completedPicks.length,
      percentage: completedPicks.length > 0 
        ? Math.round((totalCorrect / completedPicks.length) * 100) 
        : 0,
    };
  });
  
  scores.sort((a, b) => {
    if (b.percentage !== a.percentage) {
      return b.percentage - a.percentage;
    }
    return b.totalCorrect - a.totalCorrect;
  });
  
  res.json({ scores });
});

app.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📁 Data stored in: ${DATA_DIR}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    /players`);
  console.log(`  POST   /players`);
  console.log(`  PUT    /players/:id`);
  console.log(`  GET    /games`);
  console.log(`  POST   /games`);
  console.log(`  PUT    /games/:id`);
  console.log(`  GET    /picks`);
  console.log(`  POST   /picks`);
  console.log(`  PUT    /picks/:id`);
  console.log(`  GET    /scoreboard`);
});

