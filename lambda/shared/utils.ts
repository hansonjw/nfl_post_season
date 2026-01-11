import type { ApiGatewayEvent } from './types';
import type { APIGatewayProxyResult } from 'aws-lambda';

export function createResponse<T>(
  statusCode: number,
  body: T,
  headers: Record<string, string> = {}
): APIGatewayProxyResult {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
      ...headers,
    },
  };
}

export function getEmailFromEvent(event: ApiGatewayEvent): string | null {
  return event.requestContext?.authorizer?.claims?.email || null;
}

export function parseBody<T>(body?: string): T | null {
  if (!body) return null;
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

