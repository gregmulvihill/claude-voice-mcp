# Claude Voice MCP

MCP server implementation that enables voice conversations with Claude Desktop, initially focusing on Text-to-Speech (TTS) capabilities.

## Project Overview

This project implements a Model-Centric Programming (MCP) server that extends Claude Desktop with voice conversation capabilities. The initial focus is on Text-to-Speech functionality, converting Claude's text responses into spoken audio.

### Features (Planned)

- MCP server implementation compatible with Claude Desktop
- Text-to-Speech conversion for Claude's responses
- High-quality voice synthesis with natural intonation
- Simple configuration and deployment process

## Development Roadmap

1. **Phase 1 (Current)**: Text-to-Speech Implementation
   - Basic MCP server setup
   - Text-to-Speech integration
   - Configuration options for voice selection

2. **Phase 2 (Future)**: Speech-to-Text Implementation
   - Audio capture and processing
   - Speech recognition integration
   - Full duplex conversation support

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- Claude Desktop application
- (Additional dependencies will be listed as development progresses)

### Installation

```bash
# Clone the repository
git clone https://github.com/gregmulvihill/claude-voice-mcp.git

# Navigate to project directory
cd claude-voice-mcp

# Install dependencies
npm install

# Start the server
npm start
```

### Configuration

Detailed configuration options will be provided as development progresses.

## Technical Architecture

The MCP server acts as an intermediary between Claude Desktop and voice processing services:

1. Claude Desktop sends text responses to the MCP server
2. The MCP server processes the text through a TTS engine
3. Audio is streamed back to the client for playback

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.