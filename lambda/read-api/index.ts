import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getPlayers } from './handlers/players';
import { getGames } from './handlers/games';
import { getPicks } from './handlers/picks';
import { getScoreboard } from './handlers/scoreboard';
import { createResponse } from '../shared/utils';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, queryStringParameters } = event;

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
      },
      body: '',
    };
  }

  // Normalize path (remove stage prefix if present)
  const normalizedPath = path.replace(/^\/[^/]+/, '') || path;

  try {
    // Route requests
    if (normalizedPath === '/players' && httpMethod === 'GET') {
      return await getPlayers();
    }

    if (normalizedPath === '/games' && httpMethod === 'GET') {
      const gameId = queryStringParameters?.gameId;
      return await getGames(gameId);
    }

    if (normalizedPath === '/picks' && httpMethod === 'GET') {
      const playerId = queryStringParameters?.playerId;
      const gameId = queryStringParameters?.gameId;
      return await getPicks(playerId, gameId);
    }

    if (normalizedPath === '/scoreboard' && httpMethod === 'GET') {
      return await getScoreboard();
    }

    return createResponse(404, { error: 'Not found' });
  } catch (error) {
    console.error('Error handling request:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
};

