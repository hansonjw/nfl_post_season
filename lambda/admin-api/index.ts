import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createPlayer, updatePlayer, deletePlayer } from './handlers/players.js';
import { createGame, updateGame } from './handlers/games.js';
import { createPick, updatePick } from './handlers/picks.js';
import { createResponse, getEmailFromEvent } from '../shared/utils.js';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim());

function isAdmin(email: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Lambda invoked with event:', JSON.stringify(event, null, 2));
  
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

  // Admin authentication check removed - allowing unauthenticated access for now
  // const email = getEmailFromEvent(event as any);
  // if (!isAdmin(email)) {
  //   return createResponse(403, { error: 'Forbidden: Admin access required' });
  // }

  // Normalize path (remove stage prefix like /prod if present, but keep resource paths)
  // API Gateway may pass path as /prod/players/{id} or /players/{id}
  let normalizedPath = path;
  if (path.startsWith('/prod/') || path.startsWith('/dev/') || path.startsWith('/staging/')) {
    normalizedPath = path.replace(/^\/(prod|dev|staging)/, '');
  }
  // Ensure normalized path starts with /
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }
  console.log('Request details:', { 
    path, 
    normalizedPath, 
    httpMethod, 
    pathParameters,
    hasPathParams: !!pathParameters 
  });

  try {
    // Players routes
    if (normalizedPath === '/players' && httpMethod === 'POST') {
      return await createPlayer(body || '');
    }

    if (normalizedPath.startsWith('/players/') && httpMethod === 'PUT') {
      // Try pathParameters first (from API Gateway {id} pattern), then extract from path
      const playerId = pathParameters?.id || normalizedPath.split('/').filter(p => p && p !== 'players')[0];
      console.log('Extracted playerId:', playerId, 'from pathParameters:', pathParameters);
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
      const gameId = pathParameters?.id || normalizedPath.split('/').filter(p => p && p !== 'games')[0];
      console.log('Extracted gameId:', gameId, 'from pathParameters:', pathParameters);
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
      const pickId = pathParameters?.id || normalizedPath.split('/').filter(p => p && p !== 'picks')[0];
      console.log('Extracted pickId:', pickId, 'from pathParameters:', pathParameters);
      if (!pickId) {
        return createResponse(400, { error: 'Pick ID required' });
      }
      return await updatePick(pickId, body || '');
    }

    return createResponse(404, { 
      error: 'Not found',
      path: path,
      normalizedPath: normalizedPath,
      httpMethod: httpMethod,
      pathParameters: pathParameters
    });
  } catch (error) {
    console.error('Error handling request:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack, path, httpMethod, pathParameters });
    return createResponse(500, { 
      error: 'Internal server error',
      message: errorMessage,
      path: path,
      normalizedPath: normalizedPath,
      httpMethod: httpMethod
    });
  }
};

