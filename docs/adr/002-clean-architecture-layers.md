# ADR-002: Feature-Based Clean Architecture

## Status
Accepted

## Context
We need a software architecture that:
- Keeps business logic independent of frameworks and UI
- Makes the system testable without external dependencies
- Allows for framework changes without rewriting business logic
- Enforces clear separation of concerns
- Supports multiple service adapters without code duplication
- Organizes code by features for better discoverability and team productivity

## Decision
We will implement a **feature-based (vertical slice) architecture** where each feature contains its own clean architecture layers internally.

**Structure:**
```
src/
├── shared/              # Shared code across features
├── features/            # Features as vertical slices
│   └── feature-name/
│       ├── domain/      # Feature business logic
│       ├── application/ # Feature use cases
│       ├── infrastructure/ # Feature implementations
│       └── presentation/   # Feature UI
└── app/                 # Application entry points
```

**Dependency Rule**: Dependencies only point inward within each feature. Features communicate through shared domain models and interfaces.

## Consequences

### Positive
- **Testability**: Business logic can be tested without frameworks, UI, or external dependencies
- **Flexibility**: Can swap implementations (e.g., different file systems, UI frameworks) without touching business logic
- **Maintainability**: Clear separation makes code easier to understand and modify
- **Framework Independence**: Business logic doesn't depend on Electron or any specific framework
- **Service Extensibility**: Adding support for new services (Gemini, Codex) only requires new infrastructure adapters
- **SOLID Compliance**: Architecture naturally enforces SOLID principles

### Negative
- **More Files**: More layers means more files and interfaces
- **Initial Overhead**: Takes more time to set up initially compared to a simpler architecture
- **Learning Curve**: Team needs to understand and respect layer boundaries
- **Indirection**: More abstraction layers can make code flow harder to trace initially

### Neutral
- **Boilerplate**: Some interface definitions may feel like boilerplate but serve important purposes
- **Folder Structure**: Requires strict adherence to folder structure conventions

## Alternatives Considered

### Layered Architecture (Traditional N-Tier)
**Rejected because:**
- Dependencies flow downward, making business logic dependent on infrastructure
- Harder to test business logic in isolation
- Less flexible for framework changes
- Doesn't enforce dependency inversion

### Hexagonal Architecture (Ports and Adapters)
**Considered but not chosen:**
- Very similar to Clean Architecture
- Clean Architecture provides clearer layer definitions
- Team is more familiar with Clean Architecture terminology
- Could be adopted later if needed (architectures are compatible)

### Feature-Sliced Architecture
**Rejected because:**
- Better suited for frontend applications
- Doesn't provide clear guidance for business logic organization
- Less established pattern for desktop applications
- Doesn't emphasize dependency inversion as strongly

### Simple MVC/MVVM
**Rejected because:**
- Insufficient separation of concerns for complex business logic
- Business rules would be scattered between controllers and models
- Harder to unit test without UI framework
- Doesn't scale well as application grows

## Implementation Guidelines

### Layer Communication
```typescript
// ✅ CORRECT: Presentation → Application → Domain
// Presentation calls Application
const useCase = container.resolve(InstallMcpServerUseCase);
await useCase.execute(dto);

// Application uses Domain
class InstallMcpServerUseCase {
  execute(dto: InstallDto) {
    const mcpServer = new McpServer(dto.config);
    return this.adapter.install(mcpServer);
  }
}

// ❌ INCORRECT: Domain → Infrastructure
class McpServer {
  // Domain should NOT directly use infrastructure
  save() {
    FileSystem.write(...); // WRONG!
  }
}
```

### Interface Definition
- Define interfaces in the layer that uses them (Interface Segregation)
- Domain defines `IServiceAdapter` because domain needs it
- Infrastructure implements `IServiceAdapter`

### Testing Strategy
- Domain: Pure unit tests, no mocks needed
- Application: Unit tests with mocked interfaces
- Infrastructure: Integration tests with real implementations
- Presentation: E2E tests with full stack

## References
- [The Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Clean Architecture Book](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
