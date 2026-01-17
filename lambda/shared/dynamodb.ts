import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

export const TABLES = {
  PLAYERS: process.env.PLAYERS_TABLE || '',
  GAMES: process.env.GAMES_TABLE || '',
  PICKS: process.env.PICKS_TABLE || '',
};

