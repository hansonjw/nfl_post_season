import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createPlayer, updatePlayer, deletePlayer } from './handlers/players';
import { createGame, updateGame } from './handlers/games';
import { createPick, updatePick } from './handlers/picks';
import { createResponse, getEmailFromEvent } from '../shared/utils';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim());

function isAdmin(email: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, pathParameters, body } = event;

  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      },
      body: '',
    };
  }

  // Check admin authentication
  const email = getEmailFromEvent(event as any);
  if (!isAdmin(email)) {
    return createResponse(403, { error: 'Forbidden: Admin access required' });
  }

  // Normalize path (remove stage prefix if present)
  const normalizedPath = path.replace(/^\/[^/]+/, '') || path;

  try {
    // Players routes
    if (normalizedPath === '/players' && httpMethod === 'POST') {
      return await createPlayer(body || '');
    }

    if (normalizedPath.startsWith('/players/') && httpMethod === 'PUT') {
      const playerId = pathParameters?.id || normalizedPath.split('/').pop();
      if (!playerId) {
        return createResponse(400, { error: 'Player ID required' });
      }
      return await updatePlayer(playerId, body || '');
    }

    if (normalizedPath.startsWith('/players/') && httpMethod === 'DELETE') {
      const playerId = pathParameters?.id || normalizedPath.split('/').pop();
      if (!playerId) {
        return createResponse(400, { error: 'Player ID required' });
      }
      return await deletePlayer(playerId);
    }

    // Games routes
    if (normalizedPath === '/games' && httpMethod === 'POST') {
      return await createGame(body || '');
    }

    if (normalizedPath.startsWith('/games/') && httpMethod === 'PUT') {
      const gameId = pathParameters?.id || normalizedPath.split('/').pop();
      if (!gameId) {
        return createResponse(400, { error: 'Game ID required' });
      }
      return await updateGame(gameId, body || '');
    }

    // Picks routes
    if (normalizedPath === '/picks' && httpMethod === 'POST') {
      return await createPick(body || '');
    }

    if (normalizedPath.startsWith('/picks/') && httpMethod === 'PUT') {
      const pickId = pathParameters?.id || normalizedPath.split('/').pop();
      if (!pickId) {
        return createResponse(400, { error: 'Pick ID required' });
      }
      return await updatePick(pickId, body || '');
    }

    return createResponse(404, { error: 'Not found' });
  } catch (error) {
    console.error('Error handling request:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
};

