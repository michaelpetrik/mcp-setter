# Configuration Management Feature

## Purpose
Read, parse, validate, and write service configuration files.

## Responsibilities
- Read service configuration files
- Parse JSON configurations
- Validate configuration schema
- Merge configurations safely
- Write configurations with proper formatting

## Structure

### Domain (`domain/`)
- `ServiceConfig.ts` - Entity representing service configuration
- `ValidationResult.ts` - Value object for validation results
- `IConfigParser.ts` - Interface for configuration parsing
- `IConfigValidator.ts` - Interface for validation

### Application (`application/`)
- `ReadConfigUseCase.ts` - Read configuration use case
- `WriteConfigUseCase.ts` - Write configuration use case
- `MergeConfigUseCase.ts` - Merge configurations use case
- `ValidateConfigUseCase.ts` - Validate configuration use case

### Infrastructure (`infrastructure/`)
- `JsonConfigParser.ts` - JSON parser implementation
- `ClaudeDesktopConfigValidator.ts` - Claude Desktop validation
- Service-specific parsers and validators

### Presentation (`presentation/`)
- Configuration viewer/editor UI
- Validation error display

## Dependencies
- Depends on: `shared/domain`, `shared/infrastructure`
- Depended by: `mcp-installation` feature

## Example Usage
```typescript
const readUseCase = new ReadConfigUseCase(parser, fileSystem);
const config = await readUseCase.execute('/path/to/config.json');

const validateUseCase = new ValidateConfigUseCase(validator);
const result = await validateUseCase.execute(config);
```
