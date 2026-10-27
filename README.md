# Eldoria-Shattered-Crown

Public backup of the Eldoria: Shattered Crown Base44 web RPG (app id `6add603e8a963c48e52ad3ad`).

## Stack
Vite + React, Base44 backend (SaveGame entity), Tailwind + custom fantasy UI kit.

## Incomplete files
These three source files are larger than the Base44 MCP tool response limit and could not be fully exported via the API. Stub placeholders are committed; re-fetch from the Base44 editor (Export zip) when you need the full game data:

- `src/data/areaQuests.js`
- `src/data/npcs.js`
- `src/data/quests.js`

Zip export via `GET /api/apps/{id}/coding/export-to-zip` also failed through MCP (binary_response).

## Setup
```bash
npm install
npm run dev
```

Source snapshot only — no production secrets or user data. The duplicate Eldoria app `6add3bd4e8b00fe59464cd6d` was intentionally excluded.

## Notes
- Excluded: `node_modules`, build outputs, `.env*`, `base44/.app.jsonc`
