import { useEffect, useState } from 'react';
import { fetchScoreboard, fetchPlayers, fetchGames, fetchPicks } from '../api/client';
import type { PlayerScore, Player, Game, Pick } from '../types';
import { getTeamLogo } from '../utils/teams';
import './Scoreboard.css';

export function Scoreboard() {
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScoreboard() {
      try {
        setLoading(true);
        setError(null);
        const [scoresData, playersData, gamesData, picksData] = await Promise.all([
          fetchScoreboard(),
          fetchPlayers(),
          fetchGames(),
          fetchPicks(),
        ]);
        setScores(scoresData);
        setPlayers(playersData);
        setGames(gamesData);
        setPicks(picksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scoreboard');
        console.error('Error loading scoreboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadScoreboard();
    
    // Refresh scoreboard every 30 seconds
    const interval = setInterval(loadScoreboard, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="scoreboard-loading">
        <p>Loading scoreboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scoreboard-error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="scoreboard-empty">
        <p>No scores yet. Make some picks to see the standings!</p>
      </div>
    );
  }

  // Get completed games with both teams set (for showing picks)
  const gamesWithPicks = games
    .filter(game => game.homeTeam && game.awayTeam)
    .sort((a, b) => {
      // Sort by round, then week
      const roundOrder = ['Wild Card', 'Divisional', 'Conference', 'Super Bowl'];
      const roundDiff = roundOrder.indexOf(a.round) - roundOrder.indexOf(b.round);
      if (roundDiff !== 0) return roundDiff;
      return (a.week || 0) - (b.week || 0);
    });

  // Helper function to get matchup abbreviation
  const getMatchupAbbr = (game: Game): string => {
    if (!game.homeTeam || !game.awayTeam) return '';
    return `${game.awayTeam}v${game.homeTeam}`;
  };

  // Helper function to get player's pick for a game
  const getPlayerPick = (playerId: string, gameId: string): Pick | undefined => {
    return picks.find(p => p.playerId === playerId && p.gameId === gameId);
  };

  return (
    <div className="scoreboard">
      <div className="scoreboard-table-container">
        <table className="scoreboard-table">
          <thead>
            <tr>
              <th className="rank-col">Rank</th>
              <th className="player-col">Player</th>
              <th className="correct-col">Wins</th>
              <th className="total-col">Games</th>
              <th className="percentage-col">Win %</th>
              {gamesWithPicks.map(game => (
                <th key={game.id} className="pick-col">
                  {getMatchupAbbr(game)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => {
              const isTied = index > 0 && scores[index - 1].percentage === score.percentage && 
                            scores[index - 1].totalCorrect === score.totalCorrect;
              const rank = isTied ? '' : index + 1;
              const player = players.find(p => p.id === score.playerId);
              const playerColor = player?.color || 'rgba(255, 255, 255, 0.9)';
              
              return (
                <tr key={score.playerId}>
                  <td className="rank-col">{rank}</td>
                  <td className="player-col">
                    <span 
                      className="player-name"
                      style={{ 
                        backgroundColor: '#666',
                        color: 'white',
                        border: `2px solid ${playerColor}`
                      }}
                    >
                      {score.playerName}
                    </span>
                  </td>
                  <td className="correct-col">{score.totalCorrect}</td>
                  <td className="total-col">{score.totalPicks}</td>
                  <td className="percentage-col">
                    <span className="percentage-value">{score.percentage}%</span>
                  </td>
                  {gamesWithPicks.map(game => {
                    const pick = getPlayerPick(score.playerId, game.id);
                    if (!pick || !pick.pickedTeam) {
                      return (
                        <td key={game.id} className="pick-col">
                          <span className="pick-logo-empty">—</span>
                        </td>
                      );
                    }
                    const isCorrect = pick.isCorrect === true;
                    const isIncorrect = pick.isCorrect === false;
                    const isPending = game.completed !== true;
                    
                    let pickClass = '';
                    if (isPending) {
                      pickClass = 'pick-pending';
                    } else if (isCorrect) {
                      pickClass = 'pick-correct';
                    } else if (isIncorrect) {
                      pickClass = 'pick-incorrect';
                    }
                    
                    return (
                      <td key={game.id} className={`pick-col ${pickClass}`}>
                        <img
                          src={getTeamLogo(pick.pickedTeam)}
                          alt={pick.pickedTeam}
                          className="pick-logo"
                          title={pick.pickedTeam}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {scores.length > 0 && (
        <div className="scoreboard-footer">
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
}

