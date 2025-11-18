# ADR-001: Technology Stack Selection

## Status
Accepted

## Context
We need to build a cross-platform desktop application for installing MCP servers across different AI services and operating systems. The application must:
- Run on Windows, macOS, and Linux
- Provide a good user experience with native OS integration
- Be maintainable and testable
- Follow clean architecture principles
- Support future extensibility

## Decision
We will use the following technology stack:

**Core:**
- TypeScript 5.x (strict mode)
- Node.js 18+ LTS
- Electron 28+ for desktop application framework

**Build & Development:**
- Vite 5.x for fast builds and HMR
- Vitest for unit/integration testing
- Playwright for E2E testing
- ESLint + Prettier for code quality

**Architecture Support:**
- tsyringe for dependency injection
- Zod for runtime validation
- fs-extra for file system operations

## Consequences

### Positive
- **TypeScript**: Strong typing reduces runtime errors, improves IDE support, and serves as living documentation
- **Electron**: Mature, production-grade framework with excellent cross-platform support and large ecosystem
- **Vite**: Extremely fast development builds with HMR, improving developer experience
- **Vitest**: Native TypeScript support, fast execution, compatible with Jest API
- **tsyringe**: Lightweight DI container that works well with TypeScript decorators
- **Zod**: Runtime type validation that complements TypeScript's compile-time checking

### Negative
- **Electron Bundle Size**: Applications will be larger (~150-200MB) due to bundled Chromium and Node.js
- **Memory Usage**: Electron apps consume more memory than native applications
- **Learning Curve**: Team needs familiarity with Electron's multi-process architecture
- **Build Complexity**: Need to manage both main and renderer process builds

### Neutral
- **Update Maintenance**: Need to keep Electron and dependencies up to date for security
- **Platform Testing**: Requires testing on all three target platforms

## Alternatives Considered

### Tauri (Rust + Web Frontend)
**Rejected because:**
- Smaller ecosystem and community
- Team would need to learn Rust for system-level code
- Less mature tooling compared to Electron
- Adds unnecessary complexity for our use case

### Native Development (Swift/C#/C++)
**Rejected because:**
- Would require three separate codebases (one per platform)
- Significantly higher development and maintenance cost
- Team expertise is in JavaScript/TypeScript
- Violates DRY principle at project level

### Neutralino (Lightweight alternative)
**Rejected because:**
- Less mature and smaller ecosystem
- Limited native OS integration capabilities
- Uncertain long-term support
- May limit future feature requirements

### NW.js
**Rejected because:**
- Less active development compared to Electron
- Smaller community and fewer resources
- Less clear separation between main/renderer processes
- Electron has better security model

## References
- [Electron Documentation](https://www.electronjs.org/docs/latest/)
- [Vite Documentation](https://vitejs.dev/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
