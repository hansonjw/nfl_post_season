import { PutCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyResult } from 'aws-lambda';
import { docClient, TABLES } from '../../shared/dynamodb.js';
import type { Pick, Game } from '../../shared/types.js';
import { createResponse, parseBody } from '../../shared/utils.js';
import { v4 as uuidv4 } from 'uuid';

export async function createPick(body: string): Promise<APIGatewayProxyResult> {
  try {
    const data = parseBody<Omit<Pick, 'id' | 'isCorrect'>>(body);
    if (!data || !data.playerId || !data.gameId || !data.pickedTeam) {
      return createResponse(400, { error: 'playerId, gameId, and pickedTeam are required' });
    }

    // Check if game exists
    const gameCommand = new GetCommand({
      TableName: TABLES.GAMES,
      Key: { id: data.gameId },
    });
    const gameResult = await docClient.send(gameCommand);
    if (!gameResult.Item) {
      return createResponse(404, { error: 'Game not found' });
    }

    const game = gameResult.Item as Game;
    if (!game.homeTeam || !game.awayTeam) {
      return createResponse(400, { error: 'Game teams must be set before picks can be made' });
    }
    if (data.pickedTeam !== game.homeTeam && data.pickedTeam !== game.awayTeam) {
      return createResponse(400, { error: 'pickedTeam must be either homeTeam or awayTeam' });
    }

    // Check if pick already exists for this player/game combination
    const { QueryCommand } = await import('@aws-sdk/lib-dynamodb');
    const existingPicksCommand = new QueryCommand({
      TableName: TABLES.PICKS,
      IndexName: 'player-index',
      KeyConditionExpression: 'playerId = :playerId',
      FilterExpression: 'gameId = :gameId',
      ExpressionAttributeValues: {
        ':playerId': data.playerId,
        ':gameId': data.gameId,
      },
    });

    const existingPicks = await docClient.send(existingPicksCommand);
    if (existingPicks.Items && existingPicks.Items.length > 0) {
      // Update existing pick instead
      const existingPick = existingPicks.Items[0] as Pick;
      return updatePick(existingPick.id, body);
    }

    // Calculate isCorrect if game is completed
    let isCorrect: boolean | undefined;
    if (game.completed && game.winner) {
      isCorrect = data.pickedTeam === game.winner;
    }

    const pick: Pick = {
      id: uuidv4(),
      playerId: data.playerId,
      gameId: data.gameId,
      pickedTeam: data.pickedTeam,
      isCorrect,
    };

    const command = new PutCommand({
      TableName: TABLES.PICKS,
      Item: pick,
    });

    await docClient.send(command);
    return createResponse(201, { pick });
  } catch (error) {
    console.error('Error creating pick:', error);
    return createResponse(500, { error: 'Failed to create pick' });
  }
}

export async function updatePick(pickId: string, body: string): Promise<APIGatewayProxyResult> {
  try {
    const data = parseBody<Partial<Omit<Pick, 'id'>>>(body);
    if (!data) {
      return createResponse(400, { error: 'Invalid request body' });
    }

    // If pickedTeam is being updated, validate it against the game
    if (data.pickedTeam !== undefined) {
      // Get the pick first to find the game
      const getPickCommand = new GetCommand({
        TableName: TABLES.PICKS,
        Key: { id: pickId },
      });
      const pickResult = await docClient.send(getPickCommand);
      if (!pickResult.Item) {
        return createResponse(404, { error: 'Pick not found' });
      }

      const pick = pickResult.Item as Pick;
      const gameCommand = new GetCommand({
        TableName: TABLES.GAMES,
        Key: { id: pick.gameId },
      });
      const gameResult = await docClient.send(gameCommand);
      if (!gameResult.Item) {
        return createResponse(404, { error: 'Game not found' });
      }

      const game = gameResult.Item as Game;
      if (!game.homeTeam || !game.awayTeam) {
        return createResponse(400, { error: 'Game teams must be set before picks can be made' });
      }
      if (data.pickedTeam !== game.homeTeam && data.pickedTeam !== game.awayTeam) {
        return createResponse(400, { error: 'pickedTeam must be either homeTeam or awayTeam' });
      }

      // Recalculate isCorrect if game is completed
      if (game.completed && game.winner) {
        data.isCorrect = data.pickedTeam === game.winner;
      }
    }

    const setParts: string[] = [];
    // DynamoDB attribute values can be string, number, boolean, null, lists, or maps
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expressionAttributeValues: Record<string, any> = {};

    if (data.playerId !== undefined) {
      setParts.push('playerId = :playerId');
      expressionAttributeValues[':playerId'] = data.playerId;
    }
    if (data.gameId !== undefined) {
      setParts.push('gameId = :gameId');
      expressionAttributeValues[':gameId'] = data.gameId;
    }
    if (data.pickedTeam !== undefined) {
      setParts.push('pickedTeam = :pickedTeam');
      expressionAttributeValues[':pickedTeam'] = data.pickedTeam;
    }
    if (data.isCorrect !== undefined) {
      setParts.push('isCorrect = :isCorrect');
      expressionAttributeValues[':isCorrect'] = data.isCorrect;
    }

    if (setParts.length === 0) {
      return createResponse(400, { error: 'No fields to update' });
    }

    const command = new UpdateCommand({
      TableName: TABLES.PICKS,
      Key: { id: pickId },
      UpdateExpression: `SET ${setParts.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);
    return createResponse(200, { pick: result.Attributes });
  } catch (error) {
    console.error('Error updating pick:', error);
    return createResponse(500, { error: 'Failed to update pick' });
  }
}

