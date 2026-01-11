// Shared types for Lambda functions (matches frontend types)
export type TeamAbbreviation =
  | 'ARI' | 'ATL' | 'BAL' | 'BUF' | 'CAR' | 'CHI' | 'CIN' | 'CLE'
  | 'DAL' | 'DEN' | 'DET' | 'GB' | 'HOU' | 'IND' | 'JAX' | 'KC'
  | 'LAC' | 'LAR' | 'LV' | 'MIA' | 'MIN' | 'NE' | 'NO' | 'NYG'
  | 'NYJ' | 'PHI' | 'PIT' | 'SEA' | 'SF' | 'TB' | 'TEN' | 'WAS';

export type PlayoffRound = 
  | 'Wild Card'
  | 'Divisional'
  | 'Conference'
  | 'Super Bowl';

export type Conference = 'AFC' | 'NFC';

export interface Game {
  id: string;
  round: PlayoffRound;
  conference?: Conference; // AFC or NFC for rounds 1-3, undefined for Super Bowl
  week: number;
  homeTeam?: TeamAbbreviation; // Optional for games that haven't been established yet
  awayTeam?: TeamAbbreviation; // Optional for games that haven't been established yet
  homeScore?: number;
  awayScore?: number;
  winner?: TeamAbbreviation;
  completed: boolean;
}

export interface Player {
  id: string;
  name: string;
  color?: string;
}

export interface Pick {
  id: string;
  playerId: string;
  gameId: string;
  pickedTeam: TeamAbbreviation;
  isCorrect?: boolean;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  totalCorrect: number;
  totalPicks: number;
  percentage: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  body: T;
  error?: string;
}

export interface ApiGatewayEvent {
  httpMethod: string;
  path: string;
  pathParameters?: { [key: string]: string };
  queryStringParameters?: { [key: string]: string };
  headers?: { [key: string]: string };
  body?: string;
  requestContext?: {
    authorizer?: {
      claims?: {
        email?: string;
      };
    };
  };
}

