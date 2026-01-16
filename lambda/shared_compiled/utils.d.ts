import type { ApiGatewayEvent } from './types';
import type { APIGatewayProxyResult } from 'aws-lambda';
export declare function createResponse<T>(statusCode: number, body: T, headers?: Record<string, string>): APIGatewayProxyResult;
export declare function getEmailFromEvent(event: ApiGatewayEvent): string | null;
export declare function parseBody<T>(body?: string): T | null;
//# sourceMappingURL=utils.d.ts.map