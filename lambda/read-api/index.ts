import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getPlayers } from './handlers/players.js';
import { getGames } from './handlers/games.js';
import { getPicks } from './handlers/picks.js';
import { getScoreboard } from './handlers/scoreboard.js';
import { createResponse } from '../shared/utils.js';

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

  // Normalize path (remove stage prefix if present, e.g., /prod/players -> /players)
  let normalizedPath = path;
  if (path.startsWith('/prod/')) {
    normalizedPath = path.replace('/prod', '');
  } else if (path.startsWith('/dev/')) {
    normalizedPath = path.replace('/dev', '');
  } else if (path.match(/^\/[^/]+\//)) {
    // Remove any stage prefix
    normalizedPath = path.replace(/^\/[^/]+/, '');
  }
  // Ensure it starts with /
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }

  console.log('Request:', { httpMethod, path, normalizedPath, queryStringParameters });
  console.log('Environment:', { 
    PLAYERS_TABLE: process.env.PLAYERS_TABLE,
    GAMES_TABLE: process.env.GAMES_TABLE,
    PICKS_TABLE: process.env.PICKS_TABLE
  });

  try {
    // Health check endpoint
    if (normalizedPath === '/health' && httpMethod === 'GET') {
      return createResponse(200, { 
        status: 'ok',
        path: path,
        normalizedPath: normalizedPath,
        tables: {
          players: process.env.PLAYERS_TABLE,
          games: process.env.GAMES_TABLE,
          picks: process.env.PICKS_TABLE,
        }
      });
    }

    // Route requests
    if (normalizedPath === '/players' && httpMethod === 'GET') {
      console.log('Calling getPlayers...');
      const result = await getPlayers();
      console.log('getPlayers result:', JSON.stringify(result).substring(0, 100));
      return result;
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

