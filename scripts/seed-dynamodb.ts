// Script to seed DynamoDB with initial data using the production API
import { seedPlayers, seedGames, generatePicks } from '../local-dev/data/seed-data';
import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.API_URL || 'https://7fafxcafc1.execute-api.us-west-2.amazonaws.com/prod';

async function seedDynamoDB() {
  console.log('🌱 Seeding DynamoDB...\n');

  // Seed players
  console.log('📝 Creating players...');
  const players = [];
  for (const playerData of seedPlayers) {
    try {
      const response = await fetch(`${API_URL}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });
      if (response.ok) {
        const data = await response.json();
        players.push(data.player);
        console.log(`   ✅ Created: ${data.player.name}`);
      } else {
        const error = await response.json();
        console.error(`   ❌ Failed: ${playerData.name} - ${error.error}`);
      }
    } catch (error) {
      console.error(`   ❌ Error creating ${playerData.name}:`, error);
    }
  }

  // Seed games
  console.log('\n🎮 Creating games...');
  const games = [];
  for (const gameData of seedGames) {
    try {
      const response = await fetch(`${API_URL}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameData),
      });
      if (response.ok) {
        const data = await response.json();
        games.push(data.game);
        console.log(`   ✅ Created: ${data.game.round} - Week ${data.game.week}`);
      } else {
        const error = await response.json();
        console.error(`   ❌ Failed: ${gameData.round} - ${error.error}`);
      }
    } catch (error) {
      console.error(`   ❌ Error creating game:`, error);
    }
  }

  // Seed picks (only for games with teams set)
  console.log('\n🎯 Creating picks...');
  const gamesWithTeams = games.filter(g => g.homeTeam && g.awayTeam);
  const picks = generatePicks(
    players.map(p => ({ ...p, id: p.id })),
    gamesWithTeams.map(g => ({ ...g, id: g.id }))
  );

  let pickCount = 0;
  for (const pickData of picks) {
    try {
      const response = await fetch(`${API_URL}/picks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pickData),
      });
      if (response.ok) {
        pickCount++;
        if (pickCount % 10 === 0) {
          process.stdout.write('.');
        }
      } else {
        const error = await response.json();
        console.error(`\n   ❌ Failed pick: ${error.error}`);
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
  seedDynamoDB().catch(console.error);
}

export { seedDynamoDB };
