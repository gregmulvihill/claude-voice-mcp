import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { TtsService } from './services/ttsService.js';
import { formatResponse, logMessage } from './utils/helpers.js';

// Load environment variables
dotenv.config();

// Initialize services
const ttsService = new TtsService();

// Create Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Server configuration
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize WebSocket server for real-time communication
const wss = new WebSocketServer({ server });

// Store active connections
const clients = new Map();

// WebSocket connection handler
wss.on('connection', (ws) => {
  const clientId = uuidv4();
  clients.set(clientId, ws);
  
  logMessage(`Client connected: ${clientId}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    clientId
  }));
  
  // Handle messages from client
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      logMessage(`Received message from client ${clientId}:`, data);
      
      // Process message based on type
      switch (data.type) {
        case 'text':
          if (data.content) {
            // Generate speech from text
            const audioBuffer = await ttsService.textToSpeech(data.content);
            
            // Convert buffer to base64 for transmission
            const base64Audio = audioBuffer.toString('base64');
            
            // Send audio back to client
            ws.send(JSON.stringify({
              type: 'audio',
              format: 'mp3',
              data: base64Audio,
              messageId: data.messageId || uuidv4()
            }));
          }
          break;
        
        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unsupported message type'
          }));
      }
    } catch (error) {
      logMessage('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }));
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    clients.delete(clientId);
    logMessage(`Client disconnected: ${clientId}`);
  });
});

// REST API routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MCP service discovery endpoint
app.get('/discovery', (req, res) => {
  res.status(200).json({
    name: 'Claude Voice MCP',
    version: '0.1.0',
    capabilities: ['text-to-speech'],
    protocols: ['websocket', 'http'],
    status: 'available'
  });
});

// Start the server
server.listen(PORT, () => {
  logMessage(`Server running on port ${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  logMessage('Server shutting down...');
  server.close(() => {
    logMessage('Server stopped');
    process.exit(0);
  });
});

export default server;
