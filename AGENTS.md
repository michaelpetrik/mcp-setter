# AGENTS.md - Core System Instructions for AI Agents

This document defines the fundamental principles and architectural guidelines that all AI agents must follow when working on this codebase.

## Project Architecture Overview

This is a **modular monorepo** with:
- **One shared business logic layer** (`src/shared/` + `src/features/`)
- **Two independent frontends** (`src/app/electron/` + `src/app/cli/`)

**Critical Rule**: Business logic MUST be shared. Frontends are thin layers that consume the same use cases.

## Core Development Principles

### SOLID Principles

**Single Responsibility Principle (SRP)**
- Each class, module, and function must have ONE and only ONE reason to change
- Separate concerns: configuration parsing, service detection, installation logic, UI, etc.
- Example: `ConfigurationParser` only parses configs, `ServiceInstaller` only installs

**Open/Closed Principle (OCP)**
- Entities should be open for extension, closed for modification
- Use interfaces and abstract classes for extensibility
- New services (e.g., new AI assistant) should be added WITHOUT modifying existing code
- Use dependency injection and strategy pattern

**Liskov Substitution Principle (LSP)**
- Subtypes must be substitutable for their base types
- All `ServiceAdapter` implementations must work interchangeably
- Derived classes must not weaken base class contracts

**Interface Segregation Principle (ISP)**
- Clients should not depend on interfaces they don't use
- Split large interfaces into smaller, specific ones
- Example: `IConfigReader`, `IConfigWriter`, `IConfigValidator` instead of one `IConfigManager`

**Dependency Inversion Principle (DIP)**
- Depend on abstractions, not concretions
- High-level modules must not depend on low-level modules
- Both should depend on abstractions (interfaces)
- Use dependency injection throughout

### DRY (Don't Repeat Yourself)
- No code duplication - extract common logic into reusable utilities
- Use inheritance, composition, or mixins for shared behavior
- Configuration should be centralized
- Common validation logic must be extracted

### KISS (Keep It Simple, Stupid)
- Prefer simple solutions over complex ones
- Avoid over-engineering
- Write readable, maintainable code
- Use clear naming conventions
- Avoid premature optimization

### YAGNI (You Aren't Gonna Need It)
- Implement features only when needed, not when anticipated
- No speculative generality
- Don't build infrastructure for imagined future requirements
- Start specific, generalize only when pattern emerges multiple times

## Modular Architecture with Shared Business Logic

This project follows a **modular architecture** where business logic is completely separated from frontends:

```
┌─────────────────────────────────────────────────────┐
│              FRONTEND LAYER                         │
│  ┌──────────────────┐    ┌──────────────────┐     │
│  │  Desktop App     │    │      CLI         │     │
│  │   (Electron)     │    │  (Command-line)  │     │
│  └────────┬─────────┘    └────────┬─────────┘     │
│           │                       │                │
│           └───────────┬───────────┘                │
└───────────────────────┼────────────────────────────┘
                        │ both depend on
┌───────────────────────▼────────────────────────────┐
│           BUSINESS LOGIC LAYER (SHARED)            │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │   Features (Use Cases & Domain Logic)        │ │
│  │   - service-detection                        │ │
│  │   - mcp-installation                         │ │
│  │   - config-management                        │ │
│  └──────────────────────────────────────────────┘ │
│                     │ depends on                   │
│  ┌──────────────────▼──────────────────────────┐ │
│  │   Shared Domain & Infrastructure            │ │
│  │   - Entities (McpServer, ServiceConfig)     │ │
│  │   - Value Objects (ServiceType, OS)         │ │
│  │   - Infrastructure (FileSystem, OS detect)  │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Critical Dependency Rules**:
1. Frontends ONLY depend on business logic features
2. Frontends NEVER contain business logic
3. Business logic is 100% shared between CLI and Desktop
4. NO duplication of logic between frontends

### Layer Responsibilities

**Shared Layer** (`src/shared/`)
- Core business entities (McpServer, ServiceConfig)
- Value objects (ServiceType, OperatingSystem)
- Shared infrastructure (FileSystem, OS detection)
- NO dependencies on frontends
- Used by all features

**Features Layer** (`src/features/`)
- Business logic organized by feature
- Each feature has domain, application, infrastructure
- Use cases that orchestrate business operations
- Service adapters and implementations
- **SHARED by both CLI and Desktop frontends**
- NO presentation/UI code here

**Frontend Layer** (`src/app/`)
- **Desktop App** (`src/app/electron/`): Electron GUI
  - Main process (app lifecycle, system integration)
  - Renderer process (UI - React/Vue/vanilla)
  - Preload scripts (IPC bridge)
- **CLI** (`src/app/cli/`): Command-line interface
  - CLI commands and argument parsing
  - Terminal output formatting
- **Both frontends**:
  - Call use cases from features
  - Handle user input/output
  - NO business logic
  - NO code duplication

## Code Organization Rules

### File Naming
- PascalCase for classes: `ServiceAdapter.ts`, `ConfigurationParser.ts`
- camelCase for utilities and functions: `fileSystemUtils.ts`
- Interfaces prefixed with `I`: `IServiceAdapter.ts`, `IConfigParser.ts`
- Test files: `*.test.ts` or `*.spec.ts`

### Module Structure
```
src/
├── shared/                    # Shared across all features and frontends
│   ├── domain/
│   │   ├── entities/         # McpServer, ServiceConfig
│   │   ├── value-objects/    # ServiceType, OperatingSystem
│   │   ├── interfaces/       # Common interfaces
│   │   └── exceptions/       # Domain exceptions
│   └── infrastructure/
│       ├── file-system/      # IFileSystem, NodeFileSystem
│       └── os-detection/     # OS utilities
│
├── features/                  # Business logic (SHARED by frontends)
│   ├── service-detection/
│   │   ├── domain/           # Detection domain logic
│   │   ├── application/      # Detection use cases
│   │   └── infrastructure/   # Detection implementations
│   ├── mcp-installation/
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   └── config-management/
│       ├── domain/
│       ├── application/
│       └── infrastructure/
│
└── app/                       # Frontends (thin layers)
    ├── electron/              # Desktop GUI
    │   ├── main/             # Main process
    │   ├── renderer/         # UI (calls use cases)
    │   └── preload/          # IPC bridge
    └── cli/                   # Command-line interface
        └── commands/          # CLI commands (call use cases)
