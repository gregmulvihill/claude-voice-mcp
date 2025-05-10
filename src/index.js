import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { TtsService } from './services/ttsService.js';
import { formatResponse, logMessage } from './utils/helpers.js';
import mcpRoutes from './routes/mcpRoutes.js';

// Load environment variables
dotenv.config();

// Initialize services
const ttsService = new TtsService();

// Create Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Register MCP routes
app.use(mcpRoutes);

// Server configuration
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize WebSocket server for real-time communication
const wss = new WebSocketServer({ 
  server,
  path: '/api/v1/ws'
});

// Store active connections
const clients = new Map();
const sessions = new Map();

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('session_id');
  
  clients.set(clientId, ws);
  
  if (sessionId) {
    sessions.set(sessionId, clientId);
    logMessage(`Client connected with session: ${sessionId}, client: ${clientId}`);
  } else {
    logMessage(`Client connected without session: ${clientId}`);
  }
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    client_id: clientId,
    timestamp: new Date().toISOString()
  }));
  
  // Handle messages from client
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      logMessage(`Received message from client ${clientId}:`, data);
      
      // Process message based on type
      switch (data.type) {
        case 'tts_request':
          if (data.text) {
            // Update client with processing status
            ws.send(JSON.stringify({
              type: 'tts_status',
              status: 'processing',
              request_id: data.request_id || uuidv4(),
              timestamp: new Date().toISOString()
            }));
            
            try {
              // Generate speech from text
              const audioBuffer = await ttsService.textToSpeech(
                data.text, 
                {
                  language: data.language,
                  voice: data.voice,
                  slow: data.slow
                }
              );
              
              // Convert buffer to base64 for transmission
              const base64Audio = audioBuffer.toString('base64');
              
              // Send audio back to client
              ws.send(JSON.stringify({
                type: 'tts_response',
                format: 'mp3',
                data: base64Audio,
                request_id: data.request_id,
                timestamp: new Date().toISOString()
              }));
            } catch (error) {
              logMessage('TTS processing error:', error);
              ws.send(JSON.stringify({
                type: 'tts_status',
                status: 'error',
                error: error.message,
                request_id: data.request_id,
                timestamp: new Date().toISOString()
              }));
            }
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Missing required parameter: text',
              timestamp: new Date().toISOString()
            }));
          }
          break;
        
        case 'tts_cancel':
          // In a more complex implementation, this would cancel an in-progress TTS operation
          ws.send(JSON.stringify({
            type: 'tts_status',
            status: 'cancelled',
            request_id: data.request_id,
            timestamp: new Date().toISOString()
          }));
          break;
          
        case 'ping':
          // Simple ping response for keepalive
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
          break;
        
        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unsupported message type',
            timestamp: new Date().toISOString()
          }));
      }
    } catch (error) {
      logMessage('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message',
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    // Find and remove session
    for (const [sessionId, clientSessionId] of sessions.entries()) {
      if (clientSessionId === clientId) {
        sessions.delete(sessionId);
        break;
      }
    }
    
    clients.delete(clientId);
    logMessage(`Client disconnected: ${clientId}`);
  });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
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
