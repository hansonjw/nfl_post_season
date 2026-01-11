import { useEffect, useState } from 'react';
import { fetchScoreboard } from '../api/client';
import type { PlayerScore } from '../types';
import './Scoreboard.css';

export function Scoreboard() {
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScoreboard() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchScoreboard();
        setScores(data);
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
      <h2>Standings</h2>
      <div className="scoreboard-table-container">
        <table className="scoreboard-table">
          <thead>
            <tr>
              <th className="rank-col">Rank</th>
              <th className="player-col">Player</th>
              <th className="correct-col">Correct</th>
              <th className="total-col">Total</th>
              <th className="percentage-col">Win %</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => {
              const isTied = index > 0 && scores[index - 1].percentage === score.percentage && 
                            scores[index - 1].totalCorrect === score.totalCorrect;
              const rank = isTied ? '' : index + 1;
              
              return (
                <tr key={score.playerId} className={index === 0 ? 'winner' : ''}>
                  <td className="rank-col">{rank}</td>
                  <td className="player-col">
                    <span className="player-name">{score.playerName}</span>
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

