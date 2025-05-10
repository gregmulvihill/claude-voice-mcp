import { BaseTtsService } from './baseTtsService.js';
import { logMessage } from '../utils/helpers.js';
import fetch from 'node-fetch';

/**
 * Eleven Labs TTS Service Implementation
 */
export class ElevenLabsTtsService extends BaseTtsService {
  constructor(config = {}) {
    super(config);
    
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.defaultVoiceId = process.env.ELEVENLABS_DEFAULT_VOICE || '21m00Tcm4TlvDq8ikWAM'; // Rachel voice ID
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    this.maxTextLength = 5000; // Eleven Labs has a higher character limit than Google TTS
    
    // Voice stability and similarity settings (0-1)
    this.stability = config.stability || 0.5;
    this.similarityBoost = config.similarityBoost || 0.75;
    
    logMessage('Eleven Labs TTS Service initialized');
  }
  
  /**
   * Convert text to speech using Eleven Labs API
   * @param {string} text - Text to convert to speech
   * @param {Object} options - Options for TTS conversion
   * @returns {Promise<Buffer>} - Audio buffer
   */
  async textToSpeech(text, options = {}) {
    try {
      if (!this.isConfigValid()) {
        throw new Error('Eleven Labs API key not configured');
      }
      
      const voiceId = options.voice || this.defaultVoiceId;
      
      logMessage(`Converting text to speech with Eleven Labs: ${text.substring(0, 50)}...`);
      
      // Split long text into chunks if needed
      if (text.length > this.maxTextLength) {
        const textChunks = this.splitTextIntoChunks(text);
        logMessage(`Text exceeds maximum length, split into ${textChunks.length} chunks`);
        
        // Convert each chunk to speech and combine
        const audioBuffers = await Promise.all(
          textChunks.map(chunk => this._convertTextChunk(chunk, voiceId, options))
        );
        
        // Combine all audio buffers
        const combinedBuffer = Buffer.concat(audioBuffers);
        logMessage(`Generated ${combinedBuffer.length} bytes of audio data from Eleven Labs`);
        
        return combinedBuffer;
      }
      
      // For text within limits, convert directly
      return await this._convertTextChunk(text, voiceId, options);
    } catch (error) {
      logMessage('Error in Eleven Labs text-to-speech conversion:', error);
      throw new Error(`Eleven Labs text-to-speech conversion failed: ${error.message}`);
    }
  }
  
  /**
   * Convert a single chunk of text to speech
   * @param {string} text - Text chunk to convert
   * @param {string} voiceId - Voice ID
   * @param {Object} options - Additional options
   * @returns {Promise<Buffer>} - Audio buffer
   */
  async _convertTextChunk(text, voiceId, options = {}) {
    const url = `${this.baseUrl}/text-to-speech/${voiceId}`;
    
    const stability = options.stability || this.stability;
    const similarityBoost = options.similarityBoost || this.similarityBoost;
    
    const requestBody = {
      text: text,
      model_id: options.modelId || 'eleven_multilingual_v2',
      voice_settings: {
        stability,
        similarity_boost: similarityBoost
      }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Eleven Labs API error: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
    }
    
    // Convert the response to a buffer
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  
  /**
   * Split text into chunks that fit within API limits
   * @param {string} text - Text to split
   * @returns {Array<string>} - Array of text chunks
   */
  splitTextIntoChunks(text) {
    const chunks = [];
    let currentIndex = 0;
    
    while (currentIndex < text.length) {
      let chunkEnd = currentIndex + this.maxTextLength;
      
      // If we're not at the end of the text, try to find a natural break point
      if (chunkEnd < text.length) {
        // Look for the last sentence break (., !, ?) or paragraph break within the chunk
        const lastSentenceBreak = Math.max(
          text.lastIndexOf('. ', chunkEnd),
          text.lastIndexOf('! ', chunkEnd),
          text.lastIndexOf('? ', chunkEnd),
          text.lastIndexOf('\n', chunkEnd)
        );
        
        // If we found a natural break, use it
        if (lastSentenceBreak > currentIndex) {
          chunkEnd = lastSentenceBreak + 1; // Include the punctuation
        } else {
          // Otherwise, look for the last space within the chunk
          const lastSpace = text.lastIndexOf(' ', chunkEnd);
          if (lastSpace > currentIndex) {
            chunkEnd = lastSpace;
          }
          // If we can't find a space, just use the maximum length
        }
      }
      
      // Add this chunk to our array
      chunks.push(text.substring(currentIndex, chunkEnd).trim());
      currentIndex = chunkEnd;
    }
    
    logMessage(`Split text into ${chunks.length} chunks for Eleven Labs TTS`);
    return chunks;
  }
  
  /**
   * Get available voices from Eleven Labs API
   * @returns {Promise<Array<Object>>} - List of available voices
   */
  async getAvailableVoices() {
    try {
      if (!this.isConfigValid()) {
        return this._getDefaultVoices();
      }
      
      const url = `${this.baseUrl}/voices`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Map Eleven Labs voices to our standard format
      return data.voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        language: 'en', // Eleven Labs doesn't have a direct language code, assuming English for now
        provider: 'elevenlabs',
        gender: voice.labels?.gender || 'unknown',
        preview_url: voice.preview_url || null
      }));
    } catch (error) {
      logMessage('Error fetching Eleven Labs voices:', error);
      return this._getDefaultVoices();
    }
  }
  
  /**
   * Get a default list of voices when API is unavailable
   * @returns {Array<Object>} - Default list of voices
   */
  _getDefaultVoices() {
    return [
      { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', language: 'en', provider: 'elevenlabs', gender: 'female' },
      { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', language: 'en', provider: 'elevenlabs', gender: 'female' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', language: 'en', provider: 'elevenlabs', gender: 'female' },
      { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', language: 'en', provider: 'elevenlabs', gender: 'male' },
      { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', language: 'en', provider: 'elevenlabs', gender: 'female' },
      { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', language: 'en', provider: 'elevenlabs', gender: 'male' },
      { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', language: 'en', provider: 'elevenlabs', gender: 'male' },
      { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', language: 'en', provider: 'elevenlabs', gender: 'male' },
      { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', language: 'en', provider: 'elevenlabs', gender: 'male' }
    ];
  }
  
  /**
   * Check if the configuration is valid
   * @returns {boolean} - True if the API key is configured
   */
  isConfigValid() {
    return !!this.apiKey && this.apiKey.length > 0;
  }
}