```

## Mandatory Practices

### Dependency Injection
- ALL dependencies must be injected, never instantiated inside classes
- Use constructor injection
- Define dependencies as interfaces, not concrete classes

### Error Handling
- Use custom exceptions from domain layer
- Never swallow exceptions silently
- Provide meaningful error messages
- Log errors at appropriate levels

### Testing
- Write tests BEFORE or ALONGSIDE implementation (TDD encouraged)
- Minimum 80% code coverage for business logic
- Unit tests for domain and application layers
- Integration tests for infrastructure layer
- E2E tests for critical user workflows

### Type Safety
- Use TypeScript strictly
- Enable `strict` mode in tsconfig.json
- No `any` types (use `unknown` if type is truly unknown)
- Prefer interfaces over type aliases for contracts

### Immutability
- Prefer `const` over `let`
- Use readonly properties where applicable
- Avoid mutating objects passed as parameters
- Use spread operators or libraries for object/array manipulation

## Service Adapter Pattern

Each supported service MUST implement the `IServiceAdapter` interface:

```typescript
interface IServiceAdapter {
  detect(): Promise<boolean>;
  getConfigPath(): Promise<string>;
  readConfig(): Promise<ServiceConfig>;
  mergeConfig(newMcpServer: McpServerConfig): Promise<ServiceConfig>;
  writeConfig(config: ServiceConfig): Promise<void>;
  validate(config: ServiceConfig): Promise<ValidationResult>;
  backup(): Promise<string>;
}
```

## When Adding New Features

### Adding Business Logic (Shared)
1. **Create feature** in `src/features/feature-name/`
2. **Start with Domain**: Define entities, value objects, interfaces
3. **Define Use Cases**: Create application services
4. **Implement Infrastructure**: Concrete implementations
5. **Write Tests**: Unit tests for domain/application, integration for infrastructure
6. **NO UI code**: Features have NO presentation layer

### Adding Frontend Functionality
1. **Desktop App**: Add to `src/app/electron/renderer/` or `src/app/electron/main/`
2. **CLI**: Add to `src/app/cli/commands/`
3. **Call Use Cases**: Import and use business logic from `src/features/`
4. **NO Business Logic**: Frontends only handle I/O and presentation
5. **NO Duplication**: If logic is needed in both, it goes in `src/features/`

### Update Documentation
- Keep AGENTS.md and CLAUDE.md current
- Document architectural decisions in `docs/adr/`

## Code Review Checklist

Before committing code, verify:
- [ ] Follows SOLID principles
- [ ] No code duplication (DRY)
- [ ] Simple and readable (KISS)
- [ ] Only implements what's needed (YAGNI)
- [ ] Respects layer boundaries (Clean Architecture)
- [ ] All dependencies injected
- [ ] Comprehensive error handling
- [ ] Tests written and passing
- [ ] TypeScript strict mode compliance
- [ ] No `any` types
- [ ] Meaningful names for all entities

## Prohibited Practices

### Business Logic Violations
- ❌ Business logic in frontend code (`src/app/`)
- ❌ Duplicate logic between CLI and Desktop frontends
- ❌ Direct file system access from domain/application layers
- ❌ UI/presentation code in `src/features/` or `src/shared/`

### Code Quality Violations
- ❌ Instantiating dependencies inside classes (use DI)
- ❌ Using `any` type
- ❌ Circular dependencies between modules
- ❌ Skipping tests for new features
- ❌ Committing commented-out code
- ❌ Magic numbers/strings (use constants)
- ❌ God classes (classes that do too much)

### Architecture Violations
- ❌ Frontend depending directly on infrastructure implementations
- ❌ Features depending on frontend code
- ❌ Shared code depending on features

## Architecture Decision Records

When making significant architectural decisions, document them in `/docs/adr/` following the ADR template.

---

**Remember**: These principles exist to create maintainable, testable, and scalable software. When in doubt, favor simplicity and adherence to these core principles.
