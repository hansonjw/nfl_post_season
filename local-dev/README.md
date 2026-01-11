# Local Development Server

This directory contains a local Express.js server that simulates the AWS Lambda API.

## Purpose

Allows you to:
- ✅ Develop and test without AWS
- ✅ Work offline
- ✅ Avoid AWS costs during development
- ✅ Debug easily with local files

## Setup

```bash
# Install dependencies
npm install

# Start server
npm run dev
# or: bun run server.ts
```

## Data Storage

Data is stored in JSON files:
- `data/players.json` - All players
- `data/games.json` - All games  
- `data/picks.json` - All picks

## API Endpoints

Same endpoints as production:
- `GET /players`
- `POST /players`
- `PUT /players/:id`
- `GET /games`
- `POST /games`
- `PUT /games/:id`
- `GET /picks`
- `POST /picks`
- `PUT /picks/:id`
- `GET /scoreboard`

## Notes

- No authentication required (admin mode always on)
- Data persists between restarts
- Delete `data/` directory to reset

See `../LOCAL_DEVELOPMENT.md` for full guide.

