import { useEffect, useState } from 'react';
import { fetchGames, createGame, updateGame, fetchPlayers, fetchPicks, createPick } from '../api/client';
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
  const [creatingNew, setCreatingNew] = useState(false);
  const [formData, setFormData] = useState<EditingGame | null>(null);
  const [playerPicks, setPlayerPicks] = useState<Record<string, TeamAbbreviation | ''>>({});
  const [passkey, setPasskey] = useState(() => {
    // Load passkey from localStorage on mount
    return localStorage.getItem('admin_passkey') || '';
  });

  useEffect(() => {
    loadData();
  }, []);

  // Save passkey to localStorage when it changes
  useEffect(() => {
    if (passkey) {
      localStorage.setItem('admin_passkey', passkey);
    } else {
      localStorage.removeItem('admin_passkey');
    }
  }, [passkey]);

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

  function handleCreateNew() {
    setCreatingNew(true);
    setEditingId('new');
    setFormData({
      id: 'new',
      round: 'Wild Card',
      conference: 'AFC',
      week: 1,
      completed: false,
    });
    setPlayerPicks({});
  }

  async function handleSave() {
    if (!formData) return;

    if (!passkey) {
      setError('Passkey is required to save changes');
      return;
    }

    try {
      if (creatingNew) {
        // Create new game
        const newGame = await createGame({
          round: formData.round,
          week: formData.week,
          homeTeam: formData.homeTeam,
          awayTeam: formData.awayTeam,
          conference: formData.conference,
        }, passkey);
        
        const gameId = newGame.id;
        
        // Update the game with additional fields
        const updates: any = {
          completed: formData.completed,
        };
        
        if (formData.round !== 'Super Bowl') {
          updates.conference = formData.conference;
        }
        
        if (formData.homeScore !== undefined) updates.homeScore = formData.homeScore;
        if (formData.awayScore !== undefined) updates.awayScore = formData.awayScore;
        if (formData.winner) updates.winner = formData.winner;
        
        if (Object.keys(updates).length > 0) {
          await updateGame(gameId, updates, passkey);
        }
        
        // Save picks for each player
        if (formData.homeTeam && formData.awayTeam) {
          const pickPromises = players.map(async (player) => {
            const pickedTeam = playerPicks[player.id];
            if (pickedTeam && (pickedTeam === formData.homeTeam || pickedTeam === formData.awayTeam)) {
              await createPick({
                playerId: player.id,
                gameId: gameId,
                pickedTeam: pickedTeam,
              }, passkey);
            }
          });
          await Promise.all(pickPromises);
        }
      } else if (editingId) {
        // Update existing game
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

        await updateGame(editingId, updates, passkey);
        
        // Save picks for each player
        if (formData.homeTeam && formData.awayTeam) {
          const pickPromises = players.map(async (player) => {
            const pickedTeam = playerPicks[player.id];
            if (pickedTeam && (pickedTeam === formData.homeTeam || pickedTeam === formData.awayTeam)) {
              await createPick({
                playerId: player.id,
                gameId: editingId,
                pickedTeam: pickedTeam,
              }, passkey);
            }
          });
          await Promise.all(pickPromises);
        }
      }
      
      await loadData();
      setEditingId(null);
      setCreatingNew(false);
      setFormData(null);
      setPlayerPicks({});
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save game';
      setError(errorMessage);
      console.error('Error saving game:', err);
    }
  }

  function handleCancel() {
    setEditingId(null);
    setCreatingNew(false);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Manage Games</h2>
        {!creatingNew && (
          <button 
            onClick={handleCreateNew}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            + Add Game
          </button>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#fff' }}>
          Admin Passkey:
          <input
            type="password"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            placeholder="Enter passkey to save changes"
            style={{
              marginLeft: '10px',
              padding: '8px',
              fontSize: '14px',
              width: '200px',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '4px'
            }}
          />
        </label>
      </div>

      {creatingNew && formData && (
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
          <AdminGameCard
            game={{
              id: 'new',
              round: formData.round,
              conference: formData.conference,
              week: formData.week,
              completed: false,
            } as Game}
            players={players}
            playerPicks={playerPicks}
            onPlayerPickChange={setPlayerPicks}
            isEditing={true}
            formData={formData}
            onEdit={() => {}}
            onSave={handleSave}
            onCancel={handleCancel}
            onFormDataChange={setFormData}
          />
        </div>
      )}

      <div className="admin-games-container">
        {ROUNDS.map(round => {
          const roundGames = gamesByRound[round];
          // Show round even if empty, or if we're creating a game in this round
          if (roundGames.length === 0 && (!creatingNew || formData?.round !== round)) return null;

          const afcGames = roundGames.filter(g => g.conference === 'AFC');
          const nfcGames = roundGames.filter(g => g.conference === 'NFC');
          const superBowl = roundGames.filter(g => !g.conference);
          const isSuperBowl = round === 'Super Bowl';

          return (
            <div key={round} className="admin-round">
              <h3 className="admin-round-title">{round}</h3>
              
              {isSuperBowl ? (
                <div className="admin-round-games">
                  {superBowl.filter(g => g.id !== 'new').map(game => (
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
                        {afcGames.filter(g => g.id !== 'new').map(game => (
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
                        {nfcGames.filter(g => g.id !== 'new').map(game => (
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
            Round:
            <select
              value={formData.round}
              onChange={(e) => onFormDataChange({ 
                ...formData, 
                round: e.target.value as PlayoffRound,
                conference: e.target.value === 'Super Bowl' ? undefined : formData.conference
              })}
            >
              {ROUNDS.map(round => (
                <option key={round} value={round}>{round}</option>
              ))}
            </select>
          </label>
          {formData.round !== 'Super Bowl' && (
            <label>
              Conference:
              <select
                value={formData.conference || ''}
                onChange={(e) => onFormDataChange({ 
                  ...formData, 
                  conference: e.target.value as Conference
                })}
              >
                {CONFERENCES.map(conf => (
                  <option key={conf} value={conf}>{conf}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            Week:
            <input
              type="number"
              value={formData.week}
              onChange={(e) => onFormDataChange({ 
                ...formData, 
                week: parseInt(e.target.value) || 1
              })}
              min="1"
            />
          </label>
        </div>
        
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
                      style={{ 
                        backgroundColor: '#666',
                        color: 'white',
                        border: `2px solid ${player.color || '#FF5733'}`
                      }}
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
