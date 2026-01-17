#!/usr/bin/env bun
// CLI tool to download and upload data from/to DynamoDB
// Usage:
//   Download: bun run scripts/data-manager.ts download [output-dir]
//   Upload:   bun run scripts/data-manager.ts upload [data-dir]
//   Or use npm scripts:
//   Download: npm run data:download [output-dir]
//   Upload:   npm run data:upload [data-dir]

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const REGION = 'us-west-2';
const TABLES = {
  PLAYERS: 'nfl_post_season_players',
  GAMES: 'nfl_post_season_games',
  PICKS: 'nfl_post_season_picks',
};

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

interface DataSet {
  players: any[];
  games: any[];
  picks: any[];
}

async function downloadData(outputDir: string = './data-export'): Promise<void> {
  console.log('📥 Downloading data from DynamoDB...\n');

  // Create output directory
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const data: DataSet = {
    players: [],
    games: [],
    picks: [],
  };

  // Download players
  console.log('📝 Downloading players...');
  let lastEvaluatedKey;
  do {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.PLAYERS,
      ExclusiveStartKey: lastEvaluatedKey,
    }));
    data.players.push(...(result.Items || []));
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  console.log(`   ✅ Downloaded ${data.players.length} players`);

  // Download games
  console.log('🎮 Downloading games...');
  lastEvaluatedKey = undefined;
  do {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.GAMES,
      ExclusiveStartKey: lastEvaluatedKey,
    }));
    data.games.push(...(result.Items || []));
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  console.log(`   ✅ Downloaded ${data.games.length} games`);

  // Download picks
  console.log('🎯 Downloading picks...');
  lastEvaluatedKey = undefined;
  do {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.PICKS,
      ExclusiveStartKey: lastEvaluatedKey,
    }));
    data.picks.push(...(result.Items || []));
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  console.log(`   ✅ Downloaded ${data.picks.length} picks`);

  // Create player ID to name map for enriching picks
  const playerNameMap = new Map<string, string>();
  for (const player of data.players) {
    if (player.id && player.name) {
      playerNameMap.set(player.id, player.name);
    }
  }

  // Enrich picks with player names (for display only, not part of data model)
  const enrichedPicks = data.picks.map(pick => ({
    ...pick,
    playerName: playerNameMap.get(pick.playerId) || 'Unknown Player',
  }));

  // Write to JSON files
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const playersFile = join(outputDir, `players-${timestamp}.json`);
  const gamesFile = join(outputDir, `games-${timestamp}.json`);
  const picksFile = join(outputDir, `picks-${timestamp}.json`);

  await writeFile(playersFile, JSON.stringify(data.players, null, 2));
  await writeFile(gamesFile, JSON.stringify(data.games, null, 2));
  await writeFile(picksFile, JSON.stringify(enrichedPicks, null, 2));

  console.log('\n✨ Download complete!');
  console.log(`   📁 Output directory: ${outputDir}`);
  console.log(`   📄 Players: ${playersFile}`);
  console.log(`   📄 Games: ${gamesFile}`);
  console.log(`   📄 Picks: ${picksFile}`);
}

