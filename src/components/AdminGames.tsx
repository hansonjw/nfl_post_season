import { useEffect, useState } from 'react';
import { fetchGames, updateGame, fetchPlayers, fetchPicks, createPick } from '../api/client';
import type { Game, TeamAbbreviation, PlayoffRound, Conference, Player, Pick } from '../types';
import { TEAM_NAMES, getTeamName, getTeamLogo, getNFLLogo } from '../utils/teams';
import './AdminGames.css';

const ROUNDS: PlayoffRound[] = ['Wild Card', 'Divisional', 'Conference', 'Super Bowl'];
const CONFERENCES: Conference[] = ['AFC', 'NFC'];
const TEAMS = Object.keys(TEAM_NAMES) as TeamAbbreviation[];

interface EditingGame extends Partial<Game> {
  id: string;
  round: PlayoffRound;
  week: number;
  completed: boolean;
}

export function AdminGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditingGame | null>(null);
  const [playerPicks, setPlayerPicks] = useState<Record<string, TeamAbbreviation | ''>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [gamesData, playersData, picksData] = await Promise.all([
        fetchGames(),
        fetchPlayers(),
        fetchPicks(),
      ]);
      setGames(gamesData);
      setPlayers(playersData);
      setPicks(picksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(game: Game) {
    setEditingId(game.id);
    setFormData({
      id: game.id,
      round: game.round,
      conference: game.conference,
      week: game.week,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      winner: game.winner,
      completed: game.completed,
    });
    
    // Load picks for this game
    const gamePicks = picks.filter(p => p.gameId === game.id);
    const picksMap: Record<string, TeamAbbreviation | ''> = {};
    players.forEach(player => {
      const pick = gamePicks.find(p => p.playerId === player.id);
      picksMap[player.id] = (pick?.pickedTeam as TeamAbbreviation) || '';
    });
    setPlayerPicks(picksMap);
  }

  async function handleSave() {
    if (!formData || !editingId) return;

    try {
      const updates: any = {
        round: formData.round,
        week: formData.week,
        completed: formData.completed,
      };

      if (formData.round !== 'Super Bowl') {
        updates.conference = formData.conference;
      } else {
        updates.conference = undefined;
      }

      if (formData.homeTeam) updates.homeTeam = formData.homeTeam;
      if (formData.awayTeam) updates.awayTeam = formData.awayTeam;
      if (formData.homeScore !== undefined) updates.homeScore = formData.homeScore;
      if (formData.awayScore !== undefined) updates.awayScore = formData.awayScore;
      if (formData.winner) updates.winner = formData.winner;

      await updateGame(editingId, updates);
      
      // Save picks for each player
      if (formData.homeTeam && formData.awayTeam) {
        const pickPromises = players.map(async (player) => {
          const pickedTeam = playerPicks[player.id];
          if (pickedTeam && (pickedTeam === formData.homeTeam || pickedTeam === formData.awayTeam)) {
            await createPick({
              playerId: player.id,
              gameId: editingId,
              pickedTeam: pickedTeam,
            });
          }
        });
        await Promise.all(pickPromises);
      }
      
      await loadData();
      setEditingId(null);
      setFormData(null);
      setPlayerPicks({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save game');
      console.error('Error saving game:', err);
    }
  }

  function handleCancel() {
    setEditingId(null);
    setFormData(null);
    setPlayerPicks({});
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Loading games...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <p>Error: {error}</p>
        <button onClick={loadData}>Retry</button>
      </div>
    );
  }

  // Group games by round
  const gamesByRound = {
    'Wild Card': games.filter(g => g.round === 'Wild Card'),
    'Divisional': games.filter(g => g.round === 'Divisional'),
    'Conference': games.filter(g => g.round === 'Conference'),
    'Super Bowl': games.filter(g => g.round === 'Super Bowl'),
  };

  return (
    <div className="admin-games">
      <h2>Manage Games</h2>

      <div className="admin-games-container">
        {ROUNDS.map(round => {
          const roundGames = gamesByRound[round];
          if (roundGames.length === 0) return null;

          const afcGames = roundGames.filter(g => g.conference === 'AFC');
          const nfcGames = roundGames.filter(g => g.conference === 'NFC');
          const superBowl = roundGames.filter(g => !g.conference);
          const isSuperBowl = round === 'Super Bowl';

          return (
            <div key={round} className="admin-round">
              <h3 className="admin-round-title">{round}</h3>
              
              {isSuperBowl ? (
                <div className="admin-round-games">
                  {superBowl.map(game => (
                    <AdminGameCard
                      key={game.id}
                      game={game}
                      players={players}
                      playerPicks={playerPicks}
                      onPlayerPickChange={setPlayerPicks}
                      isEditing={editingId === game.id}
                      formData={formData}
                      onEdit={() => handleEdit(game)}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      onFormDataChange={setFormData}
                    />
                  ))}
                </div>
              ) : (
                <div className="admin-round-conferences">
                  {afcGames.length > 0 && (
                    <div className="admin-conference">
                      <h4 className="admin-conference-title">AFC</h4>
                      <div className="admin-conference-games">
                        {afcGames.map(game => (
                          <AdminGameCard
                            key={game.id}
                            game={game}
                            players={players}
                            playerPicks={playerPicks}
                            onPlayerPickChange={setPlayerPicks}
                            isEditing={editingId === game.id}
                            formData={formData}
                            onEdit={() => handleEdit(game)}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            onFormDataChange={setFormData}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {nfcGames.length > 0 && (
                    <div className="admin-conference">
                      <h4 className="admin-conference-title">NFC</h4>
                      <div className="admin-conference-games">
                        {nfcGames.map(game => (
                          <AdminGameCard
                            key={game.id}
                            game={game}
                            players={players}
                            playerPicks={playerPicks}
                            onPlayerPickChange={setPlayerPicks}
                            isEditing={editingId === game.id}
                            formData={formData}
                            onEdit={() => handleEdit(game)}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            onFormDataChange={setFormData}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AdminGameCardProps {
  game: Game;
  players: Player[];
  playerPicks: Record<string, TeamAbbreviation | ''>;
  onPlayerPickChange: (picks: Record<string, TeamAbbreviation | ''>) => void;
  isEditing: boolean;
  formData: EditingGame | null;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFormDataChange: (data: EditingGame) => void;
}

function AdminGameCard({ 
  game, 
  players,
  playerPicks,
  onPlayerPickChange,
  isEditing, 
  formData, 
  onEdit, 
  onSave, 
  onCancel,
  onFormDataChange 
}: AdminGameCardProps) {
  const nflLogo = getNFLLogo();
  
  if (!isEditing || !formData) {
    return (
      <div className="admin-game-card">
        <div className="admin-game-display">
          <div className="admin-game-team">
            <img 
              src={game.awayTeam ? getTeamLogo(game.awayTeam) : nflLogo} 
              alt={game.awayTeam ? getTeamName(game.awayTeam) : 'TBD'} 
            />
            <span>{game.awayTeam ? getTeamName(game.awayTeam) : 'TBD'}</span>
            {game.awayScore !== undefined && <span className="admin-game-score">{game.awayScore}</span>}
          </div>
          <div className="admin-game-divider">VS</div>
          <div className="admin-game-team">
            <img 
              src={game.homeTeam ? getTeamLogo(game.homeTeam) : nflLogo} 
              alt={game.homeTeam ? getTeamName(game.homeTeam) : 'TBD'} 
            />
            <span>{game.homeTeam ? getTeamName(game.homeTeam) : 'TBD'}</span>
            {game.homeScore !== undefined && <span className="admin-game-score">{game.homeScore}</span>}
          </div>
        </div>
        <button className="admin-edit-button" onClick={onEdit}>
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="admin-game-card admin-game-card-editing">
      <div className="admin-game-form">
        <div className="admin-game-form-row">
          <label>
            Away Team:
            <select
              value={formData.awayTeam || ''}
              onChange={(e) => onFormDataChange({ 
                ...formData, 
                awayTeam: e.target.value as TeamAbbreviation | undefined 
              })}
            >
              <option value="">TBD</option>
              {TEAMS.map(team => (
                <option key={team} value={team}>{getTeamName(team)}</option>
              ))}
            </select>
          </label>
          <label>
            Away Score:
            <input
              type="number"
              value={formData.awayScore ?? ''}
              onChange={(e) => onFormDataChange({ 
                ...formData, 
                awayScore: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              min="0"
            />
          </label>
        </div>

        <div className="admin-game-form-row">
          <label>
            Home Team:
            <select
              value={formData.homeTeam || ''}
              onChange={(e) => onFormDataChange({ 
                ...formData, 
                homeTeam: e.target.value as TeamAbbreviation | undefined 
              })}
            >
              <option value="">TBD</option>
              {TEAMS.map(team => (
                <option key={team} value={team}>{getTeamName(team)}</option>
              ))}
            </select>
          </label>
          <label>
            Home Score:
            <input
              type="number"
              value={formData.homeScore ?? ''}
              onChange={(e) => onFormDataChange({ 
                ...formData, 
                homeScore: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              min="0"
            />
          </label>
        </div>

        <div className="admin-game-form-row">
          <label>
            Winner:
            <select
              value={formData.winner || ''}
              onChange={(e) => onFormDataChange({ 
                ...formData, 
                winner: e.target.value as TeamAbbreviation | undefined 
              })}
            >
              <option value="">None</option>
              {formData.homeTeam && (
                <option value={formData.homeTeam}>{getTeamName(formData.homeTeam)}</option>
              )}
              {formData.awayTeam && (
                <option value={formData.awayTeam}>{getTeamName(formData.awayTeam)}</option>
              )}
            </select>
          </label>
          <label>
            Completed:
            <input
              type="checkbox"
              checked={formData.completed}
              onChange={(e) => onFormDataChange({ ...formData, completed: e.target.checked })}
            />
          </label>
        </div>

        {formData.homeTeam && formData.awayTeam && (
          <div className="admin-game-picks-section">
            <h4>Player Picks</h4>
            <div className="admin-game-picks-list">
              {players.map(player => (
                <div key={player.id} className="admin-game-pick-row">
                  <label>
                    <span 
                      className="admin-player-name"
                      style={{ color: player.color || '#FF5733' }}
                    >
                      {player.name}:
                    </span>
                    <select
                      value={playerPicks[player.id] || ''}
                      onChange={(e) => {
                        const newPicks = { ...playerPicks };
                        newPicks[player.id] = e.target.value as TeamAbbreviation | '';
                        onPlayerPickChange(newPicks);
                      }}
                    >
                      <option value="">No pick</option>
                      <option value={formData.homeTeam}>{getTeamName(formData.homeTeam!)}</option>
                      <option value={formData.awayTeam}>{getTeamName(formData.awayTeam!)}</option>
                    </select>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="admin-form-actions">
          <button onClick={onSave}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
