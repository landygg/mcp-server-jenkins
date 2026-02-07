# Contributing to MCP Server Jenkins

Thank you for your interest in contributing to the Jenkins MCP Server for Zed!

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/landygg/mcp-server-jenkins.git
   cd mcp-server-jenkins
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Development Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Jenkins credentials
   ```

4. **Build and Run**
   ```bash
   npm run build
   JENKINS_URL=http://localhost:8080 node dist/index.js
   ```

## Project Structure

```
mcp-server-jenkins/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── client/
│   │   └── jenkins.ts     # Jenkins API client
│   ├── types/
│   │   └── jenkins.ts     # Type definitions
│   └── tools/
│       └── index.ts       # Tool definitions
├── extension.toml         # Zed extension manifest
├── package.json
├── tsconfig.json
└── README.md
```

## Development Workflow

### Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, typed TypeScript code
   - Follow existing code style
   - Add JSDoc comments for public APIs

3. **Build and Test**
   ```bash
   npm run build
   npm run check
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `refactor:` for code refactoring
   - `test:` for test additions/changes
   - `chore:` for maintenance tasks

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting & Linting**: Biome (2 spaces, single quotes)
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces

### Adding New Tools

To add a new Jenkins tool:

1. **Add to tools/index.ts**
   ```typescript
   {
     name: 'new_tool_name',
     description: 'What this tool does',
     inputSchema: {
       type: 'object',
       properties: {
         param1: {
           type: 'string',
           description: 'Parameter description',
         },
       },
       required: ['param1'],
     },
   }
   ```

2. **Add Handler**
   ```typescript
   case 'new_tool_name':
     return await client.newMethod(args.param1);
   ```

3. **Add Client Method** (if needed)
   ```typescript
   async newMethod(param1: string): Promise<SomeType> {
     const response = await this.client.get(`/api/endpoint/${param1}`);
     return response.data;
   }
   ```

4. **Update README** with tool documentation

### Testing

Currently, testing requires a real Jenkins instance:

1. Set up a test Jenkins server
2. Configure credentials in `.env`
3. Run manual tests
4. Verify all tools work as expected

Future: We plan to add automated tests with mocked Jenkins API.

## Pull Request Guidelines

### Before Submitting

- [ ] Code builds successfully (`npm run build`)
- [ ] No linting/formatting errors (`npm run check`)
- [ ] README updated if adding features
- [ ] Tested with real Jenkins instance
- [ ] No credentials in code

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Code builds
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Tested with Jenkins
```

## Reporting Issues

### Bug Reports

Include:
- MCP Server version
- Node.js version
- Jenkins version
- Error messages
- Steps to reproduce

### Feature Requests

Include:
- Use case description
- Expected behavior
- Why this would be useful

## Releases

This project uses automated releases powered by [Release Please](https://github.com/googleapis/release-please).

### How It Works

1. **Commit with Conventional Commits**: When you merge PRs with properly formatted commit messages, Release Please automatically:
   - Analyzes commits since the last release
   - Determines the next version number based on semantic versioning
   - Updates CHANGELOG.md with categorized changes
   - Creates/updates a Release PR

2. **Review the Release PR**: A bot will create or update a "chore(main): release X.X.X" pull request that includes:
   - Updated version in `package.json`
   - Updated version in `extension.toml`
   - Updated `CHANGELOG.md` with all changes since last release

3. **Merge to Release**: When the Release PR is merged:
   - A GitHub Release is created automatically
   - The release is tagged
   - If `NPM_TOKEN` is configured, the package is published to npm

### Version Bumping Rules

Release Please determines version bumps based on commit prefixes:

- `fix:` → Patch release (0.0.x)
- `feat:` → Minor release (0.x.0)
- `feat!:` or `BREAKING CHANGE:` → Major release (x.0.0)
- `docs:`, `chore:`, etc. → Included in release notes but don't trigger releases alone

### Commit Message Examples

**Feature (minor version bump):**
```bash
feat: add support for Jenkins folder operations
```

**Bug fix (patch version bump):**
```bash
fix: resolve timeout issue when fetching large console logs
```

**Breaking change (major version bump):**
```bash
feat!: change tool parameter format for consistency

BREAKING CHANGE: The `job_name` parameter has been renamed to `jobName` for consistency with other tools.
```

**Multiple changes in one commit:**
```bash
feat: add queue management tools

This commit adds several new tools for managing the Jenkins queue.

fix(client): improve error handling for network timeouts
feat(queue): add ability to cancel queued items
```

### Force a Specific Version

To release a specific version (bypass automatic versioning):

```bash
git commit --allow-empty -m "chore: release 2.0.0" -m "Release-As: 2.0.0"
```

### Checking Release Status

- **Pending Release PR**: Look for PRs labeled `autorelease: pending`
- **Released**: Check the [Releases page](https://github.com/landygg/mcp-server-jenkins/releases)
- **CHANGELOG**: View [CHANGELOG.md](CHANGELOG.md) for version history

## Questions?

- Open an issue for questions
- Check existing issues first
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
