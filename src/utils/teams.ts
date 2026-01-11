import type { TeamAbbreviation, Conference } from '../types';

// Full team names mapped to abbreviations
export const TEAM_NAMES: Record<TeamAbbreviation, string> = {
  ARI: 'Arizona Cardinals',
  ATL: 'Atlanta Falcons',
  BAL: 'Baltimore Ravens',
  BUF: 'Buffalo Bills',
  CAR: 'Carolina Panthers',
  CHI: 'Chicago Bears',
  CIN: 'Cincinnati Bengals',
  CLE: 'Cleveland Browns',
  DAL: 'Dallas Cowboys',
  DEN: 'Denver Broncos',
  DET: 'Detroit Lions',
  GB: 'Green Bay Packers',
  HOU: 'Houston Texans',
  IND: 'Indianapolis Colts',
  JAX: 'Jacksonville Jaguars',
  KC: 'Kansas City Chiefs',
  LAC: 'Los Angeles Chargers',
  LAR: 'Los Angeles Rams',
  LV: 'Las Vegas Raiders',
  MIA: 'Miami Dolphins',
  MIN: 'Minnesota Vikings',
  NE: 'New England Patriots',
  NO: 'New Orleans Saints',
  NYG: 'New York Giants',
  NYJ: 'New York Jets',
  PHI: 'Philadelphia Eagles',
  PIT: 'Pittsburgh Steelers',
  SEA: 'Seattle Seahawks',
  SF: 'San Francisco 49ers',
  TB: 'Tampa Bay Buccaneers',
  TEN: 'Tennessee Titans',
  WAS: 'Washington Commanders',
};

// Team conferences (AFC or NFC)
export const TEAM_CONFERENCES: Record<TeamAbbreviation, Conference> = {
  // AFC Teams
  BAL: 'AFC',
  BUF: 'AFC',
  CIN: 'AFC',
  CLE: 'AFC',
  DEN: 'AFC',
  HOU: 'AFC',
  IND: 'AFC',
  JAX: 'AFC',
  KC: 'AFC',
  LV: 'AFC',
  LAC: 'AFC',
  MIA: 'AFC',
  NE: 'AFC',
  NYJ: 'AFC',
  PIT: 'AFC',
  TEN: 'AFC',
  
  // NFC Teams
  ARI: 'NFC',
  ATL: 'NFC',
  CAR: 'NFC',
  CHI: 'NFC',
  DAL: 'NFC',
  DET: 'NFC',
  GB: 'NFC',
  LAR: 'NFC',
  MIN: 'NFC',
  NO: 'NFC',
  NYG: 'NFC',
  PHI: 'NFC',
  SEA: 'NFC',
  SF: 'NFC',
  TB: 'NFC',
  WAS: 'NFC',
};

// Get the logo path for a team (using Vite's asset handling)
export function getTeamLogo(team: TeamAbbreviation): string {
  // In Vite, we'll need to import these dynamically or use a different approach
  // For now, return a path that will work with Vite's public assets or imports
  return new URL(`../assets/logos/${team}.png`, import.meta.url).href;
}

// Get the NFL logo (for games that haven't been established yet)
export function getNFLLogo(): string {
  return new URL(`../assets/logos/NFL.svg`, import.meta.url).href;
}

// Get team name from abbreviation
export function getTeamName(team: TeamAbbreviation): string {
  return TEAM_NAMES[team] || team;
}

// Get team conference
export function getTeamConference(team: TeamAbbreviation): Conference {
  return TEAM_CONFERENCES[team];
}