# Client Detection Feature

## Purpose
Detect installed MCP clients on the user's system across different operating systems.

## Responsibilities
- Detect if MCP clients are installed (Claude Desktop, Cursor, Continue, etc.)
- Find client configuration file paths
- Validate client installations
- Support both global and project-specific client configs

## Structure

### Domain (`domain/`)
- `IClientDetector.ts` - Interface for client detection

### Application (`application/`)
- `DetectClientsUseCase.ts` - Detect all installed clients
- `DetectSpecificClientUseCase.ts` - Detect a specific client
- `FindClientConfigsUseCase.ts` - Find all config locations for a client

### Infrastructure (`infrastructure/`)
- `MultiClientDetector.ts` - Orchestrates detection across all clients
- `adapters/` - Per-client detection adapters

## Dependencies
- Depends on: `shared/domain`, `shared/infrastructure`
- Depended by: `mcp-installation`, `cross-client-management` features

## Example Usage
```typescript
const useCase = new DetectClientsUseCase(detector);
const clients = await useCase.execute();
```
