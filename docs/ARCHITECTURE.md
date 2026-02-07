# Architecture Documentation

## Overview

The Jenkins MCP Server is a standalone Node.js application that implements the Model Context Protocol (MCP) to enable AI-powered interactions with Jenkins CI/CD through the Zed editor.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Zed Editor                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Zed AI Assistant                       │   │
│  │  (Uses MCP to interact with Jenkins)                │   │
│  └────────────────────┬────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        │ JSON-RPC over stdio
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              MCP Server (Node.js/TypeScript)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           src/index.ts (Entry Point)                  │  │
│  │  - Initializes MCP Server                            │  │
│  │  - Handles stdio transport                           │  │
│  │  - Registers tool handlers                           │  │
│  └───────────┬──────────────────────────────────────────┘  │
│              │                                              │
│  ┌───────────▼──────────────────────────────────────────┐  │
│  │        src/tools/index.ts (Tool Registry)            │  │
│  │  - Defines 15 MCP tools                              │  │
│  │  - Tool schemas & validation                         │  │
│  │  - Routes tool calls to client                       │  │
│  └───────────┬──────────────────────────────────────────┘  │
│              │                                              │
│  ┌───────────▼──────────────────────────────────────────┐  │
│  │      src/client/jenkins.ts (Jenkins Client)          │  │
│  │  - HTTP client (Axios)                               │  │
│  │  - Jenkins API wrapper                               │  │
│  │  - Authentication handling                           │  │
│  │  - SSL verification                                  │  │
│  └───────────┬──────────────────────────────────────────┘  │
│              │                                              │
│  ┌───────────▼──────────────────────────────────────────┐  │
│  │     src/types/jenkins.ts (Type Definitions)          │  │
│  │  - TypeScript interfaces                             │  │
│  │  - Data models                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/HTTPS
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Jenkins Server                            │
│  - Jenkins API                                               │
│  - Job Management                                            │
│  - Build System                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Entry Point (src/index.ts)

**Responsibilities:**
- Initialize MCP server with metadata
- Configure stdio transport
- Load Jenkins configuration from environment
- Register tool handlers
- Handle server lifecycle

**Key Features:**
- Error handling and logging
- Graceful startup/shutdown
- Environment variable validation

### 2. Tool Registry (src/tools/index.ts)

**Responsibilities:**
- Define all available MCP tools
- Provide JSON schemas for tool inputs
- Route tool execution to Jenkins client
- Format responses for MCP protocol

**Tool Categories:**
- **Job Tools**: 5 tools (list, get, config, query, build)
- **Build Tools**: 4 tools (get, logs, running, stop)
- **Node Tools**: 3 tools (list, get, config)
- **Queue Tools**: 3 tools (list, get, cancel)

**Tool Structure:**
```typescript
{
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, SchemaProperty>;
    required?: string[];
  }
}
```

### 3. Jenkins Client (src/client/jenkins.ts)

**Responsibilities:**
- HTTP communication with Jenkins
- API endpoint construction
- Request/response handling
- Error handling
- Authentication management
- CSRF protection via crumb management

**Features:**
- Connection pooling with keep-alive
- Configurable timeouts
- SSL verification control
- Basic authentication support
- URL encoding for job names with folders
- CSRF crumb support for POST requests

**API Coverage:**
- `/api/json` - Server and job information
- `/job/{name}/api/json` - Job details
- `/job/{name}/config.xml` - Job configuration
- `/job/{name}/build` - Trigger build
- `/job/{name}/{number}/consoleText` - Build logs
- `/computer/api/json` - Node information
- `/queue/api/json` - Queue items

### 4. Type System (src/types/jenkins.ts)

**Responsibilities:**
- Define TypeScript interfaces
- Ensure type safety
- Document data structures

**Key Types:**
- `JenkinsConfig` - Server configuration
- `JenkinsItem` - Jobs and folders
- `JenkinsBuild` - Build information
- `JenkinsNode` - Agent/node data
- `JenkinsQueueItem` - Queue items

## Communication Flow

### 1. Tool Invocation Flow

```
Zed AI Request → MCP Server → Tool Handler → Jenkins Client → Jenkins API
                                                                     ↓
Zed AI Response ← MCP Server ← Tool Handler ← Jenkins Client ← JSON Response
```

### 2. Example: Get Build Logs

```typescript
// 1. Zed AI makes request
{
  "method": "tools/call",
  "params": {
    "name": "get_build_console_output",
    "arguments": {
      "fullName": "my-job",
      "buildNumber": 42
    }
  }
}

// 2. MCP Server routes to tool handler
executeTool(client, "get_build_console_output", { fullName: "my-job", buildNumber: 42 })

// 3. Jenkins Client makes HTTP request
GET /job/my-job/42/consoleText

// 4. Response flows back through stack
{
  "content": [{
    "type": "text",
    "text": "Build log content..."
  }]
}
```

