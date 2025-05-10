/**
 * Unit tests for Google TTS Service
 */
import { jest } from '@jest/globals';
import { GoogleTtsService } from '../../src/services/googleTtsService.js';

// Mock the google-tts-api module
jest.mock('google-tts-api', () => ({
  getAudioBase64: jest.fn().mockResolvedValue('mock-audio-base64-data')
}));

describe('GoogleTtsService', () => {
  let googleTtsService;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of GoogleTtsService with default options
    googleTtsService = new GoogleTtsService();
  });
  
  test('should initialize with default voice options', () => {
    expect(googleTtsService.getVoiceOptions()).toEqual({
      voice: 'en-US-Standard-B',
      pitch: 0,
      rate: 1
    });
  });
  
  test('should initialize with custom voice options', () => {
    const customOptions = {
      voice: 'en-GB-Standard-A',
      pitch: 1.5,
      rate: 0.8
    };
    
    googleTtsService = new GoogleTtsService(customOptions);
    expect(googleTtsService.getVoiceOptions()).toEqual(customOptions);
  });
  
  test('should set voice options', () => {
    const newOptions = {
      voice: 'fr-FR-Standard-A',
      pitch: 2.0,
      rate: 1.2
    };
    
    googleTtsService.setVoiceOptions(newOptions);
    expect(googleTtsService.getVoiceOptions()).toEqual(newOptions);
  });
  
  test('should generate audio from text', async () => {
    const mockText = 'This is a test message';
    const mockOptions = {
      voice: 'en-US-Standard-B',
      pitch: 0,
      rate: 1
    };
    
    const result = await googleTtsService.generateAudio(mockText);
    
    expect(result).toEqual({
      audioContent: 'mock-audio-base64-data',
      audioFormat: 'mp3',
      provider: 'google',
      voiceOptions: mockOptions
    });
    
    // Check if google-tts-api was called with correct parameters
    const googleTts = require('google-tts-api');
    expect(googleTts.getAudioBase64).toHaveBeenCalledWith(mockText, {
      lang: mockOptions.voice.substring(0, 5),
      voice: mockOptions.voice.substring(6),
      slow: false,
      host: 'https://translate.google.com',
      timeout: 10000,
      splitPunct: ',.?;:!',
    });
  });
  
  test('should handle errors during audio generation', async () => {
    // Mock implementation to simulate an error
    require('google-tts-api').getAudioBase64.mockRejectedValueOnce(new Error('API Error'));
    
    await expect(googleTtsService.generateAudio('Test message')).rejects.toThrow('Failed to generate audio with Google TTS: API Error');
  });
  
  test('should list available voices', async () => {
    const voices = await googleTtsService.listVoices();
    
    // Validate that voices structure is correct
    expect(Array.isArray(voices)).toBe(true);
    expect(voices.length).toBeGreaterThan(0);
    
    // Check a few sample voices to ensure they're in the format we expect
    expect(voices).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        language: expect.any(String)
      })
    ]));
  });
});
