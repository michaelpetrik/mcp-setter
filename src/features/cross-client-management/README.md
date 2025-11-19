# Cross-Client Management Feature

## Purpose
Manage MCP servers across multiple clients (copy, move, list).

## Responsibilities
- List all MCP servers across all detected clients
- Copy MCP server config from one client to another
- Move MCP server config between clients
- Preserve credentials during copy/move operations

## Structure

### Application (`application/`)
- `ListAllMcpConfigsUseCase.ts` - List all configs across all clients
- `CopyMcpConfigUseCase.ts` - Copy MCP from one client to another
- `MoveMcpConfigUseCase.ts` - Move MCP between clients

## Dependencies
- Depends on: `client-detection`, `mcp-installation`, `credentials-management`

## Example Usage
```typescript
const useCase = new CopyMcpConfigUseCase(...);
await useCase.execute({
  sourceConfigPath: '/path/to/claude/config.json',
  targetConfigPath: '/path/to/cursor/config.json',
  serverName: 'filesystem'
});
```
