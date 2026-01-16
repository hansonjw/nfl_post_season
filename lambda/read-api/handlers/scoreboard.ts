import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../../shared/dynamodb.js';
import type { Player, Pick, Game, PlayerScore } from '../../shared/types.js';
import { createResponse } from '../../shared/utils.js';

export async function getScoreboard(): Promise<any> {
  try {
    // Fetch all players, picks, and games
    const [playersResult, picksResult, gamesResult] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: TABLES.PLAYERS })),
      docClient.send(new ScanCommand({ TableName: TABLES.PICKS })),
      docClient.send(new ScanCommand({ TableName: TABLES.GAMES })),
    ]);

    const players = (playersResult.Items || []) as Player[];
    const picks = (picksResult.Items || []) as Pick[];
    const games = (gamesResult.Items || []) as Game[];

    // Create a map of game winners
    const gameWinners = new Map<string, string>();
    games.forEach((game) => {
      if (game.winner) {
        gameWinners.set(game.id, game.winner);
      }
    });

    // Calculate scores for each player
    const scores: PlayerScore[] = players.map((player) => {
      const playerPicks = picks.filter((p) => p.playerId === player.id);
      const completedPicks = playerPicks.filter((p) => {
        const winner = gameWinners.get(p.gameId);
        return winner !== undefined;
      });

      let totalCorrect = 0;
      completedPicks.forEach((pick) => {
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

    // Sort by percentage (descending), then by total correct (descending)
    scores.sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      return b.totalCorrect - a.totalCorrect;
    });

    return createResponse(200, { scores });
  } catch (error) {
    console.error('Error calculating scoreboard:', error);
    return createResponse(500, { error: 'Failed to calculate scoreboard' });
  }
}

