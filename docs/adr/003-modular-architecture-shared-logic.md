# ADR-003: Modular Architecture with Shared Business Logic

## Status
Accepted

## Context
We need to support two different frontends:
1. **Desktop Application** (Electron) - GUI for end users
2. **CLI** - Command-line interface for automation and scripting

Both frontends need to perform the same core operations:
- Detect installed AI services
- Install MCP servers
- Manage configurations
- Validate and backup configs

Traditional approaches would lead to:
- **Code duplication**: Implementing same logic twice (once for each frontend)
- **Inconsistency**: Different behaviors between CLI and GUI
- **Maintenance burden**: Bug fixes and features need to be implemented twice
- **Testing overhead**: Same logic needs different test suites

## Decision
We will implement a **modular monorepo architecture** with:

### One Shared Business Logic Layer
All business logic lives in:
- `src/shared/` - Core domain entities, value objects, shared infrastructure
- `src/features/` - Business features with domain, application, and infrastructure layers

### Two Independent Frontend Layers
- `src/app/electron/` - Desktop GUI (Electron)
- `src/app/cli/` - Command-line interface

### Strict Separation Rules
1. **Business logic is 100% shared** between frontends
2. **Frontends are thin layers** that only handle:
   - User input/output
   - Presentation formatting
   - Framework-specific code
3. **Zero duplication**: If logic is needed in both frontends, it goes in `src/features/`
4. **Dependency direction**: `Frontends → Features → Shared`

## Consequences

### Positive
- **DRY Compliance**: Business logic written once, used everywhere
- **Consistency**: CLI and Desktop always behave identically
- **Easier Testing**: Test business logic once, minimal frontend testing needed
- **Maintainability**: Bug fixes and features automatically apply to both frontends
- **Independent Development**: Teams can work on frontends independently
- **Flexibility**: Easy to add a third frontend (web, mobile) without rewriting logic
- **Smaller Frontend Code**: Frontends are simple, focused on presentation

### Negative
- **Initial Complexity**: Need to design business logic to be frontend-agnostic
- **Abstraction Required**: Use cases must work without knowing which frontend calls them
- **More Interfaces**: Need well-defined contracts between layers
- **Discipline Required**: Developers must resist putting logic in frontends

### Neutral
- **Monorepo Management**: Need tools to manage multiple packages in one repo
- **Build Process**: Separate build steps for core, CLI, and Desktop
- **Testing Strategy**: Different test types for business logic vs. frontends

## Implementation Details

### Directory Structure
```
src/
├── shared/              # Core entities, value objects, infrastructure
│   ├── domain/
│   └── infrastructure/
│
├── features/            # Business logic (SHARED)
│   ├── service-detection/
│   ├── mcp-installation/
│   └── config-management/
│
└── app/                 # Frontends (THIN)
    ├── electron/        # Desktop GUI
    └── cli/             # Command-line
```

### Use Case Example
```typescript
// Business Logic (src/features/mcp-installation/application/)
@injectable()
export class InstallMcpServerUseCase {
  constructor(
    @inject('IServiceAdapter') private adapter: IServiceAdapter
  ) {}

  async execute(input: InstallMcpServerDTO): Promise<InstallResult> {
    // All installation logic here
  }
}

// Desktop Frontend (src/app/electron/renderer/)
const result = await installUseCase.execute(dto);
showSuccessDialog(result);

// CLI Frontend (src/app/cli/commands/)
const result = await installUseCase.execute(dto);
console.log(`✓ Installed: ${result.serverName}`);
```

### Dependency Injection
Both frontends register the same dependencies:
```typescript
// Shared DI setup (used by both frontends)
container.register<IFileSystem>('IFileSystem', {
  useClass: NodeFileSystem
});
container.register<InstallMcpServerUseCase>('InstallMcpServerUseCase', {
  useClass: InstallMcpServerUseCase
});

// Desktop: src/app/electron/main/di-container.ts
import './shared-di-setup';

// CLI: src/app/cli/di-container.ts
import './shared-di-setup';
```

## Alternatives Considered

### Separate Codebases
**Rejected**: Would lead to massive code duplication and inconsistency.

### Shared Library Published to npm
**Rejected**:
- Overhead of publishing and versioning
- Slower iteration (need to publish on each change)
- Still a monorepo, just with extra steps

### Frontend with CLI as Afterthought
**Rejected**: Would encourage putting logic in frontend, making CLI a second-class citizen.

### Layered Architecture (One Frontend)
**Rejected**: Doesn't solve the multi-frontend problem.

## Validation

Success criteria:
- [ ] No business logic code in `src/app/`
- [ ] Use cases work identically from CLI and Desktop
- [ ] Adding a new feature requires zero frontend changes
- [ ] Bug fixes automatically apply to both frontends
- [ ] Tests for business logic run once, cover both frontends

## References
- [AGENTS.md](../../AGENTS.md) - Development principles
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - Detailed architecture
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
