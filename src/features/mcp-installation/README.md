# MCP Installation Feature

## Purpose
Install MCP server configurations into detected AI services.

## Responsibilities
- Parse MCP server configuration input
- Merge new MCP servers with existing configurations
- Backup configurations before installation
- Write updated configurations
- Rollback on error

## Structure

### Domain (`domain/`)
- `InstallationResult.ts` - Entity representing installation result
- `IServiceAdapter.ts` - Interface for service-specific installation logic

### Application (`application/`)
- `InstallMcpServerUseCase.ts` - Main installation use case
- `BackupConfigUseCase.ts` - Backup use case
- `ValidateConfigUseCase.ts` - Validation use case

### Infrastructure (`infrastructure/`)
- `ClaudeDesktopAdapter.ts` - Claude Desktop installation adapter
- Service-specific adapters

### Presentation (`presentation/`)
- Installation progress UI
- Error handling UI
- Success/failure notifications

## Dependencies
- Depends on: `shared/domain`, `shared/infrastructure`, `service-detection`, `config-management`

## Example Usage
```typescript
const useCase = new InstallMcpServerUseCase(adapter, fileSystem);
const result = await useCase.execute({
  serviceType: 'claude-desktop',
  mcpServerConfig: { command: 'node', args: ['server.js'] }
});
```
