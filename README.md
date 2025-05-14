# Claude Voice MCP

[![CogentEcho.ai](https://img.shields.io/badge/CogentEcho.ai-Ecosystem-blue)](https://github.com/topics/cogentecho-ai)
[![Status](https://img.shields.io/badge/Status-Pre--Alpha-orange)](https://github.com/gregmulvihill/claude-voice-mcp)
[![MCP Tool](https://img.shields.io/badge/Type-MCP%20Tool-green)](https://github.com/gregmulvihill/claude-voice-mcp)
[![License](https://img.shields.io/github/license/gregmulvihill/claude-voice-mcp)](LICENSE)
[![Protected Branch](https://img.shields.io/badge/Main%20Branch-Protected-informational)](https://github.com/gregmulvihill/claude-voice-mcp)

> **⚠️ PRE-ALPHA WARNING ⚠️**  
> This project is in pre-alpha stage. The content has been created conceptually but has not been tested. Proceed with caution as significant changes may occur before the first stable release.

MCP server implementation that enables voice conversations with Claude Desktop, initially focusing on Text-to-Speech (TTS) capabilities.

## Project Overview

This project implements a Model-Centric Programming (MCP) server that extends Claude Desktop with voice conversation capabilities. The initial focus is on Text-to-Speech functionality, converting Claude's text responses into spoken audio.

### Features

- MCP server implementation compatible with Claude Desktop
- Text-to-Speech conversion for Claude's responses
- WebSocket-based real-time communication
- Multiple language and voice support
- Simple test client for verification

## CogentEcho.ai Ecosystem Integration

This repository is part of the [CogentEcho.ai](https://github.com/topics/cogentecho-ai) ecosystem:

- **Strategic Layer**: [Orchestrate-AI](https://github.com/gregmulvihill/orchestrate-ai) - Strategic orchestration and business logic
- **Tactical Layer**: [Automated-Dev-Agents](https://github.com/gregmulvihill/automated-dev-agents) - Tactical task execution and agent management
- **Foundation Layer**: [Multi-Tiered Memory Architecture](https://github.com/gregmulvihill/multi-tiered-memory-architecture) - Memory services for persistence
- **Tool Manager**: [MCP Manager](https://github.com/gregmulvihill/mcp-manager) - Manages Claude MCP servers, including this one

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
- Web browser for testing the test client

### Installation

```bash
# Clone the repository
git clone https://github.com/gregmulvihill/claude-voice-mcp.git

# Navigate to project directory
cd claude-voice-mcp

# Install dependencies
npm install

# Copy environment example and modify as needed
cp .env.example .env

# Start the server
npm start
```

### Testing the MCP Server

The repository includes a simple test client to verify the functionality of the MCP server:

1. Start the MCP server using `npm start`
2. Open the `test-client/index.html` file in a web browser
3. Connect to the MCP server using the default WebSocket URL (`ws://localhost:3000/api/v1/ws`)
4. Enter text and click "Generate Speech" to test the TTS functionality

## Development

### Branch Protection

The main branch is protected and requires pull requests with at least one approval before merging. This ensures code quality and proper review of all changes.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request for review
5. Address any feedback
6. Your changes will be merged after approval

## Integrating with Claude Desktop

Claude Desktop supports connection to MCP servers for enhanced functionality. To integrate this voice MCP server with Claude Desktop:

### Method 1: Using the Claude Desktop UI

1. Open Claude Desktop
2. Go to Settings > Extensions
3. Click "Add MCP Server"
4. Enter the server URL: `http://localhost:3000/api/v1`
5. Click "Connect" and follow the authentication prompts if required

### Method 2: Using the Command Line

If your Claude Desktop application supports command-line installation of MCP servers:

```bash
# Run the MCP server
npm start

# In a separate terminal, use the Claude Desktop CLI to add the MCP server
claude-desktop extensions add --url=http://localhost:3000/api/v1 --name="Claude Voice"
```

### Method 3: Using npx (For Development)

For development and testing purposes, you can install the MCP server directly in Claude Desktop:

```bash
cd claude-voice-mcp
npm run build

# Install the server into Claude Desktop
npx @anthropic/claude-desktop-mcp install --path=./dist
```

### Verification

After installation, verify the integration:

1. In Claude Desktop, go to Settings > Extensions
2. Confirm "Claude Voice" is listed and shows "Connected" status
3. Start a conversation with Claude
4. Click the voice icon that appears in the interface to activate voice output

## Technical Architecture

The MCP server acts as an intermediary between Claude Desktop and voice processing services:

1. Claude Desktop sends text responses to the MCP server
2. The MCP server processes the text through a TTS engine
3. Audio is streamed back to Claude Desktop for playback

The primary components are:

- **MCP Protocol Implementation**: Handles API endpoints and WebSocket communication
- **TTS Service**: Processes text into speech using Google's TTS API
- **Session Management**: Maintains connection state and client information

## API Documentation

### REST Endpoints

- `GET /api/v1/info`: Returns information about the MCP server
- `GET /api/v1/health`: Health check endpoint
- `POST /api/v1/register`: Registers a client with the MCP server
- `GET /api/v1/tts/config`: Returns TTS configuration options
- `POST /api/v1/tts`: Processes a TTS request

### WebSocket Messages

- **Client to Server**:
  - `tts_request`: Request to convert text to speech
  - `tts_cancel`: Cancel an in-progress TTS request
  - `ping`: Keepalive message

- **Server to Client**:
  - `tts_response`: Response containing audio data
  - `tts_status`: Status updates for TTS processing
  - `error`: Error messages
  - `pong`: Response to ping messages

## Troubleshooting

If you encounter issues with the MCP server:

1. **Connection Issues**:
   - Verify the server is running (`npm start`)
   - Check that the port (default 3000) is not blocked by a firewall
   - Ensure Claude Desktop has permission to connect to local servers

2. **TTS Issues**:
   - Check server logs for specific error messages
   - Verify internet connectivity (required for Google TTS API)
   - Try with shorter text samples to isolate problems

3. **Integration Issues**:
   - Restart both the MCP server and Claude Desktop
   - Check Claude Desktop logs for connection errors
   - Verify the server URL is correctly configured

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.