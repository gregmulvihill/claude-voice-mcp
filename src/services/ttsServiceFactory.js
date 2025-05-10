import { GoogleTtsService } from './googleTtsService.js';
import { ElevenLabsTtsService } from './elevenLabsTtsService.js';
import { logMessage } from '../utils/helpers.js';

/**
 * Factory class for creating TTS service instances based on configuration
 */
export class TtsServiceFactory {
  /**
   * Create a TTS service based on the specified provider
   * @param {string} provider - TTS provider name (google, elevenlabs, aws)
   * @param {Object} config - Provider-specific configuration
   * @returns {BaseTtsService} - Configured TTS service instance
   */
  static createService(provider = null, config = {}) {
    // If no provider specified, use the environment variable
    const selectedProvider = provider || process.env.TTS_PROVIDER || 'google';
    
    logMessage(`Creating TTS service for provider: ${selectedProvider}`);
    
    switch (selectedProvider.toLowerCase()) {
      case 'elevenlabs':
        return new ElevenLabsTtsService(config);
        
      case 'google':
        return new GoogleTtsService(config);
        
      // AWS Polly implementation would go here
      // case 'aws':
      //  return new AwsPollyTtsService(config);
        
      default:
        logMessage(`Unknown TTS provider: ${selectedProvider}, falling back to Google TTS`);
        return new GoogleTtsService(config);
    }
  }
  
  /**
   * Check if a provider is configured correctly
   * @param {string} provider - TTS provider name
   * @returns {boolean} - True if the provider is properly configured
   */
  static isProviderConfigured(provider) {
    switch (provider.toLowerCase()) {
      case 'elevenlabs':
        return !!process.env.ELEVENLABS_API_KEY;
        
      case 'google':
        return true; // Google TTS doesn't require an API key
        
      case 'aws':
        return !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY;
        
      default:
        return false;
    }
  }
  
  /**
   * Get all available configured providers
   * @returns {Array<string>} - List of configured provider names
   */
  static getAvailableProviders() {
    const providers = [];
    
    // Always add Google TTS as it doesn't require API keys
    providers.push('google');
    
    // Check if Eleven Labs is configured
    if (this.isProviderConfigured('elevenlabs')) {
      providers.push('elevenlabs');
    }
    
    // Check if AWS Polly is configured
    if (this.isProviderConfigured('aws')) {
      providers.push('aws');
    }
    
    return providers;
  }
}
