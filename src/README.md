# Source Code Structure

This project follows a **feature-based (vertical slice) architecture** that complies with Clean Architecture principles while organizing code by features rather than layers.

## Directory Structure

```
src/
├── shared/              # Shared code used across features
│   ├── domain/          # Shared domain entities, value objects, interfaces
│   ├── infrastructure/  # Shared infrastructure implementations
│   └── utils/           # Shared utilities
│
├── features/            # Features organized as vertical slices
│   ├── service-detection/     # Detect installed AI services
│   ├── mcp-installation/      # Install MCP servers
│   └── config-management/     # Manage configuration files
│
└── app/                 # Application entry points
    ├── electron/        # Electron main/renderer processes
    └── cli/             # CLI interface
```

## Feature-Based Architecture

### Why Feature-Based?

**Benefits:**
- **Cohesion**: All code for a feature is located together
- **Independence**: Features are loosely coupled and can be developed independently
- **Discoverability**: Easy to find all code related to a specific feature
- **Scalability**: Easy to add new features without affecting existing ones
- **Team Productivity**: Different teams can work on different features simultaneously

### Feature Structure

Each feature follows Clean Architecture internally:

```
feature-name/
├── domain/              # Feature-specific business logic
│   ├── entities/
│   ├── value-objects/
│   └── interfaces/
├── application/         # Feature use cases
│   └── use-cases/
├── infrastructure/      # Feature implementations
│   └── adapters/
└── presentation/        # Feature UI components
    └── components/
```

### Feature Communication

Features communicate through:
1. **Shared domain models** (`src/shared/domain/`)
2. **Well-defined interfaces** (Dependency Inversion)
3. **Use case composition** (Application layer)

```typescript
// ✅ CORRECT: Feature uses shared domain and other feature's interface
import { McpServer } from '@/shared/domain/entities/McpServer';
import { IServiceDetector } from '@/features/service-detection/domain/IServiceDetector';

class InstallMcpServerUseCase {
  constructor(private detector: IServiceDetector) {}
}

// ❌ INCORRECT: Direct dependency on another feature's implementation
import { ClaudeDesktopDetector } from '@/features/service-detection/infrastructure/ClaudeDesktopDetector';
```

## SOLID Principles in Feature-Based Architecture

### Single Responsibility Principle (SRP)
- Each feature has ONE core responsibility
- Each module within a feature has ONE reason to change

### Open/Closed Principle (OCP)
- Features are open for extension (add new features) but closed for modification
- Add new services by creating new adapters, not modifying existing code

### Liskov Substitution Principle (LSP)
- All service adapters implement the same interface and are interchangeable
- Infrastructure implementations can be swapped without affecting domain

### Interface Segregation Principle (ISP)
- Features define minimal interfaces they need
- Shared interfaces are small and focused

### Dependency Inversion Principle (DIP)
- Features depend on abstractions (interfaces in domain)
- Infrastructure implements domain interfaces
- Use dependency injection throughout

## Shared Code

### Shared Domain (`shared/domain/`)
Core domain models used across features:
- `McpServer` - MCP server entity
- `ServiceType` - Service type value object
- `OperatingSystem` - OS value object

### Shared Infrastructure (`shared/infrastructure/`)
Common infrastructure implementations:
- `IFileSystem` / `NodeFileSystem` - File operations
- OS detection utilities
- Logging

### Shared Utils (`shared/utils/`)
Pure utility functions:
- String manipulation
- Validation helpers
- Common algorithms

## Dependency Rules

1. **Shared** → No dependencies on features or app
2. **Features** → Can depend on shared, can reference other features' interfaces
3. **App** → Can depend on shared and features

```
┌─────────────────┐
│   App Layer     │  (Composes features)
└────────┬────────┘
         │ depends on
┌────────▼────────┐
│    Features     │  (Use shared, reference other features' interfaces)
└────────┬────────┘
         │ depends on
┌────────▼────────┐
│     Shared      │  (No dependencies)
└─────────────────┘
```

## Adding a New Feature

1. Create feature directory: `src/features/my-feature/`
2. Add README.md explaining the feature
3. Create internal Clean Architecture structure:
   - `domain/` - Business logic and interfaces
   - `application/` - Use cases
   - `infrastructure/` - Implementations
   - `presentation/` - UI components
4. Define public interface in `domain/`
5. Register dependencies in DI container
6. Update documentation

## Testing Strategy

### Unit Tests
```
tests/unit/
├── shared/           # Test shared utilities
└── features/         # Test each feature independently
    ├── service-detection/
    ├── mcp-installation/
    └── config-management/
```

### Integration Tests
```
tests/integration/
└── features/         # Test feature interactions
```

### E2E Tests
```
tests/e2e/
└── workflows/        # Test complete user workflows
```

## Best Practices

### DO ✅
- Keep features independent and loosely coupled
- Use shared domain models for communication
- Depend on interfaces, not implementations
- Write tests for each feature independently
- Document feature responsibilities in README

### DON'T ❌
- Create circular dependencies between features
- Put business logic in shared utilities
- Directly import infrastructure from other features
- Create "god features" that do everything
- Skip documentation for new features

## Examples

### Good Feature Organization
```typescript
// Service Detection Feature
src/features/service-detection/
├── domain/
│   ├── ServiceInfo.ts              // Entity
│   └── IServiceDetector.ts         // Interface
├── application/
│   └── DetectServicesUseCase.ts    // Use case
├── infrastructure/
│   └── ClaudeDesktopDetector.ts    // Implementation
└── README.md                        // Documentation
```

### Good Feature Usage
```typescript
// In MCP Installation feature
import { IServiceDetector } from '@/features/service-detection/domain/IServiceDetector';
import { McpServer } from '@/shared/domain/entities/McpServer';

class InstallMcpServerUseCase {
  constructor(
    private detector: IServiceDetector,  // Interface from another feature
    private fileSystem: IFileSystem      // Interface from shared
  ) {}

  async execute(serverConfig: McpServerConfig): Promise<void> {
    const mcpServer = new McpServer(serverConfig);  // Shared entity
    const detected = await this.detector.detect();   // Use other feature
    // ... installation logic
  }
}
```

---

For more details on SOLID principles and architecture guidelines, see `AGENTS.md` and `ARCHITECTURE.md`.
