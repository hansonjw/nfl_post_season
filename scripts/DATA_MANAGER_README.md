# Data Manager CLI Tool

A command-line tool to download and upload data from/to the DynamoDB database.

## Usage

### Download Data

Download all current data (players, games, picks) from DynamoDB to JSON files:

```bash
npm run data:download
```

Or specify a custom output directory:

```bash
npm run data:download ./my-backup
```

This will create timestamped JSON files:
- `players-YYYY-MM-DDTHH-MM-SS.json`
- `games-YYYY-MM-DDTHH-MM-SS.json`
- `picks-YYYY-MM-DDTHH-MM-SS.json`

### Upload Data

Upload/replace data in DynamoDB from JSON files:

```bash
npm run data:upload
```

Or specify a custom data directory:

```bash
npm run data:upload ./my-backup
```

The tool will look for (in this order):
1. Most recent timestamped individual files: `players-*.json`, `games-*.json`, `picks-*.json`
2. Non-timestamped individual files: `players.json`, `games.json`, `picks.json`
3. Fallback: `all-data-*.json` files (if individual files not found)

**⚠️ WARNING:** Uploading will **REPLACE** all existing data in DynamoDB! The tool will:
1. Delete all existing players, games, and picks
2. Upload the new data from your JSON files

You'll have 3 seconds to cancel (Ctrl+C) before the upload begins.

## Data Format

### Players
```json
[
  {
    "id": "uuid",
    "name": "Player Name",
    "color": "#FF0000"
  }
]
```

### Games
```json
[
  {
    "id": "uuid",
    "round": "Wild Card",
    "conference": "AFC",
    "week": 1,
    "homeTeam": "KC",
    "awayTeam": "MIA",
    "homeScore": 26,
    "awayScore": 7,
    "winner": "KC",
    "completed": true
  }
]
```

### Picks
```json
[
  {
    "id": "uuid",
    "playerId": "player-uuid",
    "gameId": "game-uuid",
    "pickedTeam": "KC",
    "isCorrect": true
  }
]
```

## Examples

### Backup current data
```bash
npm run data:download ./backups
```

### Restore from backup
```bash
npm run data:upload ./backups
```

### Edit data locally
1. Download: `npm run data:download`
2. Edit the JSON files in `./data-export/`
3. Upload: `npm run data:upload`

## Requirements

- AWS credentials configured (via AWS CLI, environment variables, or IAM role)
- Access to DynamoDB tables in `us-west-2` region
- Node.js/Bun runtime
