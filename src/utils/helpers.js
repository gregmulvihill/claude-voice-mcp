/**
 * Utility functions for the MCP server
 */

/**
 * Format a response object for the client
 * @param {string} type - Response type
 * @param {any} data - Response data
 * @param {Object} options - Additional options
 * @returns {Object} - Formatted response
 */
export function formatResponse(type, data, options = {}) {
  return {
    type,
    data,
    timestamp: new Date().toISOString(),
    ...options
  };
}

/**
 * Log a message to the console with timestamp
 * @param {string} message - Message to log
 * @param {any} data - Optional data to log
 */
export function logMessage(message, data = null) {
  const timestamp = new Date().toISOString();
  
  if (data) {
    // If data is an Error object, extract message
    if (data instanceof Error) {
      console.log(`[${timestamp}] ${message}`, data.message);
      console.error(data.stack);
    } else {
      // For other data, just log it
      console.log(`[${timestamp}] ${message}`, data);
    }
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
}

/**
 * Sanitize text input to prevent potential issues
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text) {
  if (!text) return '';
  
  // Remove potentially problematic characters
  return text
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, '') // Keep only letters, numbers, punctuation, and whitespace
    .trim();
}

/**
 * Split text at appropriate sentence boundaries for better TTS results
 * @param {string} text - Text to split
 * @returns {Array<string>} - Array of text fragments
 */
export function splitTextForTTS(text) {
  if (!text) return [];
  
  // Split at sentence boundaries
  const sentenceRegex = /(?<=[.!?])\s+/g;
  let sentences = text.split(sentenceRegex);
  
  // Further split long sentences
  const result = [];
  const maxLength = 100; // Characters
  
  for (const sentence of sentences) {
    if (sentence.length <= maxLength) {
      result.push(sentence);
    } else {
      // Split at clauses for long sentences
      const clauseRegex = /(?<=[,;:])\s+/g;
      let clauses = sentence.split(clauseRegex);
      
      let currentClause = '';
      for (const clause of clauses) {
        if ((currentClause + clause).length <= maxLength) {
          currentClause += (currentClause ? ' ' : '') + clause;
        } else {
          if (currentClause) {
            result.push(currentClause);
          }
          currentClause = clause;
        }
      }
      
      if (currentClause) {
        result.push(currentClause);
      }
    }
  }
  
  return result;
}

/**
 * Validate that a message has the required fields
 * @param {Object} message - Message to validate
 * @param {Array<string>} requiredFields - List of required fields
 * @returns {boolean} - Whether the message is valid
 */
export function validateMessage(message, requiredFields = []) {
  if (!message || typeof message !== 'object') {
    return false;
  }
  
  for (const field of requiredFields) {
    if (message[field] === undefined) {
      return false;
    }
  }
  
  return true;
}
