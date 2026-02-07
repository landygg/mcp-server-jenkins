# Test Plan

## Manual Testing Steps

### 1. Installation Test
- [x] Install dependencies: `npm install`
- [x] Build project: `npm run build`
- [x] Verify dist/ directory is created
- [x] Verify all source files are compiled

### 2. Server Startup Test
- [x] Start server with minimal config: `JENKINS_URL=http://localhost node dist/index.js`
- [x] Verify server starts without errors
- [x] Verify server logs show connection info

### 3. Tool Definition Test
- [ ] Verify all 15 tools are registered
- [ ] Verify tool schemas are valid
- [ ] Verify tool names match expected values

### 4. Jenkins Integration Test (Requires real Jenkins)
- [ ] Configure real Jenkins credentials
- [ ] Test get_all_items
- [ ] Test get_item with valid job name
- [ ] Test query_items with filters
- [ ] Test get_running_builds
- [ ] Test build_item (in read-only mode first)

### 5. Zed Integration Test (Requires Zed)
- [ ] Configure extension in Zed settings
- [ ] Restart Zed
- [ ] Ask AI to list tools
- [ ] Ask AI to query Jenkins
- [ ] Verify responses are formatted correctly

## Automated Tests (Future)

```bash
# Unit tests for Jenkins client
npm test -- client

# Integration tests (mock Jenkins API)
npm test -- integration

# Tool schema validation
npm test -- tools
```

## Known Limitations

1. **No mock testing yet**: Tests require a real Jenkins instance
2. **No CI/CD pipeline**: GitHub Actions not configured yet
3. **No coverage reports**: Test coverage tracking not implemented

## Test Results

### Build Test: ✅ PASSED
- TypeScript compilation successful
- No type errors
- All modules compiled correctly

### Startup Test: ✅ PASSED
- Server starts successfully
- Logs show correct initialization
- Process doesn't crash on startup

### Integration Test: ⏸️ PENDING
- Requires Jenkins instance for testing
- Manual testing required

## Security Checklist

- [x] No credentials in source code
- [x] Environment variables used for config
- [x] SSL verification enabled by default
- [x] Sensitive data not logged
- [x] .gitignore includes .env files
