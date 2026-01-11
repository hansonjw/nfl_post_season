import { useEffect, useState } from 'react';
import { fetchGames, fetchPlayers, fetchPicks } from '../api/client';
import type { Game, Player, Pick, TeamAbbreviation } from '../types';
import { getTeamLogo, getTeamName, getNFLLogo } from '../utils/teams';
import './Bracket.css';

interface GameWithPicks extends Game {
  homePicks: number;
  awayPicks: number;
  playerPicks: Array<{ playerId: string; playerName: string; pickedTeam: string }>;
}

export function Bracket() {
  const [games, setGames] = useState<GameWithPicks[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBracket() {
      try {
        setLoading(true);
        setError(null);
        
        const [gamesData, playersData, picksData] = await Promise.all([
          fetchGames(),
          fetchPlayers(),
          fetchPicks(),
        ]);

        setPlayers(playersData);

        // Group picks by game
        const picksByGame = new Map<string, Pick[]>();
        picksData.forEach(pick => {
          if (!picksByGame.has(pick.gameId)) {
            picksByGame.set(pick.gameId, []);
          }
          picksByGame.get(pick.gameId)!.push(pick);
        });

        // Enrich games with pick data
        const gamesWithPicks: GameWithPicks[] = gamesData.map(game => {
          const gamePicks = picksByGame.get(game.id) || [];
          const homePicks = game.homeTeam 
            ? gamePicks.filter(p => p.pickedTeam === game.homeTeam).length
            : 0;
          const awayPicks = game.awayTeam
            ? gamePicks.filter(p => p.pickedTeam === game.awayTeam).length
            : 0;

          const playerPicks = gamePicks.map(pick => {
            const player = playersData.find(pl => pl.id === pick.playerId);
            return {
              playerId: pick.playerId,
              playerName: player?.name || 'Unknown',
              pickedTeam: pick.pickedTeam,
            };
          });

          return {
            ...game,
            homePicks,
            awayPicks,
            playerPicks,
          };
        });

        // Sort games by round and week
        gamesWithPicks.sort((a, b) => {
          const roundOrder = ['Wild Card', 'Divisional', 'Conference', 'Super Bowl'];
          const roundDiff = roundOrder.indexOf(a.round) - roundOrder.indexOf(b.round);
          if (roundDiff !== 0) return roundDiff;
          return a.week - b.week;
        });

        setGames(gamesWithPicks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bracket');
        console.error('Error loading bracket:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBracket();
  }, []);

  if (loading) {
    return (
      <div className="bracket-loading">
        <p>Loading bracket...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bracket-error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
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
    <div className="bracket">
      <h2>Playoff Bracket</h2>
      <p className="bracket-subtitle">See who picked which teams</p>

      <div className="bracket-container">
        {/* Wild Card Round */}
        {gamesByRound['Wild Card'].length > 0 && (
          <BracketRound
            title="Wild Card"
            games={gamesByRound['Wild Card']}
            players={players}
          />
        )}

        {/* Divisional Round */}
        {gamesByRound['Divisional'].length > 0 && (
          <BracketRound
            title="Divisional"
            games={gamesByRound['Divisional']}
            players={players}
          />
        )}

        {/* Conference Championships */}
        {gamesByRound['Conference'].length > 0 && (
          <BracketRound
            title="Conference Championships"
            games={gamesByRound['Conference']}
            players={players}
          />
        )}

        {/* Super Bowl */}
        {gamesByRound['Super Bowl'].length > 0 && (
          <BracketRound
            title="Super Bowl"
            games={gamesByRound['Super Bowl']}
            players={players}
          />
        )}
      </div>
    </div>
  );
}

interface BracketRoundProps {
  title: string;
  games: GameWithPicks[];
  players: Player[];
}

function BracketRound({ title, games, players }: BracketRoundProps) {
  // Group by conference for rounds 1-3
  const afcGames = games.filter(g => g.conference === 'AFC');
  const nfcGames = games.filter(g => g.conference === 'NFC');
  const superBowl = games.filter(g => !g.conference);

  const isSuperBowl = title === 'Super Bowl';

  return (
    <div className="bracket-round">
      <h3 className="bracket-round-title">{title}</h3>
      
      {isSuperBowl ? (
        <div className="bracket-round-games">
          {superBowl.map(game => (
            <BracketGame key={game.id} game={game} players={players} />
          ))}
        </div>
      ) : (
        <div className="bracket-round-conferences">
          {afcGames.length > 0 && (
            <div className="bracket-conference">
              <h4 className="bracket-conference-title">AFC</h4>
              <div className="bracket-conference-games">
                {afcGames.map(game => (
                  <BracketGame key={game.id} game={game} players={players} />
                ))}
              </div>
            </div>
          )}
          
          {nfcGames.length > 0 && (
            <div className="bracket-conference">
              <h4 className="bracket-conference-title">NFC</h4>
              <div className="bracket-conference-games">
                {nfcGames.map(game => (
                  <BracketGame key={game.id} game={game} players={players} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface BracketGameProps {
  game: GameWithPicks;
  players: Player[];
}

function BracketGame({ game, players }: BracketGameProps) {
  // Use NFL logo for games that haven't been established yet (TBD matchups)
  const nflLogo = getNFLLogo();
  
  const homeLogo = game.homeTeam ? getTeamLogo(game.homeTeam) : nflLogo;
  const awayLogo = game.awayTeam ? getTeamLogo(game.awayTeam) : nflLogo;

  const homePlayerPicks = game.homeTeam 
    ? game.playerPicks.filter(p => p.pickedTeam === game.homeTeam)
    : [];
  const awayPlayerPicks = game.awayTeam
    ? game.playerPicks.filter(p => p.pickedTeam === game.awayTeam)
    : [];

  return (
    <div className="bracket-game">
      {/* Away Team */}
      <div className={`bracket-team ${game.awayTeam && game.winner === game.awayTeam ? 'winner' : ''} ${!game.awayTeam ? 'tbd' : ''}`}>
        <div className="bracket-team-logo">
          <img src={awayLogo} alt={game.awayTeam ? getTeamName(game.awayTeam) : 'TBD'} />
        </div>
        <div className="bracket-team-info">
          <div className="bracket-team-name">
            {game.awayTeam ? getTeamName(game.awayTeam) : 'TBD'}
            {game.completed && game.winner === game.awayTeam && (
              <span className="bracket-winner-badge">
                <span className="bracket-winner-check">✓</span> Winner
              </span>
            )}
          </div>
          {game.awayTeam && (
            <div className="bracket-team-picks">
              {game.awayPicks} {game.awayPicks === 1 ? 'pick' : 'picks'}
              {awayPlayerPicks.length > 0 && (
                <div className="bracket-team-pickers">
                  {awayPlayerPicks.map(p => (
                    <span key={p.playerId} className="bracket-picker">
                      {p.playerName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {game.awayScore !== undefined && (
          <div className="bracket-team-score">{game.awayScore}</div>
        )}
      </div>

      <div className="bracket-game-divider">VS</div>

      {/* Home Team */}
      <div className={`bracket-team ${game.homeTeam && game.winner === game.homeTeam ? 'winner' : ''} ${!game.homeTeam ? 'tbd' : ''}`}>
        <div className="bracket-team-logo">
          <img src={homeLogo} alt={game.homeTeam ? getTeamName(game.homeTeam) : 'TBD'} />
        </div>
        <div className="bracket-team-info">
          <div className="bracket-team-name">
            {game.homeTeam ? getTeamName(game.homeTeam) : 'TBD'}
            {game.completed && game.winner === game.homeTeam && (
              <span className="bracket-winner-badge">
                <span className="bracket-winner-check">✓</span> Winner
              </span>
            )}
          </div>
          {game.homeTeam && (
            <div className="bracket-team-picks">
              {game.homePicks} {game.homePicks === 1 ? 'pick' : 'picks'}
              {homePlayerPicks.length > 0 && (
                <div className="bracket-team-pickers">
                  {homePlayerPicks.map(p => (
                    <span key={p.playerId} className="bracket-picker">
                      {p.playerName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {game.homeScore !== undefined && (
          <div className="bracket-team-score">{game.homeScore}</div>
        )}
      </div>
    </div>
  );
}
