/**
 * Abstract base class for all TTS service implementations
 * This defines the interface that all TTS providers must implement
 */
export class BaseTtsService {
  constructor(config = {}) {
    if (this.constructor === BaseTtsService) {
      throw new Error('BaseTtsService is an abstract class and cannot be instantiated directly');
    }
    
    this.config = config;
  }
  
  /**
   * Convert text to speech
   * @param {string} text - Text to convert to speech
   * @param {Object} options - Provider-specific options
   * @returns {Promise<Buffer>} - Audio buffer
   */
  async textToSpeech(text, options = {}) {
    throw new Error('Method textToSpeech() must be implemented by subclasses');
  }
  
  /**
   * Split text into chunks suitable for processing
   * @param {string} text - Text to split
   * @returns {Array<string>} - Array of text chunks
   */
  splitTextIntoChunks(text) {
    throw new Error('Method splitTextIntoChunks() must be implemented by subclasses');
  }
  
  /**
   * Get available voices for this provider
   * @returns {Array<Object>} - List of available voices
   */
  getAvailableVoices() {
    throw new Error('Method getAvailableVoices() must be implemented by subclasses');
  }
  
  /**
   * Validate if this provider is properly configured
   * @returns {boolean} - True if configuration is valid
   */
  isConfigValid() {
    throw new Error('Method isConfigValid() must be implemented by subclasses');
  }
}
