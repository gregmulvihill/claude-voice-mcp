/**
 * Unit tests for Eleven Labs TTS Service
 */
import { jest } from '@jest/globals';
import { ElevenLabsTtsService } from '../../src/services/elevenLabsTtsService.js';

// Mock the elevenlabs-node module
jest.mock('elevenlabs-node', () => {
  return {
    generate: jest.fn().mockResolvedValue(Buffer.from('mock-audio-data')),
    getVoices: jest.fn().mockResolvedValue({
      voices: [
        { voice_id: 'voice1', name: 'Rachel', category: 'premade' },
        { voice_id: 'voice2', name: 'Adam', category: 'premade' }
      ]
    })
  };
});

// Mock the config for API key
jest.mock('../../src/utils/config.js', () => ({
  config: {
    ELEVENLABS_API_KEY: 'test-api-key'
  }
}));

describe('ElevenLabsTtsService', () => {
  let elevenLabsService;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of ElevenLabsTtsService with default options
    elevenLabsService = new ElevenLabsTtsService();
  });
  
  test('should initialize with default voice options', () => {
    expect(elevenLabsService.getVoiceOptions()).toEqual({
      voice: 'Rachel',
      model: 'eleven_monolingual_v1',
      stability: 0.5,
      similarity_boost: 0.75
    });
  });
  
  test('should initialize with custom voice options', () => {
    const customOptions = {
      voice: 'Adam',
      model: 'eleven_multilingual_v2',
      stability: 0.8,
      similarity_boost: 0.6
    };
    
    elevenLabsService = new ElevenLabsTtsService(customOptions);
    expect(elevenLabsService.getVoiceOptions()).toEqual(customOptions);
  });
  
  test('should set voice options', () => {
    const newOptions = {
      voice: 'Josh',
      model: 'eleven_multilingual_v2',
      stability: 0.7,
      similarity_boost: 0.8
    };
    
    elevenLabsService.setVoiceOptions(newOptions);
    expect(elevenLabsService.getVoiceOptions()).toEqual(newOptions);
  });
  
  test('should generate audio from text', async () => {
    const mockText = 'This is a test message';
    const mockOptions = elevenLabsService.getVoiceOptions();
    
    const elevenLabs = require('elevenlabs-node');
    
    const result = await elevenLabsService.generateAudio(mockText);
    
    expect(result).toEqual({
      audioContent: 'bW9jay1hdWRpby1kYXRh', // Base64 encoded mock-audio-data
      audioFormat: 'mp3',
      provider: 'elevenlabs',
      voiceOptions: mockOptions
    });
    
    // Check if elevenlabs-node was called with correct parameters
    expect(elevenLabs.generate).toHaveBeenCalledWith({
      api_key: 'test-api-key',
      voice: expect.any(String),
      model_id: mockOptions.model,
      text: mockText,
      voice_settings: {
        stability: mockOptions.stability,
        similarity_boost: mockOptions.similarity_boost
      }
    });
  });
  
  test('should handle errors during audio generation', async () => {
    // Mock implementation to simulate an error
    require('elevenlabs-node').generate.mockRejectedValueOnce(new Error('API Error'));
    
    await expect(elevenLabsService.generateAudio('Test message')).rejects.toThrow('Failed to generate audio with Eleven Labs TTS: API Error');
  });
  
  test('should list available voices', async () => {
    const voices = await elevenLabsService.listVoices();
    
    // Validate that voices structure is correct
    expect(Array.isArray(voices)).toBe(true);
    expect(voices.length).toBe(2);
    
    // Check that the voices have the expected structure
    expect(voices).toEqual([
      { id: 'voice1', name: 'Rachel', category: 'premade' },
      { id: 'voice2', name: 'Adam', category: 'premade' }
    ]);
    
    // Verify that the API was called
    const elevenLabs = require('elevenlabs-node');
    expect(elevenLabs.getVoices).toHaveBeenCalledWith({
      api_key: 'test-api-key'
    });
  });
  
  test('should handle errors when listing voices', async () => {
    // Mock implementation to simulate an error
    require('elevenlabs-node').getVoices.mockRejectedValueOnce(new Error('API Error'));
    
    await expect(elevenLabsService.listVoices()).rejects.toThrow('Failed to list Eleven Labs voices: API Error');
  });
});
