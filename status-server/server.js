const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Current status
let currentStatus = {
  state: 'active', // active, idle, working, thinking
  activity: 'Processing...',
  lastUpdate: Date.now(),
  tasksCompleted: 0,
  currentTask: null
};

// Connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);
  
  // Send current status immediately
  ws.send(JSON.stringify({
    type: 'status',
    data: currentStatus
  }));
  
  // Handle messages from clients (if needed)
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
      
      // Handle different message types
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (e) {
      console.error('Invalid message:', e);
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
  
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    clients.delete(ws);
  });
});

// Broadcast status to all connected clients
function broadcastStatus() {
  const message = JSON.stringify({
    type: 'status',
    data: currentStatus
  });
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// REST API endpoints
app.use(express.json());

// Get current status
app.get('/api/status', (req, res) => {
  res.json(currentStatus);
});

// Update status (called by your automation/scripts)
app.post('/api/status', (req, res) => {
  const { state, activity, currentTask } = req.body;
  
  if (state) currentStatus.state = state;
  if (activity) currentStatus.activity = activity;
  if (currentTask) currentStatus.currentTask = currentTask;
  currentStatus.lastUpdate = Date.now();
  
  broadcastStatus();
  res.json({ success: true, status: currentStatus });
});

// Mark task completed
app.post('/api/task-completed', (req, res) => {
  currentStatus.tasksCompleted++;
  currentStatus.lastUpdate = Date.now();
  broadcastStatus();
  res.json({ success: true, tasksCompleted: currentStatus.tasksCompleted });
});

// Get stats
app.get('/api/stats', (req, res) => {
  res.json({
    tasksCompleted: currentStatus.tasksCompleted,
    uptime: process.uptime(),
    connectedClients: clients.size,
    lastUpdate: currentStatus.lastUpdate
  });
});

// Serve static files (the Kanban board)
app.use(express.static(path.join(__dirname, 'public')));

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Simulate activity changes (for demo purposes)
// In production, this would be triggered by actual work
const activities = [
  { state: 'active', activity: 'Processing...' },
  { state: 'working', activity: 'Merging PRs...' },
  { state: 'thinking', activity: 'Analyzing code...' },
  { state: 'active', activity: 'Writing documentation...' },
  { state: 'working', activity: 'Running tests...' }
];

// Auto-update status (optional - can be disabled)
let autoUpdate = false;
if (autoUpdate) {
  setInterval(() => {
    const random = activities[Math.floor(Math.random() * activities.length)];
    currentStatus.state = random.state;
    currentStatus.activity = random.activity;
    currentStatus.lastUpdate = Date.now();
    broadcastStatus();
  }, 30000); // Every 30 seconds
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🎩 Gatsby Status Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

module.exports = { currentStatus, broadcastStatus };
