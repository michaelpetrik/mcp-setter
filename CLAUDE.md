# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MCP Setter** is a production-grade, **modular application** for installing and managing MCP (Model Context Protocol) servers across different AI services and operating systems.

### Modular Architecture

This is a **modular monorepo** with:
- **One shared business logic layer** - All core domain, use cases, and infrastructure
- **Two independent frontends**:
  - **Desktop App** (Electron) - Cross-platform GUI for Windows, macOS, Linux
  - **CLI** - Command-line interface for automation and scripting

Both frontends consume the **exact same business logic**, ensuring consistency, maintainability, and DRY principles.

## Technology Stack

- **Language**: TypeScript 5.x (strict mode enabled)
- **Runtime**: Node.js 18+ LTS
- **Desktop Framework**: Electron 28+
- **Build Tool**: Vite 5.x
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **DI Container**: tsyringe
- **Validation**: Zod

## Architecture

This project uses a **modular architecture** with shared business logic and multiple frontends:

```
src/
├── shared/              # Shared domain models and infrastructure
│   ├── domain/          # Core entities (McpServer, ServiceType, etc.)
│   └── infrastructure/  # File system, OS detection, utilities
│
├── features/            # Business logic features (SHARED by all frontends)
│   ├── service-detection/      # Detect installed AI services
│   │   ├── domain/             # Service detection domain logic
│   │   ├── application/        # Service detection use cases
│   │   └── infrastructure/     # Detection implementations
│   ├── mcp-installation/       # Install MCP servers
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   └── config-management/      # Manage configurations
│       ├── domain/
│       ├── application/
│       └── infrastructure/
│
└── app/                 # Frontend implementations (thin layers)
    ├── electron/        # Desktop GUI (Electron)
    │   ├── main/        # Main process
    │   ├── renderer/    # UI (React/Vue/vanilla)
    │   └── preload/     # Bridge between main/renderer
    └── cli/             # Command-line interface
        └── commands/    # CLI command implementations
```

### Key Architectural Principles

1. **Business Logic Independence**: All business logic lives in `shared/` and `features/`
2. **Frontend as Thin Layer**: Frontends (`app/`) only handle user interaction and presentation
3. **No Duplication**: CLI and Desktop app use the SAME use cases and domain logic
4. **Dependency Direction**: Frontends depend on features, features depend on shared

**Key Architectural Documents**:
- `AGENTS.md` - Core development principles (SOLID, DRY, KISS, YAGNI)
- `ARCHITECTURE.md` - Detailed architecture documentation
- `src/README.md` - Source code structure
- `docs/adr/` - Architecture Decision Records

## Common Commands

### Development
```bash
npm install              # Install dependencies

# Frontend-specific development
npm run dev:electron     # Run Desktop App in dev mode
npm run dev:cli          # Run CLI in dev mode

# Code quality
npm run type-check       # TypeScript type checking
npm run lint             # Lint code
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage (min 80%)
npm run test:e2e         # Run E2E tests
```

### Building
```bash
# Build business logic (core)
npm run build:core       # Build shared business logic

# Build frontends
npm run build:electron   # Build Desktop App
npm run build:cli        # Build CLI

# Package Desktop App
npm run package:mac      # Package for macOS
npm run package:win      # Package for Windows
npm run package:linux    # Package for Linux

# Build everything
npm run build:all        # Build all: core + electron + cli
```

## Development Principles (CRITICAL)

All code MUST comply with:

### SOLID Principles
- **Single Responsibility**: Each class/module has ONE reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Small, focused interfaces
- **Dependency Inversion**: Depend on abstractions, inject dependencies

### Other Principles
- **DRY**: No code duplication
- **KISS**: Keep solutions simple
- **YAGNI**: Don't build features until needed

See `AGENTS.md` for complete guidelines.

## Modular Architecture Rules

### Adding Business Logic Features
1. Create feature in `src/features/feature-name/`
2. Add README.md explaining the feature
3. Create domain, application, infrastructure subdirectories (NO presentation here)
4. Define public interfaces in domain layer
5. Implement using dependency injection
6. Write tests (minimum 80% coverage)
7. Features are consumed by BOTH frontends

