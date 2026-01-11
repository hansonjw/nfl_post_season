import { ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../../shared/dynamodb';
import type { Game } from '../../shared/types';
import { createResponse } from '../../shared/utils';

export async function getGames(gameId?: string): Promise<any> {
  try {
    if (gameId) {
      // Get single game
      const command = new GetCommand({
        TableName: TABLES.GAMES,
        Key: { id: gameId },
      });

      const result = await docClient.send(command);
      if (!result.Item) {
        return createResponse(404, { error: 'Game not found' });
      }

      return createResponse(200, { game: result.Item as Game });
    } else {
      // Get all games
      const command = new ScanCommand({
        TableName: TABLES.GAMES,
      });

      const result = await docClient.send(command);
      const games = (result.Items || []) as Game[];

      // Sort by round and week
      games.sort((a, b) => {
        const roundOrder = ['Wild Card', 'Divisional', 'Conference', 'Super Bowl'];
        const roundDiff = roundOrder.indexOf(a.round) - roundOrder.indexOf(b.round);
        if (roundDiff !== 0) return roundDiff;
        return a.week - b.week;
      });

      return createResponse(200, { games });
    }
  } catch (error) {
    console.error('Error fetching games:', error);
    return createResponse(500, { error: 'Failed to fetch games' });
  }
}

