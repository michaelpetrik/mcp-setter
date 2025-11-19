# MCP Registry Feature

## Purpose
Integration with the official MCP registry at https://registry.modelcontextprotocol.io/

## Responsibilities
- Search and browse MCP servers from the registry
- Fetch server metadata (description, install instructions, credentials requirements)
- Retrieve latest server versions
- Cache registry results for performance

## Structure

### Domain (`domain/`)
- Interfaces for registry operations

### Application (`application/`)
- `SearchMcpServersUseCase.ts` - Search servers in the registry
- `GetMcpServerDetailsUseCase.ts` - Get detailed info about a specific server
- `ListMcpServersUseCase.ts` - List all available servers (paginated)

### Infrastructure (`infrastructure/`)
- Registry client implementation (already in shared/infrastructure/registry)

## Dependencies
- Depends on: `shared/domain`, `shared/infrastructure`
- Depended by: `mcp-installation` feature

## Example Usage
```typescript
const useCase = new SearchMcpServersUseCase(registryClient);
const result = await useCase.execute({ query: 'filesystem' });
```
