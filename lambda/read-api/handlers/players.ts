import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../../shared/dynamodb.js';
import type { Player } from '../../shared/types.js';
import { createResponse } from '../../shared/utils.js';

export async function getPlayers(): Promise<any> {
  try {
    const command = new ScanCommand({
      TableName: TABLES.PLAYERS,
    });

    const result = await docClient.send(command);
    const players = (result.Items || []) as Player[];

    return createResponse(200, { players });
  } catch (error) {
    console.error('Error fetching players:', error);
    return createResponse(500, { error: 'Failed to fetch players' });
  }
}

