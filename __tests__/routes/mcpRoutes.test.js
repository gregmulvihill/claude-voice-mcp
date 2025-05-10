/**
 * Unit tests for MCP Routes
 */
import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { mcpRouter } from '../../src/routes/mcpRoutes.js';

// Mock the TTS service
jest.mock('../../src/services/ttsServiceFactory.js', () => {
  const mockGenerateAudio = jest.fn().mockResolvedValue({
    audioContent: 'mock-audio-base64',
    audioFormat: 'mp3',
    provider: 'google',
    voiceOptions: { voice: 'en-US-Standard-B', pitch: 0, rate: 1 }
  });

  const mockListVoices = jest.fn().mockResolvedValue([
    { id: 'voice1', name: 'Voice 1', language: 'en-US' },
    { id: 'voice2', name: 'Voice 2', language: 'en-GB' }
  ]);

  return {
    TtsServiceFactory: {
      createService: jest.fn().mockReturnValue({
        generateAudio: mockGenerateAudio,
        listVoices: mockListVoices,
        getVoiceOptions: jest.fn().mockReturnValue({
          voice: 'en-US-Standard-B',
          pitch: 0,
          rate: 1
        }),
        setVoiceOptions: jest.fn()
      })
    }
  };
});

describe('MCP Routes', () => {
  let app;
  
  beforeEach(() => {
    // Create an Express app for testing
    app = express();
    app.use(bodyParser.json());
    app.use('/mcp', mcpRouter);
    
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  test('should return provider info on GET /mcp/provider', async () => {
    const response = await request(app).get('/mcp/provider');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      name: 'claude-voice-mcp',
      version: expect.any(String),
      capabilities: expect.arrayContaining([
        'text-to-speech'
      ])
    });
  });
  
  test('should generate audio on POST /mcp/tts', async () => {
    const response = await request(app)
      .post('/mcp/tts')
      .send({
        text: 'Hello, this is a test',
        provider: 'google',
        voiceOptions: {
          voice: 'en-US-Standard-B',
          pitch: 0,
          rate: 1
        }
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      audioContent: 'mock-audio-base64',
      audioFormat: 'mp3',
      provider: 'google',
      voiceOptions: { voice: 'en-US-Standard-B', pitch: 0, rate: 1 }
    });
    
    // Check that TTS service factory was called with correct parameters
    const { TtsServiceFactory } = require('../../src/services/ttsServiceFactory.js');
    expect(TtsServiceFactory.createService).toHaveBeenCalledWith('google', {
      voice: 'en-US-Standard-B',
      pitch: 0,
      rate: 1
    });
  });
  
  test('should handle missing text in POST /mcp/tts', async () => {
    const response = await request(app)
      .post('/mcp/tts')
      .send({
        provider: 'google',
        voiceOptions: {
          voice: 'en-US-Standard-B',
          pitch: 0,
          rate: 1
        }
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Bad Request',
      message: 'Text is required'
    });
  });
  
  test('should list voices on GET /mcp/voices', async () => {
    const response = await request(app).get('/mcp/voices?provider=google');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 'voice1', name: 'Voice 1', language: 'en-US' },
      { id: 'voice2', name: 'Voice 2', language: 'en-GB' }
    ]);
    
    // Check that TTS service factory was called with correct parameters
    const { TtsServiceFactory } = require('../../src/services/ttsServiceFactory.js');
    expect(TtsServiceFactory.createService).toHaveBeenCalledWith('google');
  });
  
  test('should handle errors during voice listing', async () => {
    // Mock the listVoices function to throw an error
    const { TtsServiceFactory } = require('../../src/services/ttsServiceFactory.js');
    TtsServiceFactory.createService().listVoices.mockRejectedValueOnce(new Error('API Error'));
    
    const response = await request(app).get('/mcp/voices?provider=google');
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Internal Server Error',
      message: 'Failed to list voices: API Error'
    });
  });
  
  test('should handle errors during audio generation', async () => {
    // Mock the generateAudio function to throw an error
    const { TtsServiceFactory } = require('../../src/services/ttsServiceFactory.js');
    TtsServiceFactory.createService().generateAudio.mockRejectedValueOnce(new Error('API Error'));
    
    const response = await request(app)
      .post('/mcp/tts')
      .send({
        text: 'Hello, this is a test',
        provider: 'google',
        voiceOptions: {
          voice: 'en-US-Standard-B',
          pitch: 0,
          rate: 1
        }
      });
    
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Internal Server Error',
      message: 'Failed to generate audio: API Error'
    });
  });
});
