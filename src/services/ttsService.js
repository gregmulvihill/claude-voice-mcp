import googleTTS from 'google-tts-api';
import fetch from 'node-fetch';
import { logMessage } from '../utils/helpers.js';

/**
 * Service to handle Text-to-Speech conversion
 */
export class TtsService {
  constructor(config = {}) {
    this.defaultVoice = config.defaultVoice || 'en-US';
    this.defaultLanguage = config.language || 'en';
    this.defaultSlowMode = config.slowMode || false;
    this.maxTextLength = 200; // Google TTS API limit per request
    
    logMessage('TTS Service initialized');
  }
  
  /**
   * Convert text to speech using Google TTS API
   * @param {string} text - Text to convert to speech
   * @param {Object} options - Options for TTS conversion
   * @returns {Promise<Buffer>} - Audio buffer
   */
  async textToSpeech(text, options = {}) {
    try {
      const language = options.language || this.defaultLanguage;
      const voice = options.voice || this.defaultVoice;
      const slow = options.slow || this.defaultSlowMode;
      
      logMessage(`Converting text to speech: ${text.substring(0, 50)}...`);
      
      // Split long text into chunks that fit within Google TTS API limits
      const textChunks = this.splitTextIntoChunks(text);
      
      // Convert each chunk to speech
      const audioBuffers = await Promise.all(
        textChunks.map(async (chunk) => {
          // Get the URL for the audio
          const url = googleTTS.getAudioUrl(chunk, {
            lang: language,
            slow: slow,
            host: 'https://translate.google.com',
          });
          
          // Fetch the audio data
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.statusText}`);
          }
          
          // Convert to buffer
          return Buffer.from(await response.arrayBuffer());
        })
      );
      
      // Combine all audio buffers
      const combinedBuffer = Buffer.concat(audioBuffers);
      logMessage(`Generated ${combinedBuffer.length} bytes of audio data`);
      
      return combinedBuffer;
    } catch (error) {
      logMessage('Error in text-to-speech conversion:', error);
      throw new Error(`Text-to-speech conversion failed: ${error.message}`);
    }
  }
  
  /**
   * Split text into chunks that fit within Google TTS API limits
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
    
    logMessage(`Split text into ${chunks.length} chunks`);
    return chunks;
  }
  
  /**
   * Get available voices
   * @returns {Array<Object>} - List of available voices
   */
  getAvailableVoices() {
    // This is a simplified list - in a real implementation, 
    // this might come from a more comprehensive API
    return [
      { id: 'en-US', name: 'English (US)', language: 'en' },
      { id: 'en-GB', name: 'English (UK)', language: 'en' },
      { id: 'es-ES', name: 'Spanish', language: 'es' },
      { id: 'fr-FR', name: 'French', language: 'fr' },
      { id: 'de-DE', name: 'German', language: 'de' },
      { id: 'it-IT', name: 'Italian', language: 'it' },
      { id: 'ja-JP', name: 'Japanese', language: 'ja' },
      { id: 'ko-KR', name: 'Korean', language: 'ko' },
      { id: 'pt-BR', name: 'Portuguese (Brazil)', language: 'pt' },
      { id: 'ru-RU', name: 'Russian', language: 'ru' },
      { id: 'zh-CN', name: 'Chinese (Simplified)', language: 'zh-CN' },
    ];
  }
}
