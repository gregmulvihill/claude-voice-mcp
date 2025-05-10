/**
 * Unit tests for TTS Service Factory
 */
import { jest } from '@jest/globals';
import { TtsServiceFactory } from '../../src/services/ttsServiceFactory.js';
import { GoogleTtsService } from '../../src/services/googleTtsService.js';
import { ElevenLabsTtsService } from '../../src/services/elevenLabsTtsService.js';

// Mock the environment variables
jest.mock('../../src/utils/config.js', () => ({
  config: {
    ELEVENLABS_API_KEY: 'test-api-key',
    DEFAULT_TTS_PROVIDER: 'google'
  }
}));

describe('TtsServiceFactory', () => {
  
  test('should create Google TTS service by default', () => {
    const ttsService = TtsServiceFactory.createService();
    
    expect(ttsService).toBeInstanceOf(GoogleTtsService);
  });
  
  test('should create Google TTS service when specified', () => {
    const ttsService = TtsServiceFactory.createService('google');
    
    expect(ttsService).toBeInstanceOf(GoogleTtsService);
  });
  
  test('should create Eleven Labs TTS service when specified', () => {
    const ttsService = TtsServiceFactory.createService('elevenlabs');
    
    expect(ttsService).toBeInstanceOf(ElevenLabsTtsService);
  });
  
  test('should throw error for unknown provider', () => {
    expect(() => {
      TtsServiceFactory.createService('unknown-provider');
    }).toThrow('Unsupported TTS provider: unknown-provider');
  });
  
  test('should create service with voice options', () => {
    const voiceOptions = {
      voice: 'test-voice',
      pitch: 1.5,
      rate: 1.2
    };
    
    const ttsService = TtsServiceFactory.createService('google', voiceOptions);
    
    expect(ttsService.getVoiceOptions()).toEqual(voiceOptions);
  });
});
