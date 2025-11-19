# Credentials Management Feature

## Purpose
Manage environment variables and credentials for MCP servers.

## Responsibilities
- Store credentials in `.env` files next to client configs
- Load credentials from `.env` files
- Validate required credentials
- Ensure secure storage (file-based, local only)

## Structure

### Domain (`domain/`)
- `ICredentialsManager.ts` - Interface for credentials operations

### Application (`application/`)
- `SaveCredentialsUseCase.ts` - Save credentials to .env file
- `LoadCredentialsUseCase.ts` - Load credentials from .env file
- `ValidateCredentialsUseCase.ts` - Validate required credentials are present

### Infrastructure (`infrastructure/`)
- `DotEnvCredentialsManager.ts` - .env file implementation

## Dependencies
- Depends on: `shared/domain`, `shared/infrastructure`
- Depended by: `mcp-installation` feature

## Example Usage
```typescript
const useCase = new SaveCredentialsUseCase(credentialsManager);
await useCase.execute({
  configPath: '/path/to/config.json',
  credentials: { API_KEY: 'secret' }
});
```