### Adding Frontend Features
1. Desktop App: Add to `src/app/electron/`
2. CLI: Add to `src/app/cli/`
3. Frontends only call use cases from `src/features/`
4. NO business logic in frontend code

### Dependency Rules
- **Frontends** → depend on → **Features** → depend on → **Shared**
- Frontends MUST NOT contain business logic
- Frontends MUST NOT duplicate logic between CLI and Desktop
- All business logic MUST be in `shared/` or `features/`

### File Organization

**Business Logic Feature:**
```
src/features/feature-name/
├── domain/              # Business rules, entities, interfaces
├── application/         # Use cases (consumed by frontends)
└── infrastructure/      # Concrete implementations
```

**Desktop Frontend:**
```
src/app/electron/
├── main/                # Electron main process
├── renderer/            # UI (calls use cases)
└── preload/             # IPC bridge
```

**CLI Frontend:**
```
src/app/cli/
└── commands/            # CLI commands (call use cases)
```

## TypeScript Configuration

- **Strict mode enabled**: No `any` types allowed (use `unknown`)
- **Path aliases**:
  - `@/*` → `src/*`
  - `@shared/*` → `src/shared/*`
  - `@features/*` → `src/features/*`
  - `@app/*` → `src/app/*`

## Testing Requirements

- **Unit tests**: Domain and application layers (100% coverage goal)
- **Integration tests**: Infrastructure layer (>90% coverage)
- **E2E tests**: Critical user workflows
- Test files: `*.test.ts` or `*.spec.ts`
- Setup: `tests/setup.ts` (auto-loaded)

## Code Style

- **Interfaces**: Prefixed with `I` (e.g., `IServiceAdapter`)
- **Classes**: PascalCase (e.g., `McpServer`)
- **Files**: PascalCase for classes, camelCase for utils
- **Imports**: Organized by ESLint rules (builtin → external → internal)
- **Access modifiers**: Explicit (private/public/protected)

## MCP Server Configuration

### Claude Desktop Config Location
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Config Format
```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

## Environment Variables

- Stored in `.env` (gitignored)
- Template in `.env.example`
- Load globally: `./scripts/install-env-globally.sh`
- Required vars: `CONTEXT7_API_KEY`, `GITHUB_MCP_PAT`, `N8N_API_KEY`, `N8N_API_URL`

## Dependency Injection

Using tsyringe:

```typescript
import { injectable, inject, container } from 'tsyringe';

@injectable()
class MyService {
  constructor(
    @inject('IFileSystem') private fileSystem: IFileSystem
  ) {}
}

// Register in DI container
container.register<IFileSystem>('IFileSystem', {
  useClass: NodeFileSystem
});
```

## Error Handling

- Use custom domain exceptions
- Never swallow exceptions silently
- Always backup before writing configs
- Implement rollback on errors
- Provide meaningful error messages

## Common Patterns

### Service Adapter Pattern
All service implementations must implement `IServiceAdapter`:
```typescript
interface IServiceAdapter {
  detect(): Promise<boolean>;
  getConfigPath(): Promise<string>;
  readConfig(): Promise<ServiceConfig>;
  mergeConfig(existing: ServiceConfig, newServer: McpServer): ServiceConfig;
  writeConfig(config: ServiceConfig): Promise<void>;
  validate(config: ServiceConfig): Promise<ValidationResult>;
  backup(): Promise<string>;
}
```

### Use Case Pattern
```typescript
@injectable()
class MyUseCase {
  constructor(
    @inject('IServiceAdapter') private adapter: IServiceAdapter
  ) {}

  async execute(input: InputDTO): Promise<OutputDTO> {
    // Use case logic
  }
}
```

## Prohibited Practices

- ❌ Using `any` type
- ❌ Instantiating dependencies inside classes
- ❌ Business logic in presentation layer
- ❌ UI code in domain/application layers
- ❌ Direct file system access from domain/application
- ❌ Circular dependencies
- ❌ Skipping tests
- ❌ Committing `.env` file

## Git Workflow

- Follow conventional commits
- Run `npm run lint` before committing
- Run `npm test` before pushing
- Ensure type checking passes
- Update documentation when needed

## References

- Architecture: `ARCHITECTURE.md`
- Development Guidelines: `AGENTS.md`
- ADRs: `docs/adr/`
- Source Structure: `src/README.md`