async function uploadData(dataDir: string = './data-export'): Promise<void> {
  console.log('📤 Uploading data to DynamoDB...\n');

  // Look for individual files (preferred) or all-data file as fallback
  let data: DataSet;
  
  const playersFile = join(dataDir, 'players.json');
  const gamesFile = join(dataDir, 'games.json');
  const picksFile = join(dataDir, 'picks.json');

  // First, try to find timestamped individual files (most recent)
  const { readdir } = await import('fs/promises');
  const allFiles = await readdir(dataDir);
  
  const playersFiles = allFiles.filter(f => f.startsWith('players-') && f.endsWith('.json')).sort().reverse();
  const gamesFiles = allFiles.filter(f => f.startsWith('games-') && f.endsWith('.json')).sort().reverse();
  const picksFiles = allFiles.filter(f => f.startsWith('picks-') && f.endsWith('.json')).sort().reverse();

  if (playersFiles.length > 0 || gamesFiles.length > 0 || picksFiles.length > 0) {
    // Use most recent timestamped files
    console.log('📖 Reading individual data files...');
    data = {
      players: playersFiles.length > 0 
        ? JSON.parse(await readFile(join(dataDir, playersFiles[0]), 'utf-8'))
        : (existsSync(playersFile) ? JSON.parse(await readFile(playersFile, 'utf-8')) : []),
      games: gamesFiles.length > 0
        ? JSON.parse(await readFile(join(dataDir, gamesFiles[0]), 'utf-8'))
        : (existsSync(gamesFile) ? JSON.parse(await readFile(gamesFile, 'utf-8')) : []),
      picks: picksFiles.length > 0
        ? JSON.parse(await readFile(join(dataDir, picksFiles[0]), 'utf-8'))
        : (existsSync(picksFile) ? JSON.parse(await readFile(picksFile, 'utf-8')) : []),
    };
  } else if (existsSync(playersFile) || existsSync(gamesFile) || existsSync(picksFile)) {
    // Try non-timestamped individual files
    console.log('📖 Reading individual data files...');
    data = {
      players: existsSync(playersFile) ? JSON.parse(await readFile(playersFile, 'utf-8')) : [],
      games: existsSync(gamesFile) ? JSON.parse(await readFile(gamesFile, 'utf-8')) : [],
      picks: existsSync(picksFile) ? JSON.parse(await readFile(picksFile, 'utf-8')) : [],
    };
  } else {
    // Fallback: try all-data file
    const allDataFiles = allFiles.filter(f => f.startsWith('all-data') && f.endsWith('.json')).sort().reverse();
    if (allDataFiles.length > 0) {
      console.log(`📖 Reading ${allDataFiles[0]} (fallback)...`);
      const content = await readFile(join(dataDir, allDataFiles[0]), 'utf-8');
      data = JSON.parse(content);
    } else {
      throw new Error('No data files found! Please ensure data files exist in the specified directory.');
    }
  }

  if ((!data.players || data.players.length === 0) && 
      (!data.games || data.games.length === 0) && 
      (!data.picks || data.picks.length === 0)) {
    throw new Error('No data found in files! Please ensure data files contain valid data.');
  }

  // Auto-generate missing IDs (for new items added manually)
  console.log('\n🔍 Validating and fixing IDs...');
  let fixedCount = 0;
  
  // Fix player IDs
  if (data.players) {
    for (const player of data.players) {
      if (!player.id || typeof player.id !== 'string' || player.id.length < 10) {
        player.id = randomUUID();
        fixedCount++;
        console.log(`   ⚠️  Generated ID for player: ${player.name}`);
      }
    }
  }
  
  // Fix game IDs
  if (data.games) {
    for (const game of data.games) {
      if (!game.id || typeof game.id !== 'string' || game.id.length < 10) {
        game.id = randomUUID();
        fixedCount++;
        console.log(`   ⚠️  Generated ID for game: ${game.round} Week ${game.week}`);
      }
    }
  }
  
  // Fix pick IDs and validate references
  if (data.picks) {
    const playerIds = new Set(data.players?.map(p => p.id) || []);
    const gameIds = new Set(data.games?.map(g => g.id) || []);
    
    for (const pick of data.picks) {
      // Strip playerName if present (it's only for display in JSON, not part of data model)
      if ('playerName' in pick) {
        delete pick.playerName;
      }
      
      if (!pick.id || typeof pick.id !== 'string' || pick.id.length < 10) {
        pick.id = randomUUID();
        fixedCount++;
      }
      
      // Validate playerId reference
      if (!playerIds.has(pick.playerId)) {
        console.warn(`   ⚠️  Warning: Pick ${pick.id} references unknown playerId: ${pick.playerId}`);
      }
      
      // Validate gameId reference
      if (!gameIds.has(pick.gameId)) {
        console.warn(`   ⚠️  Warning: Pick ${pick.id} references unknown gameId: ${pick.gameId}`);
      }
    }
  }
  
  if (fixedCount > 0) {
    console.log(`   ✅ Fixed ${fixedCount} missing IDs`);
  } else {
    console.log(`   ✅ All IDs are valid`);
  }

  // Clear existing data (optional - comment out if you want to merge instead of replace)
  console.log('\n⚠️  WARNING: This will REPLACE all existing data in DynamoDB!');
  console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Upload players
  if (data.players && data.players.length > 0) {
    console.log(`📝 Uploading ${data.players.length} players...`);
    
    // Delete all existing players first
    const existingPlayers = await docClient.send(new ScanCommand({ TableName: TABLES.PLAYERS }));
    if (existingPlayers.Items && existingPlayers.Items.length > 0) {
      const deleteRequests = existingPlayers.Items.map(item => ({
        DeleteRequest: { Key: { id: item.id } }
      }));
      
      // Batch delete (max 25 items per batch)
      for (let i = 0; i < deleteRequests.length; i += 25) {
        const batch = deleteRequests.slice(i, i + 25);
        await docClient.send(new BatchWriteCommand({
          RequestItems: {
            [TABLES.PLAYERS]: batch,
          },
        }));
      }
    }

    // Upload new players
    for (const player of data.players) {
      await docClient.send(new PutCommand({
        TableName: TABLES.PLAYERS,
        Item: player,
      }));
    }
    console.log(`   ✅ Uploaded ${data.players.length} players`);
  }

  // Upload games
  if (data.games && data.games.length > 0) {
    console.log(`🎮 Uploading ${data.games.length} games...`);
    
    // Delete all existing games first
    const existingGames = await docClient.send(new ScanCommand({ TableName: TABLES.GAMES }));
    if (existingGames.Items && existingGames.Items.length > 0) {
      const deleteRequests = existingGames.Items.map(item => ({
        DeleteRequest: { Key: { id: item.id } }
      }));
      
      for (let i = 0; i < deleteRequests.length; i += 25) {
        const batch = deleteRequests.slice(i, i + 25);
        await docClient.send(new BatchWriteCommand({
          RequestItems: {
            [TABLES.GAMES]: batch,
          },
        }));
      }
    }

    // Upload new games
    for (const game of data.games) {
      await docClient.send(new PutCommand({
        TableName: TABLES.GAMES,
        Item: game,
      }));
    }
    console.log(`   ✅ Uploaded ${data.games.length} games`);
  }

  // Upload picks
  if (data.picks && data.picks.length > 0) {
    console.log(`🎯 Uploading ${data.picks.length} picks...`);
    
    // Delete all existing picks first
    const existingPicks = await docClient.send(new ScanCommand({ TableName: TABLES.PICKS }));
    if (existingPicks.Items && existingPicks.Items.length > 0) {
      const deleteRequests = existingPicks.Items.map(item => ({
        DeleteRequest: { Key: { id: item.id } }
      }));
      
      for (let i = 0; i < deleteRequests.length; i += 25) {
        const batch = deleteRequests.slice(i, i + 25);
        await docClient.send(new BatchWriteCommand({
          RequestItems: {
            [TABLES.PICKS]: batch,
          },
        }));
      }
    }

    // Upload new picks (batch for efficiency)
    const batchSize = 25;
    for (let i = 0; i < data.picks.length; i += batchSize) {
      const batch = data.picks.slice(i, i + batchSize);
      const putRequests = batch.map(pick => ({
        PutRequest: { Item: pick }
      }));
      
      await docClient.send(new BatchWriteCommand({
        RequestItems: {
          [TABLES.PICKS]: putRequests,
        },
      }));
      
      if ((i + batchSize) % 100 === 0) {
        process.stdout.write('.');
      }
    }
    console.log(`\n   ✅ Uploaded ${data.picks.length} picks`);
  }

  console.log('\n✨ Upload complete!');
  console.log(`   - Players: ${data.players?.length || 0}`);
  console.log(`   - Games: ${data.games?.length || 0}`);
  console.log(`   - Picks: ${data.picks?.length || 0}`);
}

// Main CLI handler
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  if (command === 'download') {
    await downloadData(arg);
  } else if (command === 'upload') {
    await uploadData(arg);
  } else {
    console.log('Usage:');
    console.log('  Download data: bun run scripts/data-manager.ts download [output-dir]');
    console.log('  Upload data:   bun run scripts/data-manager.ts upload [data-dir]');
    console.log('  Or use npm scripts:');
    console.log('  Download data: npm run data:download [output-dir]');
    console.log('  Upload data:   npm run data:upload [data-dir]');
    console.log('');
    console.log('Examples:');
    console.log('  npm run data:download');
    console.log('  npm run data:download ./my-backup');
    console.log('  npm run data:upload');
    console.log('  npm run data:upload ./my-backup');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
