# Frontend Implementations

This directory contains **frontend implementations** for the MCP Setter application. All frontends consume the same business logic from `src/features/`.

## Architecture Principle

**Frontends are THIN layers**. They should:
- ✅ Handle user input/output
- ✅ Format presentation
- ✅ Call use cases from `src/features/`
- ❌ NOT contain any business logic
- ❌ NOT duplicate code between frontends

## Frontends

### Electron (Desktop App)
**Location**: `src/app/electron/`

Cross-platform desktop application with GUI.

**Structure**:
```
electron/
├── main/           # Electron main process
│   ├── main.ts     # App lifecycle, window management
│   └── ipc.ts      # IPC handlers (call use cases)
├── renderer/       # UI (React/Vue/vanilla)
│   └── App.tsx     # UI components (call use cases)
└── preload/        # Bridge between main/renderer
    └── preload.ts  # Exposed APIs
```

**Usage**:
```typescript
// Example: renderer/components/InstallButton.tsx
import { container } from 'tsyringe';
import { InstallMcpServerUseCase } from '@features/mcp-installation/application/InstallMcpServerUseCase';

const installUseCase = container.resolve(InstallMcpServerUseCase);

async function handleInstall() {
  const result = await installUseCase.execute(dto);
  showNotification(`Installed: ${result.serverName}`);
}
```

### CLI (Command-Line Interface)
**Location**: `src/app/cli/`

Command-line interface for automation and scripting.

**Structure**:
```
cli/
├── index.ts        # CLI entry point
├── commands/       # Command implementations
│   ├── install.ts  # Install command (calls use case)
│   ├── detect.ts   # Detect command (calls use case)
│   └── list.ts     # List command (calls use case)
└── utils/          # CLI-specific utilities (formatting, colors)
```

**Usage**:
```typescript
// Example: cli/commands/install.ts
import { container } from 'tsyringe';
import { InstallMcpServerUseCase } from '@features/mcp-installation/application/InstallMcpServerUseCase';

const installUseCase = container.resolve(InstallMcpServerUseCase);

export async function installCommand(serverConfig: string) {
  const result = await installUseCase.execute(dto);
  console.log(`✓ Installed: ${result.serverName}`);
}
```

## Dependency Injection

Both frontends use the same DI container configuration:

```typescript
// Example: di-container.ts (shared by both frontends)
import 'reflect-metadata';
import { container } from 'tsyringe';
import { IFileSystem } from '@shared/infrastructure/file-system/IFileSystem';
import { NodeFileSystem } from '@shared/infrastructure/file-system/NodeFileSystem';

// Register shared dependencies
container.register<IFileSystem>('IFileSystem', {
  useClass: NodeFileSystem
});

// Register use cases (automatically resolved)
// Use cases are decorated with @injectable()
```

## Adding Frontend Features

### For Desktop App
1. Add UI component in `electron/renderer/`
2. Call use case from business logic layer
3. Format result for display
4. NO business logic in component

### For CLI
1. Add command in `cli/commands/`
2. Parse arguments
3. Call use case from business logic layer
4. Format output for terminal
5. NO business logic in command

## Example: Consistent Behavior

Both frontends call the SAME use case:

**Desktop App**:
```typescript
// electron/renderer/components/InstallDialog.tsx
const result = await installUseCase.execute({
  serviceType: 'claude-desktop',
  serverConfig: { command: 'npx', args: ['server'] }
});
showSuccessDialog(`Installed ${result.serverName}`);
```

**CLI**:
```typescript
// cli/commands/install.ts
const result = await installUseCase.execute({
  serviceType: 'claude-desktop',
  serverConfig: { command: 'npx', args: ['server'] }
});
console.log(`✓ Installed ${result.serverName}`);
```

**Same logic, different presentation.**

## Testing Frontend

Frontend tests should be minimal:
- Test user interaction (clicks, commands)
- Test that correct use cases are called
- Test presentation formatting
- DO NOT test business logic (already tested in features)

```typescript
// Example: Desktop app test
test('install button calls use case', async () => {
  const mockUseCase = mock<InstallMcpServerUseCase>();
  render(<InstallButton useCase={mockUseCase} />);

  fireEvent.click(screen.getByText('Install'));

  expect(mockUseCase.execute).toHaveBeenCalled();
});
```

## Prohibited

- ❌ Business logic in frontend code
- ❌ Duplicate logic between CLI and Desktop
- ❌ Direct file system access (use use cases)
- ❌ Direct infrastructure calls (use use cases)
- ❌ Complex validation (should be in domain)

## When to Add to Features vs. Frontends

**Add to Features** (`src/features/`) if:
- Logic is needed by both CLI and Desktop
- It's a business rule or validation
- It involves domain entities or use cases
- It needs to be tested independently

**Add to Frontend** (`src/app/`) if:
- It's UI-specific (buttons, layouts)
- It's formatting for display
- It's CLI argument parsing
- It's user interaction handling

**Rule of thumb**: If you're writing the same code twice, it belongs in `src/features/`.

---

For more details, see:
- [AGENTS.md](../../AGENTS.md) - Development principles
- [CLAUDE.md](../../CLAUDE.md) - Claude Code guidance
- [docs/adr/003-modular-architecture-shared-logic.md](../../docs/adr/003-modular-architecture-shared-logic.md)
