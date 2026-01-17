import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type { APIGatewayProxyResult } from 'aws-lambda';
import { docClient, TABLES } from '../../shared/dynamodb.js';
import type { Game, Pick } from '../../shared/types.js';
import { createResponse, parseBody } from '../../shared/utils.js';
import { v4 as uuidv4 } from 'uuid';

export async function createGame(body: string): Promise<APIGatewayProxyResult> {
  try {
    const data = parseBody<Omit<Game, 'id'>>(body);
    if (!data || !data.round) {
      return createResponse(400, { error: 'Round is required' });
    }

    const game: Game = {
      id: uuidv4(),
      round: data.round,
      conference: data.conference,
      week: data.week || 1,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      winner: data.winner,
      completed: data.completed || false,
    };

    const command = new PutCommand({
      TableName: TABLES.GAMES,
      Item: game,
    });

    await docClient.send(command);
    return createResponse(201, { game });
  } catch (error) {
    console.error('Error creating game:', error);
    return createResponse(500, { error: 'Failed to create game' });
  }
}

export async function updateGame(gameId: string, body: string): Promise<APIGatewayProxyResult> {
  try {
    const data = parseBody<Partial<Omit<Game, 'id'>>>(body);
    if (!data) {
      return createResponse(400, { error: 'Invalid request body' });
    }

    const setParts: string[] = [];
    const removeParts: string[] = [];
    // DynamoDB attribute values can be string, number, boolean, null, lists, or maps
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    if (data.round !== undefined) {
      setParts.push('#round = :round');
      expressionAttributeNames['#round'] = 'round';
      expressionAttributeValues[':round'] = data.round;
    }
    if (data.week !== undefined) {
      setParts.push('#week = :week');
      expressionAttributeNames['#week'] = 'week';
      expressionAttributeValues[':week'] = data.week;
    }
    if (data.conference !== undefined) {
      setParts.push('conference = :conference');
      expressionAttributeValues[':conference'] = data.conference;
    } else if (data.round === 'Super Bowl') {
      // Remove conference for Super Bowl
      removeParts.push('conference');
    }
    if (data.homeTeam !== undefined) {
      setParts.push('homeTeam = :homeTeam');
      expressionAttributeValues[':homeTeam'] = data.homeTeam;
    }
    if (data.awayTeam !== undefined) {
      setParts.push('awayTeam = :awayTeam');
      expressionAttributeValues[':awayTeam'] = data.awayTeam;
    }
    if (data.homeScore !== undefined) {
      setParts.push('homeScore = :homeScore');
      expressionAttributeValues[':homeScore'] = data.homeScore;
    }
    if (data.awayScore !== undefined) {
      setParts.push('awayScore = :awayScore');
      expressionAttributeValues[':awayScore'] = data.awayScore;
    }
    if (data.winner !== undefined) {
      setParts.push('#winner = :winner');
      expressionAttributeNames['#winner'] = 'winner';
      expressionAttributeValues[':winner'] = data.winner;
    }
    if (data.completed !== undefined) {
      setParts.push('completed = :completed');
      expressionAttributeValues[':completed'] = data.completed;
    }

    if (setParts.length === 0 && removeParts.length === 0) {
      return createResponse(400, { error: 'No fields to update' });
    }

    // Build UpdateExpression: SET ... REMOVE ...
    let updateExpression = '';
    if (setParts.length > 0) {
      updateExpression = `SET ${setParts.join(', ')}`;
    }
    if (removeParts.length > 0) {
      if (updateExpression) updateExpression += ' ';
      updateExpression += `REMOVE ${removeParts.join(', ')}`;
    }

    const command = new UpdateCommand({
      TableName: TABLES.GAMES,
      Key: { id: gameId },
      UpdateExpression: updateExpression,
      ...(Object.keys(expressionAttributeNames).length > 0 && { ExpressionAttributeNames: expressionAttributeNames }),
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(command);
    const updatedGame = result.Attributes as Game;

    // If winner was updated, recalculate pick correctness
    if (data.winner !== undefined && updatedGame.completed) {
      await updatePickCorrectness(gameId, updatedGame.winner!);
    }

    return createResponse(200, { game: updatedGame });
  } catch (error) {
    console.error('Error updating game:', error);
    return createResponse(500, { error: 'Failed to update game' });
  }
}

async function updatePickCorrectness(gameId: string, winner: string): Promise<void> {
  try {
    // Get all picks for this game
    const { QueryCommand } = await import('@aws-sdk/lib-dynamodb');
    const picksCommand = new QueryCommand({
      TableName: TABLES.PICKS,
      IndexName: 'game-index',
      KeyConditionExpression: 'gameId = :gameId',
      ExpressionAttributeValues: {
        ':gameId': gameId,
      },
    });

    const picksResult = await docClient.send(picksCommand);
    const picks = (picksResult.Items || []) as Pick[];

    // Update each pick's isCorrect field
    const { UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
    const updatePromises = picks.map((pick) => {
      const isCorrect = pick.pickedTeam === winner;
      return docClient.send(
        new UpdateCommand({
          TableName: TABLES.PICKS,
          Key: { id: pick.id },
          UpdateExpression: 'SET isCorrect = :isCorrect',
          ExpressionAttributeValues: {
            ':isCorrect': isCorrect,
          },
        })
      );
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating pick correctness:', error);
    // Don't throw - this is a background operation
  }
}

