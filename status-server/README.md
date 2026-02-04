# Gatsby Status Server

Real-time status tracking server for the Kanban board.

## Quick Start

```bash
cd /home/ubuntu/.openclaw/workspace/status-server
npm install
npm start
```

The server will start on port 3000.

## API Endpoints

- `GET /api/status` - Get current status
- `POST /api/status` - Update status (state, activity, currentTask)
- `POST /api/task-completed` - Increment completed task count
- `GET /api/stats` - Get stats (uptime, connected clients, etc.)
- `WS /` - WebSocket for real-time updates

## Status States

- `active` - Green, processing
- `working` - Cyan, deep focus
- `thinking` - Amber, analyzing/planning
- `idle` - Gray, waiting

## Example: Update Status

```bash
curl -X POST http://localhost:3000/api/status \
  -H "Content-Type: application/json" \
  -d '{"state": "working", "activity": "Merging PRs..."}'
```

## Integration with Kanban

The Kanban board automatically connects to `ws://localhost:3000` when available.

If the server is not running, the board works in standalone mode with localStorage.
