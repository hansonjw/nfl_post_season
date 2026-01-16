import { useEffect, useState } from 'react';
import { fetchScoreboard, fetchPlayers } from '../api/client';
import type { PlayerScore, Player } from '../types';
import './Scoreboard.css';

export function Scoreboard() {
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScoreboard() {
      try {
        setLoading(true);
        setError(null);
        const [scoresData, playersData] = await Promise.all([
          fetchScoreboard(),
          fetchPlayers(),
        ]);
        setScores(scoresData);
        setPlayers(playersData);
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

