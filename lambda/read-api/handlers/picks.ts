import { ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../../shared/dynamodb';
import type { Pick } from '../../shared/types';
import { createResponse } from '../../shared/utils';

export async function getPicks(playerId?: string, gameId?: string): Promise<any> {
  try {
    if (playerId) {
      // Get picks by player
      const command = new QueryCommand({
        TableName: TABLES.PICKS,
        IndexName: 'player-index',
        KeyConditionExpression: 'playerId = :playerId',
        ExpressionAttributeValues: {
          ':playerId': playerId,
        },
      });

      const result = await docClient.send(command);
      const picks = (result.Items || []) as Pick[];
      return createResponse(200, { picks });
    } else if (gameId) {
      // Get picks by game
      const command = new QueryCommand({
        TableName: TABLES.PICKS,
        IndexName: 'game-index',
        KeyConditionExpression: 'gameId = :gameId',
        ExpressionAttributeValues: {
          ':gameId': gameId,
        },
      });

      const result = await docClient.send(command);
      const picks = (result.Items || []) as Pick[];
      return createResponse(200, { picks });
    } else {
      // Get all picks
      const command = new ScanCommand({
        TableName: TABLES.PICKS,
      });

      const result = await docClient.send(command);
      const picks = (result.Items || []) as Pick[];
      return createResponse(200, { picks });
    }
  } catch (error) {
    console.error('Error fetching picks:', error);
    return createResponse(500, { error: 'Failed to fetch picks' });
  }
}

