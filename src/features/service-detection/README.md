# Service Detection Feature

## Purpose
Detect installed AI services (Claude Desktop, etc.) on the user's system.

## Responsibilities
- Detect if a service is installed
- Find service configuration paths
- Validate service installation

## Structure

### Domain (`domain/`)
- `ServiceInfo.ts` - Entity representing detected service information
- `IServiceDetector.ts` - Interface for service detection

### Application (`application/`)
- `DetectServicesUseCase.ts` - Use case for detecting all services
- `DetectServiceUseCase.ts` - Use case for detecting a specific service

### Infrastructure (`infrastructure/`)
- `ClaudeDesktopDetector.ts` - Claude Desktop detection implementation
- Platform-specific detectors

### Presentation (`presentation/`)
- CLI and UI components for displaying detection results

## Dependencies
- Depends on: `shared/domain`, `shared/infrastructure`
- Depended by: `mcp-installation` feature

## Example Usage
```typescript
const useCase = new DetectServicesUseCase(detectors, fileSystem);
const services = await useCase.execute();
```
