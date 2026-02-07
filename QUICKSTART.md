# Quick Start Guide

Get up and running with the Jenkins MCP Server for Zed in 5 minutes!

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Zed Editor installed
- ✅ Access to a Jenkins server

## Step 1: Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/landygg/mcp-server-jenkins.git
cd mcp-server-jenkins

# Install dependencies
npm install

# Build the project
npm run build
```

## Step 2: Configure (1 minute)

Create a `.env` file in the project root:

```bash
# Copy the example
cp .env.example .env

# Edit with your Jenkins details
JENKINS_URL=https://your-jenkins.com
JENKINS_USERNAME=your-username
JENKINS_PASSWORD=your-api-token
```

**Getting your Jenkins API token:**
1. Log into Jenkins
2. Click your name (top right)
3. Click "Configure"
4. Scroll to "API Token"
5. Click "Add new Token"
6. Copy the token

## Step 3: Configure Zed (1 minute)

Edit Zed settings (`~/.config/zed/settings.json`):

```json
{
  "context_servers": {
    "jenkins": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-jenkins/dist/index.js"],
      "env": {
        "JENKINS_URL": "https://your-jenkins.com",
        "JENKINS_USERNAME": "your-username",
        "JENKINS_PASSWORD": "your-api-token"
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/` with the actual path where you cloned the repo.

## Step 4: Restart Zed (10 seconds)

Close and reopen Zed editor.

## Step 5: Test (1 minute)

In Zed, open the AI assistant and try:

```
Show me all Jenkins jobs
```

The AI should respond with a list of your Jenkins jobs! 🎉

## Common First-Time Issues

### "Cannot find module"
**Problem:** Node can't find the built files.
**Solution:** Run `npm run build` again.

### "JENKINS_URL is required"
**Problem:** Environment variables not set.
**Solution:** Check your Zed settings JSON - make sure the `env` section is correct.

### "401 Unauthorized"
**Problem:** Invalid credentials.
**Solution:** 
1. Verify username/password are correct
2. Generate a new API token in Jenkins
3. Make sure you're using the token, not your password

### "Connection refused"
**Problem:** Can't reach Jenkins server.
**Solution:**
1. Verify Jenkins URL is correct (include http:// or https://)
2. Check if Jenkins is accessible from your machine
3. Check firewall settings

## Next Steps

Now that it's working, try these commands:

```
What builds are currently running?
Show me the console output for job "my-project" build #42
Trigger a build for the "deploy-staging" job
What's the status of the build queue?
```

## More Information

- **Full Documentation**: See [README.md](README.md)
- **All Available Tools**: See [USAGE.md](USAGE.md)
- **Architecture Details**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)

## Getting Help

If you're stuck:
1. Check the [USAGE.md](USAGE.md) troubleshooting section
2. Look for error messages in Zed's console
3. Open an issue on GitHub with:
   - Your Node.js version (`node --version`)
   - Your Jenkins version
   - The error message
   - Steps to reproduce

## Success? 🎉

If you got it working, consider:
- ⭐ Star the repository on GitHub
- 📝 Share your experience in an issue
- 🤝 Contribute improvements

Happy building! 🚀
