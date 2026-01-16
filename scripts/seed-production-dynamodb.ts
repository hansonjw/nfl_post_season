// Script to seed production DynamoDB directly using AWS SDK
// This bypasses the API and writes directly to DynamoDB tables

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { seedPlayers, seedGames, generatePicks } from '../local-dev/data/seed-data';
import { v4 as uuidv4 } from 'uuid';

const REGION = 'us-west-2';
const TABLES = {
  PLAYERS: 'nfl_post_season_players',
  GAMES: 'nfl_post_season_games',
  PICKS: 'nfl_post_season_picks',
};

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

async function seedProductionDynamoDB() {
  console.log('🌱 Seeding Production DynamoDB...\n');

  // Seed players
  console.log('📝 Creating players...');
  const players = [];
  for (const playerData of seedPlayers) {
    const player = {
      id: uuidv4(),
      name: playerData.name,
      color: playerData.color,
    };
    
    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.PLAYERS,
        Item: player,
      }));
      players.push(player);
      console.log(`   ✅ Created: ${player.name}`);
    } catch (error) {
      console.error(`   ❌ Error creating ${playerData.name}:`, error);
    }
  }

  // Seed games
  console.log('\n🎮 Creating games...');
  const games = [];
  for (const gameData of seedGames) {
    const game = {
      id: uuidv4(),
      round: gameData.round,
      conference: gameData.conference,
      week: gameData.week,
      homeTeam: gameData.homeTeam,
      awayTeam: gameData.awayTeam,
      homeScore: gameData.homeScore,
      awayScore: gameData.awayScore,
      winner: gameData.winner,
      completed: gameData.completed || false,
    };
    
    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.GAMES,
        Item: game,
      }));
      games.push(game);
      console.log(`   ✅ Created: ${game.round} - Week ${game.week}`);
    } catch (error) {
      console.error(`   ❌ Error creating game:`, error);
    }
  }

  // Seed picks (only for games with teams set)
  console.log('\n🎯 Creating picks...');
  const gamesWithTeams = games.filter(g => g.homeTeam && g.awayTeam);
  const picks = generatePicks(players, gamesWithTeams);

  let pickCount = 0;
  for (const pickData of picks) {
    const pick = {
      id: uuidv4(),
      playerId: pickData.playerId,
      gameId: pickData.gameId,
      pickedTeam: pickData.pickedTeam,
      isCorrect: pickData.isCorrect,
    };
    
    try {
      await docClient.send(new PutCommand({
        TableName: TABLES.PICKS,
        Item: pick,
      }));
      pickCount++;
      if (pickCount % 10 === 0) {
        process.stdout.write('.');
      }
    } catch (error) {
      console.error(`\n   ❌ Error creating pick:`, error);
    }
  }

  console.log(`\n   ✅ Created ${pickCount} picks`);

  console.log('\n✨ Seeding complete!');
  console.log(`   - Players: ${players.length}`);
  console.log(`   - Games: ${games.length}`);
  console.log(`   - Picks: ${pickCount}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProductionDynamoDB().catch(console.error);
}

export { seedProductionDynamoDB };
