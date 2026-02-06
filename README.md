# MCP Server for Jenkins - Zed Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that enables AI-powered interactions with Jenkins CI/CD pipelines in the Zed editor. This extension allows Zed's AI assistant to autonomously interact with your Jenkins server, query jobs, trigger builds, and analyze logs.

## 🚀 Quick Start

**New to this project?** Check out the [Quick Start Guide](QUICKSTART.md) to get running in 5 minutes!

## Features

- 🔧 **Complete Jenkins API Coverage**: Access jobs, builds, nodes, and queue items
- 🔐 **Secure Credential Management**: Environment-based authentication
- 📊 **Build Monitoring**: Track running builds and retrieve console logs
- 🚀 **Job Control**: Trigger builds with parameters and stop running builds
- 🔍 **Advanced Querying**: Filter jobs by name, status, and type
- 🤖 **AI-Ready**: Designed for autonomous use by Zed's AI assistant

## Installation

### Prerequisites

- [Zed Editor](https://zed.dev/) installed
- Node.js 18+ installed
- Access to a Jenkins server

### Setup

1. Clone this repository:
```bash
git clone https://github.com/landygg/mcp-server-jenkins.git
cd mcp-server-jenkins
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Configure the extension in Zed's settings.

## Configuration

### Environment Variables

Set the following environment variables for Jenkins authentication:

```bash
export JENKINS_URL="https://your-jenkins-server.com"
export JENKINS_USERNAME="your-username"
export JENKINS_PASSWORD="your-api-token"  # Or JENKINS_API_TOKEN
export JENKINS_TIMEOUT="10"  # Optional, default: 5 seconds
export JENKINS_VERIFY_SSL="true"  # Optional, default: true
```

### Zed Configuration

Add the extension to your Zed configuration file (`~/.config/zed/settings.json`):

```json
{
  "context_servers": {
    "jenkins": {
      "command": "node",
      "args": ["/path/to/mcp-server-jenkins/dist/index.js"],
      "env": {
        "JENKINS_URL": "https://your-jenkins-server.com",
        "JENKINS_USERNAME": "your-username",
        "JENKINS_PASSWORD": "your-api-token"
      }
    }
  }
}
```

Or install as a Zed extension by placing this repository in Zed's extensions directory.

## Available Tools

The MCP server exposes the following tools for AI interaction:

### Job Management
- `get_all_items` - Get all jobs and folders from Jenkins
- `get_item` - Get details of a specific job
- `get_item_config` - Get XML configuration of a job
- `query_items` - Query jobs with pattern filters
- `build_item` - Trigger a build (with optional parameters)

### Build Management
- `get_build` - Get details of a specific build
- `get_build_console_output` - Get console logs of a build
- `get_running_builds` - Get all currently running builds
- `stop_build` - Stop a running build

### Node Management
- `get_all_nodes` - Get all Jenkins agents/nodes
- `get_node` - Get details of a specific node
- `get_node_config` - Get XML configuration of a node

### Queue Management
- `get_all_queue_items` - Get all items in the build queue
- `get_queue_item` - Get details of a specific queue item
- `cancel_queue_item` - Cancel a queued build

## Usage Examples

Once configured, you can interact with Jenkins through Zed's AI assistant:

**Example queries:**
- "Show me all Jenkins jobs"
- "What builds are currently running?"
- "Get the console output for job 'my-project' build #42"
- "Trigger a build for the 'deploy-production' job"
- "What's the status of the build queue?"

## Technology Decisions

### TypeScript vs Rust

**Decision: TypeScript**

After evaluating both options, TypeScript was chosen for the following reasons:

1. **Adequate Performance**: Jenkins operations are I/O-bound (network requests), making TypeScript's performance sufficient for this use case
2. **Faster Development**: Quicker iteration and easier maintenance
3. **Better Ecosystem**: Rich npm ecosystem for HTTP clients and JSON-RPC libraries
4. **Lower Barrier to Entry**: More accessible for Jenkins community contributions
5. **MCP SDK Support**: Official `@modelcontextprotocol/sdk` package provides excellent TypeScript support

Rust would offer better performance for compute-intensive tasks, but for a CI/CD integration server communicating over HTTP, the performance difference is negligible.

## Architecture

```
mcp-server-jenkins/
├── src/
│   ├── index.ts           # MCP server entry point (JSON-RPC/stdio)
│   ├── client/
│   │   └── jenkins.ts     # Jenkins API client
│   ├── types/
│   │   └── jenkins.ts     # TypeScript type definitions
│   └── tools/
│       └── index.ts       # Tool definitions and handlers
├── extension.toml         # Zed extension manifest
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch mode for development
npm run dev

# Run linter
npm run lint

# Format code
npm run format
```

## Security

- **Credentials**: Never commit credentials to the repository. Use environment variables.
- **API Tokens**: Use Jenkins API tokens instead of passwords for better security.
- **SSL Verification**: Keep SSL verification enabled in production (default: true). Only disable for development with self-signed certificates using `JENKINS_VERIFY_SSL=false`.
- **Read-Only Mode**: Consider using a Jenkins user with read-only permissions for safety.
- **Network Security**: The server communicates with Jenkins over HTTPS with certificate validation by default.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [lanbaoshen/mcp-jenkins](https://github.com/lanbaoshen/mcp-jenkins)
- Built for [Zed Editor](https://zed.dev/)
- Implements [Model Context Protocol](https://modelcontextprotocol.io/)

## Support

For issues and questions:
- Open an issue on GitHub
- Check Zed's [MCP extension documentation](https://zed.dev/docs/extensions/mcp-extensions)