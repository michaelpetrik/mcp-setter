# MCP Setter

A production-grade, modular application for installing and managing MCP (Model Context Protocol) servers across different AI services and operating systems.

## Architecture Overview

This is a **modular monorepo** with:
- **One shared business logic layer** - Core domain, use cases, and infrastructure
- **Two independent frontends**:
  - 🖥️ **Desktop App** (Electron) - Cross-platform GUI
  - ⌨️ **CLI** - Command-line interface

Both frontends consume the same business logic, ensuring consistency and maintainability.

## Features

- 🖥️ Cross-platform support (Windows, macOS, Linux)
- 🤖 Supports multiple AI services (Claude Desktop, and more coming soon)
- 🔒 Secure configuration management
- 📦 Easy installation workflow
- 🔄 Automatic configuration backup and rollback
- ✅ Configuration validation
- 🎯 Built with Clean Architecture and SOLID principles
- 📱 Multiple interfaces (Desktop GUI + CLI) sharing the same core logic

## Technology Stack

- **TypeScript 5.x** - Type-safe development
- **Electron 28+** - Cross-platform desktop framework
- **Vite 5.x** - Fast build tool with HMR
- **Vitest** - Unit and integration testing
- **Playwright** - End-to-end testing
- **Zod** - Runtime validation
- **tsyringe** - Dependency injection

## Architecture

This project follows a **modular architecture** with shared business logic and multiple frontends:

```
src/
├── shared/              # Shared domain models and infrastructure
│   ├── domain/          # Core entities, value objects
│   └── infrastructure/  # File system, OS detection, etc.
│
├── features/            # Business logic features (shared by all frontends)
│   ├── service-detection/
│   ├── mcp-installation/
│   └── config-management/
│
└── app/                 # Frontend implementations
    ├── electron/        # Desktop GUI (Electron)
    │   ├── main/        # Electron main process
    │   ├── renderer/    # Electron renderer (UI)
    │   └── preload/     # Preload scripts
    └── cli/             # Command-line interface
```

**Key principle**: Business logic is completely independent of the frontends. Both CLI and Desktop app consume the same use cases and domain logic.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Development Principles

This project strictly adheres to:
- **SOLID** - Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **DRY** - Don't Repeat Yourself
- **KISS** - Keep It Simple, Stupid
- **YAGNI** - You Aren't Gonna Need It

See [AGENTS.md](./AGENTS.md) for detailed development guidelines.

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- npm 9+ or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Install environment variables globally (for Claude Desktop)
./scripts/install-env-globally.sh
```

### Development

```bash
# Development - Desktop App
npm run dev:electron     # Run Electron app in dev mode

# Development - CLI
npm run dev:cli          # Run CLI in dev mode (when implemented)

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Building

```bash
# Build business logic (shared)
npm run build:core

# Build Desktop App
npm run build:electron
npm run package:mac        # macOS
npm run package:win        # Windows
npm run package:linux      # Linux

# Build CLI
npm run build:cli

# Build everything
npm run build:all
```

## Project Structure

```
mcp-setter/
├── src/                      # Source code
│   ├── shared/               # Shared domain and infrastructure
│   ├── features/             # Feature modules
│   └── app/                  # Application entry points
├── tests/                    # Tests
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                  # End-to-end tests
├── docs/                     # Documentation
│   └── adr/                  # Architecture Decision Records
├── scripts/                  # Utility scripts
├── build/                    # Build assets (icons, etc.)
├── AGENTS.md                 # AI agent development guidelines
├── ARCHITECTURE.md           # Architecture documentation
├── CLAUDE.md                 # Claude Code guidance
└── package.json              # Project dependencies and scripts
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
CONTEXT7_API_KEY=your_key_here
GITHUB_MCP_PAT=your_token_here
N8N_API_KEY=your_key_here
N8N_API_URL=your_url_here
```

**Security Note**: Never commit `.env` to version control.

## Contributing

This project follows strict coding standards:

1. Read [AGENTS.md](./AGENTS.md) for development principles
2. Follow the feature-based architecture in [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Write tests for all new features (minimum 80% coverage)
4. Ensure all linting and type checking passes
5. Follow conventional commits

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Guidance for Claude Code AI
- [AGENTS.md](./AGENTS.md) - Core development principles and guidelines
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation
- [src/README.md](./src/README.md) - Source code structure
- [docs/adr/](./docs/adr/) - Architecture Decision Records

## License

MIT

## Support

For issues and feature requests, please use the GitHub issue tracker.