## Configuration Management

### Environment Variables

```typescript
{
  JENKINS_URL: string;           // Required
  JENKINS_USERNAME: string;      // Optional
  JENKINS_PASSWORD: string;      // Optional
  JENKINS_TIMEOUT: string;       // Optional, default: "5"
  JENKINS_VERIFY_SSL: string;    // Optional, default: "true"
}
```

### Zed Integration

Configured in `extension.toml`:
```toml
[context_servers.jenkins]
command = "node"
args = ["dist/index.js"]
```

Environment variables passed through Zed settings:
```json
{
  "context_servers": {
    "jenkins": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "JENKINS_URL": "...",
        "JENKINS_USERNAME": "...",
        "JENKINS_PASSWORD": "..."
      }
    }
  }
}
```

## Security Architecture

### 1. Credential Management
- **Environment Variables**: Credentials never stored in code
- **No Logging**: Sensitive data not logged to console
- **Process Isolation**: Each Zed workspace can have separate credentials

### 2. Network Security
- **SSL/TLS**: Enforced by default
- **Certificate Verification**: Can be disabled for self-signed certs
- **Timeout Protection**: Prevents hanging requests

### 3. API Token Support
- Prefers API tokens over passwords
- Supports Jenkins token authentication
- Basic auth header construction

## Performance Characteristics

### Memory Usage
- **Base**: ~50MB (Node.js runtime)
- **Per Request**: ~1-5MB (depending on response size)
- **Connection Pool**: Reuses connections (Axios default)

### Latency
- **MCP Overhead**: < 5ms
- **Processing**: < 10ms per request
- **Network**: 50-500ms (dominant factor)
- **Total**: Primarily network-bound

### Scalability
- **Single Instance**: Handles Zed's sequential requests
- **Stateless**: Each request independent
- **Concurrent Safe**: Async/await throughout

## Error Handling

### Strategy
1. **Validate Early**: Check config on startup
2. **Graceful Degradation**: Return errors to Zed AI
3. **Informative Messages**: Include context in errors
4. **No Crashes**: Catch all exceptions

### Error Types
- **Configuration Errors**: Missing JENKINS_URL
- **Network Errors**: Connection refused, timeout
- **Authentication Errors**: 401/403 responses
- **API Errors**: Invalid job names, build numbers
- **MCP Errors**: Tool not found, invalid arguments

## Build & Deployment

### Build Process
```bash
npm install    # Install dependencies
npm run build  # TypeScript compilation
```

**Output:**
- `dist/` directory with compiled JavaScript
- Type declarations (`.d.ts` files)
- Source maps for debugging

### Distribution
- **npm Package**: Can be published to npm
- **Git Clone**: Direct installation from repository
- **Zed Extension**: Via extension manifest

## Testing Strategy

### Manual Testing
- Start server with test config
- Verify tools are registered
- Test with real Jenkins instance

### Future: Automated Testing
- Unit tests for client methods
- Integration tests with mock Jenkins API
- E2E tests with Zed

## Dependencies

### Production
- `@modelcontextprotocol/sdk` - MCP implementation
- `axios` - HTTP client

### Development
- `typescript` - Type checking & compilation
- `@types/node` - Node.js type definitions
- `@biomejs/biome` - Code linting & formatting

## Extension Points

### Adding New Tools
1. Define tool in `src/tools/index.ts`
2. Add handler in `executeTool()`
3. Implement client method if needed
4. Update documentation

### Custom Authentication
Extend `JenkinsClient` constructor:
```typescript
// Add custom auth header
axiosConfig.headers['X-Custom-Auth'] = token;
```

### Response Transformation
Modify tool handler:
```typescript
case 'my_tool':
  const result = await client.method();
  return transformResponse(result);
```

## Monitoring & Debugging

### Logging
- **stderr**: Server logs (startup, errors)
- **stdout**: MCP protocol messages (JSON-RPC)

### Debug Mode
Set environment variable:
```bash
DEBUG=true node dist/index.js
```

### Common Issues
1. **Connection refused**: Check JENKINS_URL
2. **401 Unauthorized**: Verify credentials
3. **Tool not found**: Rebuild project
4. **Timeout**: Increase JENKINS_TIMEOUT

## Future Enhancements

### Planned Features
- Caching layer for frequently accessed data
- Webhook support for real-time updates
- Multi-Jenkins instance support
- Advanced filtering and search
- Pipeline syntax support

### Performance Improvements
- Request batching
- Lazy loading of build history
- Compressed responses
- Connection pooling tuning

### Security Enhancements
- OAuth2 support
- JWT authentication
- Credential encryption at rest
- Audit logging
