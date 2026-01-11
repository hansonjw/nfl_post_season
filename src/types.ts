// NFL Team abbreviations
export type TeamAbbreviation =
  | 'ARI' | 'ATL' | 'BAL' | 'BUF' | 'CAR' | 'CHI' | 'CIN' | 'CLE'
  | 'DAL' | 'DEN' | 'DET' | 'GB' | 'HOU' | 'IND' | 'JAX' | 'KC'
  | 'LAC' | 'LAR' | 'LV' | 'MIA' | 'MIN' | 'NE' | 'NO' | 'NYG'
  | 'NYJ' | 'PHI' | 'PIT' | 'SEA' | 'SF' | 'TB' | 'TEN' | 'WAS';

// Playoff round types
export type PlayoffRound = 
  | 'Wild Card'
  | 'Divisional'
  | 'Conference'
  | 'Super Bowl';

// NFL Conferences
export type Conference = 'AFC' | 'NFC';

// Game/matchup structure
export interface Game {
  id: string;
  round: PlayoffRound;
  conference?: Conference; // AFC or NFC for rounds 1-3, undefined for Super Bowl
  week: number; // Week within the playoffs (1-4 typically)
  homeTeam?: TeamAbbreviation; // Optional for games that haven't been established yet
  awayTeam?: TeamAbbreviation; // Optional for games that haven't been established yet
  homeScore?: number;
  awayScore?: number;
  winner?: TeamAbbreviation;
  completed: boolean;
}

// Player/family member
export interface Player {
  id: string;
  name: string;
  color?: string; // Optional color for UI
}

// A pick made by a player
export interface Pick {
  id: string;
  playerId: string;
  gameId: string;
  pickedTeam: TeamAbbreviation;
  isCorrect?: boolean; // Calculated after game completes
}

// Player's overall score
export interface PlayerScore {
  playerId: string;
  playerName: string;
  totalCorrect: number;
  totalPicks: number;
  percentage: number;
}

