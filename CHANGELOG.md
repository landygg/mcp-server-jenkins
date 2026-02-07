# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0](https://github.com/landygg/mcp-server-jenkins/compare/v0.1.0...v0.2.0) (2026-02-07)


### Features

* add automated release process with Release Please and update changelog ([f410c90](https://github.com/landygg/mcp-server-jenkins/commit/f410c90deca54902cff253e2d48266b34f3bddbc))
* add automated release process with Release Please and update changelog ([c4833b3](https://github.com/landygg/mcp-server-jenkins/commit/c4833b38a1e063fd091611bc66cec983b80a9b44))
* **client:** Add Jenkins HTTP client and APIs ([7ef2c81](https://github.com/landygg/mcp-server-jenkins/commit/7ef2c81c4804fc11ebbd2bc0c20b18ea8f718bc1))
* **jenkins:** add list-jobs CLI and docs ([c68e6b5](https://github.com/landygg/mcp-server-jenkins/commit/c68e6b559f225a74d704357ce9bc358c92f227a1))


### Bug Fixes

* clarify commit message prefixes for release triggering ([a2a5389](https://github.com/landygg/mcp-server-jenkins/commit/a2a53898ddccac060728ce63f3cca00cea09221f))
* **paths:** ensure withParameters parameter is explicitly typed in buildTriggerPath function ([910c998](https://github.com/landygg/mcp-server-jenkins/commit/910c9983034a5ec544b8be6001264d7a556a427a))
* remove unnecessary blank line and ensure config parameters are included in release job ([4068862](https://github.com/landygg/mcp-server-jenkins/commit/4068862ae467a06840685371219b64384b77fb36))

## [0.1.0] - 2026-02-07

### Added

- Initial release of MCP Server for Jenkins
- Complete Jenkins API coverage for jobs, builds, nodes, and queue items
- Secure credential management via environment variables
- Build monitoring and console log retrieval
- Job control with parameter support
- Advanced querying capabilities filtered by name, status, and type
- AI-ready design for autonomous use by Zed's AI assistant
- Support for Node.js 18+ and Bun 1.0+

### Features

- 🔧 Complete Jenkins API Coverage
- 🔐 Secure Credential Management
- 📊 Build Monitoring
- 🚀 Job Control
- 🔍 Advanced Querying
- 🤖 AI-Ready architecture
