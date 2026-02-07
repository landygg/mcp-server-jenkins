# Usage Guide

## Quick Start

1. **Install the Extension**
   ```bash
   cd mcp-server-jenkins
   npm install
   npm run build
   ```

2. **Configure Jenkins Credentials**

   Create a `.env` file or set environment variables:
   ```bash
   export JENKINS_URL="https://jenkins.example.com"
   export JENKINS_USERNAME="your-username"
   export JENKINS_PASSWORD="your-api-token"
   ```

3. **Configure Zed**

   Add to `~/.config/zed/settings.json`:
   ```json
   {
     "context_servers": {
       "jenkins": {
         "command": "node",
         "args": ["/absolute/path/to/mcp-server-jenkins/dist/index.js"],
         "env": {
           "JENKINS_URL": "https://jenkins.example.com",
           "JENKINS_USERNAME": "your-username",
           "JENKINS_PASSWORD": "your-api-token"
         }
       }
     }
   }
   ```

4. **Restart Zed**

## Using with Zed AI

Once configured, you can ask Zed's AI assistant to interact with Jenkins:

### Example Conversations

**Getting Job Information:**
```
You: "What Jenkins jobs do we have?"
AI: [Uses get_all_items tool to list all jobs]

You: "Show me the details for the 'backend-api' job"
AI: [Uses get_item tool with fullName="backend-api"]
```

**Monitoring Builds:**
```
You: "Are there any builds running right now?"
AI: [Uses get_running_builds tool]

You: "Show me the console output for backend-api build #123"
AI: [Uses get_build_console_output tool]
```

**Triggering Builds:**
```
You: "Trigger a build for the deploy-staging job"
AI: [Uses build_item tool with fullName="deploy-staging"]

You: "Build the integration-tests job with parameter BRANCH=develop"
AI: [Uses build_item tool with parameters]
```

**Advanced Queries:**
```
You: "Show me all failed jobs"
AI: [Uses query_items with colorPattern matching failed states]

You: "What's in the build queue?"
AI: [Uses get_all_queue_items tool]
```

## Tool Reference

### Job Tools

#### get_all_items
Lists all Jenkins items (jobs and folders).
```typescript
// No parameters required
```

#### get_item
Gets detailed information about a specific job.
```typescript
{
  fullName: "folder/job-name"  // Use slash for folders
}
```

#### get_item_config
Retrieves the XML configuration of a job.
```typescript
{
  fullName: "job-name"
}
```

#### query_items
Filters jobs using regex patterns.
```typescript
{
  classPattern?: ".*Project",      // Filter by class type
  fullNamePattern?: "backend-.*",  // Filter by name
  colorPattern?: "red|yellow"      // Filter by build status
}
```

#### build_item
Triggers a new build.
```typescript
{
  fullName: "job-name",
  parameters?: {                   // Optional build parameters
    "BRANCH": "main",
    "ENVIRONMENT": "staging"
  }
}
```

### Build Tools

#### get_build
Gets information about a specific build.
```typescript
{
  fullName: "job-name",
  buildNumber: 42
}
```

#### get_build_console_output
Retrieves the console logs.
```typescript
{
  fullName: "job-name",
  buildNumber: 42
}
```

#### get_running_builds
Lists all currently executing builds.
```typescript
// No parameters required
```

#### stop_build
Stops a running build.
```typescript
{
  fullName: "job-name",
  buildNumber: 42
}
```

### Node Tools

#### get_all_nodes
Lists all Jenkins agents/nodes.
```typescript
// No parameters required
```

#### get_node
Gets information about a specific node.
```typescript
{
  nodeName: "agent-01"
}
```

#### get_node_config
Retrieves the XML configuration of a node.
```typescript
{
  nodeName: "agent-01"
}
```

### Queue Tools

#### get_all_queue_items
Lists all items in the build queue.
```typescript
// No parameters required
```

#### get_queue_item
Gets information about a specific queue item.
```typescript
{
  queueId: 12345
}
```

#### cancel_queue_item
Cancels a queued build.
```typescript
{
  queueId: 12345
}
```

## Troubleshooting

### Connection Issues

**Problem:** Cannot connect to Jenkins
```
Error: Failed to initialize Jenkins client
```

**Solutions:**
1. Verify `JENKINS_URL` is correct and accessible
2. Check firewall/network settings
3. Verify Jenkins is running
4. Try disabling SSL verification temporarily: `JENKINS_VERIFY_SSL=false`

### Authentication Issues

**Problem:** 401 Unauthorized
```
Error: Request failed with status code 401
```

**Solutions:**
1. Verify username and password/token are correct
2. Generate a new API token in Jenkins: User → Configure → API Token
3. Ensure the user has appropriate permissions

### Permission Issues

**Problem:** 403 Forbidden
```
Error: Request failed with status code 403
```

**Solutions:**
1. Verify the Jenkins user has permission to access the requested resource
2. Check Jenkins security settings
3. For write operations (build, stop, cancel), ensure user has build permissions

### Tool Not Found

**Problem:** AI says tool is not available
```
Tool 'xyz' not found
```

**Solutions:**
1. Restart Zed to reload the MCP server
2. Check the MCP server is running: Look for errors in Zed's log
3. Verify the extension.toml is correctly configured
4. Rebuild the project: `npm run build`

## Advanced Configuration

### Custom Timeout
```json
{
  "env": {
    "JENKINS_TIMEOUT": "30"  // 30 seconds
  }
}
```

### Disable SSL Verification (Not Recommended)
```json
{
  "env": {
    "JENKINS_VERIFY_SSL": "false"
  }
}
```

### Multiple Jenkins Instances

You can configure multiple MCP servers for different Jenkins instances:

```json
{
  "context_servers": {
    "jenkins-prod": {
      "command": "node",
      "args": ["/path/to/mcp-server-jenkins/dist/index.js"],
      "env": {
        "JENKINS_URL": "https://jenkins-prod.example.com",
        "JENKINS_USERNAME": "prod-user",
        "JENKINS_PASSWORD": "prod-token"
      }
    },
    "jenkins-staging": {
      "command": "node",
      "args": ["/path/to/mcp-server-jenkins/dist/index.js"],
      "env": {
        "JENKINS_URL": "https://jenkins-staging.example.com",
        "JENKINS_USERNAME": "staging-user",
        "JENKINS_PASSWORD": "staging-token"
      }
    }
  }
}
```

## Security Best Practices

1. **Use API Tokens**: Never use your password directly. Generate API tokens in Jenkins.
2. **Limit Permissions**: Create a dedicated Jenkins user with minimum required permissions.
3. **Use Read-Only When Possible**: If you only need to monitor, use a read-only account.
4. **Keep SSL Enabled**: Always verify SSL certificates in production.
5. **Don't Commit Credentials**: Use environment variables, never commit `.env` files.
6. **Rotate Tokens**: Regularly rotate your API tokens.
