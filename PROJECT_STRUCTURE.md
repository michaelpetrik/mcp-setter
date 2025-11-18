# Project Structure

This document provides a complete overview of the MCP Setter project structure.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                 FRONTENDS (Thin)                    │
│                                                     │
│  ┌────────────────────┐  ┌────────────────────┐   │
│  │   Desktop App      │  │       CLI          │   │
│  │   (Electron)       │  │  (Command-line)    │   │
│  │                    │  │                    │   │
│  │  - GUI             │  │  - Commands        │   │
│  │  - User interaction│  │  - Terminal I/O    │   │
│  └─────────┬──────────┘  └─────────┬──────────┘   │
└────────────┼──────────────────────┼────────────────┘
             │                      │
             └──────────┬───────────┘
                        │ Both call same use cases
┌───────────────────────▼────────────────────────────┐
│         BUSINESS LOGIC (Shared, Reusable)          │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │             Features                         │ │
│  │  ┌────────────────────────────────────────┐ │ │
│  │  │  service-detection                     │ │ │
│  │  │  - Domain, Application, Infrastructure │ │ │
│  │  └────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────┐ │ │
│  │  │  mcp-installation                      │ │ │
│  │  │  - Domain, Application, Infrastructure │ │ │
│  │  └────────────────────────────────────────┘ │ │
│  │  ┌────────────────────────────────────────┐ │ │
│  │  │  config-management                     │ │ │
│  │  │  - Domain, Application, Infrastructure │ │ │
│  │  └────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────┘ │
│                        │ depends on                │
│  ┌──────────────────────▼──────────────────────┐ │
│  │         Shared Domain & Infrastructure       │ │
│  │  - McpServer, ServiceConfig (entities)       │ │
│  │  - ServiceType, OperatingSystem (VOs)        │ │
│  │  - FileSystem, OS detection                  │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Directory Structure

```
mcp-setter/
│
├── src/                          # Source code
│   ├── shared/                   # Shared across all features
│   │   ├── domain/
│   │   │   ├── entities/         # McpServer.ts, ServiceConfig.ts
│   │   │   ├── value-objects/    # ServiceType.ts, OperatingSystem.ts
│   │   │   ├── interfaces/       # Common interfaces
│   │   │   └── exceptions/       # Domain exceptions
│   │   └── infrastructure/
│   │       ├── file-system/      # IFileSystem.ts, NodeFileSystem.ts
│   │       └── os-detection/     # OS utilities
│   │
│   ├── features/                 # Business logic (SHARED by frontends)
│   │   ├── service-detection/    # Detect AI services
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── mcp-installation/     # Install MCP servers
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   └── config-management/    # Manage configurations
│   │       ├── domain/
│   │       ├── application/
│   │       └── infrastructure/
│   │
│   └── app/                      # Frontend implementations
│       ├── electron/             # Desktop GUI
│       │   ├── main/             # Main process
│       │   ├── renderer/         # UI
│       │   └── preload/          # IPC bridge
│       └── cli/                  # Command-line interface
│           ├── commands/         # CLI commands
│           └── utils/            # CLI utilities
│
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   │   ├── shared/
│   │   └── features/
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
│
├── docs/                         # Documentation
│   └── adr/                      # Architecture Decision Records
│       ├── 000-adr-template.md
│       ├── 001-technology-stack.md
│       ├── 002-feature-based-clean-architecture.md
│       └── 003-modular-architecture-shared-logic.md
│
├── scripts/                      # Utility scripts
│   ├── setup-env.sh
│   └── install-env-globally.sh
│
├── build/                        # Build assets (icons, etc.)
│
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
│
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript config (base)
├── tsconfig.node.json            # TypeScript config (Node/CLI)
├── tsconfig.electron.json        # TypeScript config (Electron)
│
├── vite.config.ts                # Vite configuration
├── vitest.config.ts              # Vitest configuration
├── playwright.config.ts          # Playwright configuration
│
├── .eslintrc.json                # ESLint rules (enforces SOLID)
├── .prettierrc.json              # Prettier configuration
│
├── AGENTS.md                     # AI agent development guidelines
├── ARCHITECTURE.md               # Architecture documentation
├── CLAUDE.md                     # Claude Code guidance
├── README.md                     # Project overview
└── PROJECT_STRUCTURE.md          # This file
```

## Key Principles

### 1. Shared Business Logic
- All business logic lives in `src/shared/` and `src/features/`
- Used by BOTH Desktop and CLI frontends
- Zero duplication between frontends

### 2. Thin Frontends
- Frontends in `src/app/` are thin layers
- Only handle user I/O and presentation
- Call use cases from `src/features/`
- NO business logic in frontends

### 3. Dependency Direction
```
Frontend (Desktop/CLI)
    ↓ depends on
Features (Business Logic)
    ↓ depends on
Shared (Domain & Infrastructure)
```

### 4. Clean Architecture per Feature
Each feature follows Clean Architecture internally:
```
feature-name/
├── domain/          # Entities, VOs, interfaces, business rules
├── application/     # Use cases, orchestration
└── infrastructure/  # Implementations, adapters
```

## Development Workflow

### Adding Business Logic
1. Add to `src/features/feature-name/`
2. Create domain, application, infrastructure
3. Use cases are automatically available to both frontends

### Adding Frontend Features
**Desktop App**:
- Add to `src/app/electron/`
- Call use cases
- Format for GUI

**CLI**:
- Add to `src/app/cli/`
- Call use cases
- Format for terminal

### Running the Project
```bash
# Development
npm run dev:electron    # Desktop app
npm run dev:cli         # CLI

# Building
npm run build:core      # Business logic
npm run build:electron  # Desktop app
npm run build:cli       # CLI
npm run build:all       # Everything

# Testing
npm test                # All tests
npm run test:coverage   # With coverage
```

## File Naming Conventions

- **Classes**: PascalCase (`McpServer.ts`, `InstallUseCase.ts`)
- **Interfaces**: PascalCase with `I` prefix (`IServiceAdapter.ts`)
- **Utils**: camelCase (`fileSystemUtils.ts`)
- **Tests**: `*.test.ts` or `*.spec.ts`

## Import Aliases

```typescript
import { McpServer } from '@shared/domain/entities/McpServer';
import { InstallUseCase } from '@features/mcp-installation/application/InstallUseCase';
import { ElectronMain } from '@app/electron/main/main';
```

## Testing Strategy

- **Unit Tests**: Domain and application layers (100% goal)
- **Integration Tests**: Infrastructure layer (>90%)
- **E2E Tests**: Critical workflows
- Minimum 80% coverage requirement

## Documentation

- **AGENTS.md**: Development principles (SOLID, DRY, KISS, YAGNI)
- **ARCHITECTURE.md**: Detailed architecture
- **CLAUDE.md**: Claude Code guidance
- **docs/adr/**: Architecture decisions
- **README.md**: Getting started

---

For questions or clarifications, refer to the documentation files listed above.
