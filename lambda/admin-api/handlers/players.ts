import { PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from '../../shared/dynamodb.js';
import type { Player } from '../../shared/types.js';
import { createResponse, parseBody } from '../../shared/utils.js';
import { v4 as uuidv4 } from 'uuid';

export async function createPlayer(body: string): Promise<any> {
  try {
    const data = parseBody<Omit<Player, 'id'>>(body);
    if (!data || !data.name) {
      return createResponse(400, { error: 'Name is required' });
    }

    const player: Player = {
      id: uuidv4(),
      name: data.name,
      color: data.color,
    };

    const command = new PutCommand({
      TableName: TABLES.PLAYERS,
      Item: player,
    });

    await docClient.send(command);
    return createResponse(201, { player });
  } catch (error) {
    console.error('Error creating player:', error);
    return createResponse(500, { error: 'Failed to create player' });
  }
}

export async function updatePlayer(playerId: string, body: string): Promise<any> {
  try {
    const data = parseBody<Partial<Omit<Player, 'id'>>>(body);
    if (!data) {
      return createResponse(400, { error: 'Invalid request body' });
    }

    const updateParts: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};

    if (data.name !== undefined) {
      updateParts.push('#name = :name');
      expressionAttributeValues[':name'] = data.name;
    }

    if (data.color !== undefined) {
      updateParts.push('#color = :color');
      expressionAttributeValues[':color'] = data.color;
    }

    if (updateParts.length === 0) {
      return createResponse(400, { error: 'No fields to update' });
    }

    const command = new UpdateCommand({
      TableName: TABLES.PLAYERS,
      Key: { id: playerId },
      UpdateExpression: `SET ${updateParts.join(', ')}`,
      ExpressionAttributeNames: {
        '#name': 'name',
        '#color': 'color',
      },
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);
    return createResponse(200, { player: result.Attributes });
  } catch (error) {
    console.error('Error updating player:', error);
    return createResponse(500, { error: 'Failed to update player' });
  }
}

export async function deletePlayer(playerId: string): Promise<any> {
  try {
    const command = new DeleteCommand({
      TableName: TABLES.PLAYERS,
      Key: { id: playerId },
    });

    await docClient.send(command);
    return createResponse(200, { success: true });
  } catch (error) {
    console.error('Error deleting player:', error);
    return createResponse(500, { error: 'Failed to delete player' });
  }
}
