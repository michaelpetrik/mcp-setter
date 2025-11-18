# Architecture Documentation

## Technology Stack

### Core Technologies
- **Language**: TypeScript 5.x (strict mode)
- **Runtime**: Node.js 18+ LTS
- **Desktop Framework**: Electron 28+ (production-grade, cross-platform)
- **Build Tool**: Vite 5.x (fast HMR, optimized builds)
- **Package Manager**: npm or pnpm

### Development Tools
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Type Checking**: TypeScript compiler (tsc)

### Key Libraries
- **Dependency Injection**: tsyringe
- **Validation**: Zod (runtime type validation)
- **File System**: fs-extra (enhanced fs operations)
- **Path Handling**: node:path (cross-platform)
- **OS Detection**: node:os, node:process

## Feature-Based Architecture

### Overview

This project uses a **feature-based (vertical slice)** architecture that organizes code by features rather than technical layers. Each feature contains its own domain, application, infrastructure, and presentation code.

```
src/
├── shared/              # Shared code across features
│   ├── domain/          # Shared entities, value objects
│   ├── infrastructure/  # Shared file system, OS utilities
│   └── utils/           # Pure utility functions
│
├── features/            # Features as vertical slices
│   ├── service-detection/     # Detect installed services
│   ├── mcp-installation/      # Install MCP servers
│   └── config-management/     # Manage configurations
│
└── app/                 # Application entry points
    ├── electron/        # Electron app
    └── cli/             # CLI interface
```

### Why Feature-Based?

**Benefits over layered architecture:**
- **Higher Cohesion**: Related code stays together
- **Better Discoverability**: All code for a feature in one place
- **Easier Scaling**: Add features without affecting others
- **Team Productivity**: Teams can work on features independently
- **SOLID Compliance**: Still follows all SOLID principles

### Feature Structure

Each feature follows Clean Architecture internally:

```
feature-name/
├── domain/              # Business logic and rules
│   ├── entities/        # Domain entities
│   ├── value-objects/   # Immutable value objects
│   └── interfaces/      # Abstractions (DIP)
├── application/         # Use cases
│   └── use-cases/       # Application workflows
├── infrastructure/      # Implementations
│   └── adapters/        # Concrete implementations
└── presentation/        # UI components
    └── components/      # Feature UI
```

## Domain Model

### Core Entities

**McpServer**
- Represents an MCP server configuration
- Properties: name, command, args, env, disabled
- Validation rules for valid MCP server structure

**ServiceConfig**
- Represents the complete configuration for a service
- Contains mcpServers map and service-specific settings
- Immutable once created

### Value Objects

**ServiceType**
- Enum: ClaudeDesktop, Codex, Gemini, etc.
- Includes validation logic

**ConfigPath**
- Encapsulates file path with validation
- OS-specific path resolution

**OperatingSystem**
- Enum: Windows, macOS, Linux
- Platform-specific behavior

## Use Cases

### Primary Use Cases

1. **InstallMcpServerUseCase**
   - Input: MCP server config snippet, target service(s)
   - Process: Detect service → Read config → Merge → Validate → Backup → Write
   - Output: Installation result with status

2. **DetectServicesUseCase**
   - Input: None or specific service type
   - Process: Check for installed services on system
   - Output: List of detected services with paths

3. **ValidateConfigUseCase**
   - Input: Service config and MCP server config
   - Process: Run validation rules
   - Output: Validation result with errors/warnings

4. **BackupConfigUseCase**
   - Input: Service type
   - Process: Create timestamped backup of current config
   - Output: Backup file path

## Service Adapter Pattern

Each supported service implements `IServiceAdapter`:

```typescript
interface IServiceAdapter {
  readonly serviceType: ServiceType;

  // Detection
  detect(): Promise<boolean>;
  getConfigPath(): Promise<string>;

  // Configuration Management
  readConfig(): Promise<ServiceConfig>;
  mergeConfig(existing: ServiceConfig, newServer: McpServer): ServiceConfig;
  writeConfig(config: ServiceConfig): Promise<void>;

  // Validation
  validate(config: ServiceConfig): Promise<ValidationResult>;

  // Backup
  backup(): Promise<string>;
}
```

### Supported Services

**Phase 1** (Initial Release):
- Claude Desktop (macOS, Windows, Linux)

**Phase 2** (Future):
- Codex
- Gemini
- Other AI assistants as needed (YAGNI)

## Cross-Platform Strategy

### Operating System Detection
- Use Node.js `process.platform` for OS detection
- Abstract OS-specific code behind interfaces
- Test on all target platforms

### Configuration Paths
- **macOS**: `~/Library/Application Support/{service}/`
- **Windows**: `%APPDATA%/{service}/`
- **Linux**: `~/.config/{service}/`

### File System Operations
- Use `path.join()` for cross-platform paths
- Handle different line endings (CRLF vs LF)
- Respect OS-specific permissions

## Dependency Injection

### Container Setup
Using tsyringe for DI:

```typescript
// Container registration
container.register<IServiceAdapter>("ClaudeDesktopAdapter", {
  useClass: ClaudeDesktopAdapter
});

container.register<IFileSystem>("FileSystem", {
  useClass: NodeFileSystem
});

// Usage in use case
class InstallMcpServerUseCase {
  constructor(
    @inject("IServiceAdapter") private serviceAdapter: IServiceAdapter,
    @inject("IFileSystem") private fileSystem: IFileSystem
  ) {}
}
```

## Error Handling Strategy

### Exception Hierarchy

```
DomainException (base)
├── ServiceNotFoundException
├── ConfigurationException
│   ├── InvalidConfigFormatException
│   └── ConfigValidationException
├── FileSystemException
│   ├── FileNotFoundException
│   └── PermissionDeniedException
└── InstallationException
```

### Error Recovery
- Always backup before writing
- Rollback on error
- Provide clear error messages
- Log errors with context

## Testing Strategy

### Unit Tests
- Domain entities: 100% coverage
- Value objects: 100% coverage
- Use cases: >90% coverage
- Utilities: >90% coverage

### Integration Tests
- Service adapters with mock file system
- Use case workflows
- Configuration parsing and validation

### E2E Tests
- Full installation workflow
- Multi-service installation
- Error scenarios and rollback
- Cross-platform compatibility

### Test Structure
```
tests/
├── unit/
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── integration/
│   ├── use-cases/
│   └── adapters/
└── e2e/
    └── workflows/
```

## Build and Distribution

### Development Build
- Vite dev server for fast iteration
- Hot module replacement (HMR)
- Source maps enabled

### Production Build
- Electron Builder for packaging
- Code minification
- Tree shaking
- Platform-specific installers (DMG, EXE, AppImage)

### Distribution Channels
- GitHub Releases
- Auto-update mechanism (electron-updater)

## Security Considerations

- Validate all user inputs
- Sanitize file paths to prevent directory traversal
- No execution of arbitrary code from configs
- Secure storage of sensitive configuration
- Code signing for distribution

## Performance Targets

- Startup time: < 2 seconds
- Service detection: < 500ms
- Config read/parse: < 100ms
- Config write: < 200ms
- Installation workflow: < 2 seconds (excluding backups)

## Future Extensibility

Design allows for:
- Adding new services without modifying existing code (OCP)
- Plugin system for community-contributed adapters
- Remote MCP server registry
- Batch installations
- Config templates

## Monitoring and Logging

- Structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Separate logs for main and renderer processes
- Log rotation for long-running applications

---

For detailed architectural decisions, see `/docs/adr/` directory.
