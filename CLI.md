# MCP Setter CLI Documentation

Complete command-line interface for managing Model Context Protocol (MCP) servers across multiple AI clients.

## Installation

```bash
# Install dependencies
npm install

# Run CLI (development)
npm run dev:cli <command>

# Build standalone CLI
npm run build:cli
# Then run: ./dist-cli/index.js
```

## Quick Start

```bash
# Detect installed MCP clients
npm run dev:cli detect

# Search for MCP servers
npm run dev:cli search --query filesystem

# Install an MCP server
npm run dev:cli install brave-search --client claude-desktop

# List installed servers
npm run dev:cli installed --client claude-desktop

# Create a backup
npm run dev:cli backup --output my-backup.json
```

## Commands

### `search` - Search MCP Registry

Search for MCP servers in the official registry.

```bash
npm run dev:cli search [options]

Options:
  -q, --query <query>    Search query (e.g., "filesystem", "github")
  -l, --limit <number>   Maximum results (default: 20)
  --json                 Output as JSON
```

**Examples:**
```bash
# Search for filesystem servers
npm run dev:cli search --query filesystem

# List first 50 servers
npm run dev:cli search --limit 50

# Search with JSON output
npm run dev:cli search --query brave --json
```

---

### `list` - List All Available Servers

List all MCP servers available in the registry (paginated).

```bash
npm run dev:cli list [options]

Options:
  -l, --limit <number>   Maximum results (default: 20)
  --json                 Output as JSON
```

**Examples:**
```bash
# List first 20 servers
npm run dev:cli list

# List first 100 servers
npm run dev:cli list --limit 100
```

---

### `detect` - Detect Installed Clients

Detect which MCP clients are installed on your system.

```bash
npm run dev:cli detect [options]

Options:
  -p, --project-path <path>  Check for project-specific configs
  --json                     Output as JSON
```

**Detects:**
- Claude Desktop (global)
- Claude CLI (global + project `.mcp.json`)
- Cursor (global + project `.cursor/mcp.json`)
- Continue (project `.continue/mcpServers/`)
- Gemini CLI (global)

**Examples:**
```bash
# Detect all clients
npm run dev:cli detect

# Detect including project-specific configs
npm run dev:cli detect --project-path /path/to/project

# JSON output
npm run dev:cli detect --json
```

---

### `install` - Install MCP Server

Install an MCP server from the registry to a specific client.

```bash
npm run dev:cli install <server-name> --client <client> [options]

Arguments:
  <server-name>          Name from registry (e.g., "brave-search")

Required Options:
  -c, --client <client>  Target client (claude-desktop, claude-cli, cursor, continue, gemini-cli)

Optional:
  -n, --custom-name <name>  Custom name for the server
  --skip-backup             Skip config backup
  --json                    Output as JSON
```

**Examples:**
```bash
# Install brave-search to Claude Desktop
npm run dev:cli install brave-search --client claude-desktop

# Install with custom name
npm run dev:cli install brave-search --client cursor --custom-name my-brave

# Install without backup
npm run dev:cli install filesystem --client claude-cli --skip-backup
```

**What It Does:**
1. Fetches server metadata from registry
2. Detects the target client
3. Backs up existing config (unless `--skip-backup`)
4. Adds server to client config
5. Shows required credentials (if any)

**After Installation:**
- Set credentials if required (see Credentials Management below)
- Restart the client to load the new server

---

### `installed` - List Installed Servers

List all MCP servers installed for a specific client.

```bash
npm run dev:cli installed --client <client> [options]

Required Options:
  -c, --client <client>  Client to list (claude-desktop, claude-cli, cursor, etc.)

Optional:
  --json                 Output as JSON
```

**Examples:**
```bash
# List servers for Claude Desktop
npm run dev:cli installed --client claude-desktop

# List servers for Cursor
npm run dev:cli installed --client cursor

# JSON output
npm run dev:cli installed --client claude-cli --json
```

**Output:**
- Total count, enabled count, disabled count
- Each server: name, command, args, env vars

---

### `healthcheck` - Check Server Health

Run comprehensive health checks on an MCP server.

```bash
npm run dev:cli healthcheck <server-name> --client <client> [options]

Arguments:
  <server-name>          Server name to check

Required Options:
  -c, --client <client>  Client to check

Optional:
  --json                 Output as JSON
```

**Examples:**
```bash
# Check brave-search health
npm run dev:cli healthcheck brave-search --client claude-desktop

# Check with JSON output
npm run dev:cli healthcheck filesystem --client cursor --json
```

**Health Checks:**
1. ✓ Config file exists
2. ✓ Server in config
3. ✓ Server enabled
4. ✓ Command valid
5. ✓ Required credentials configured

**Health States:**
- **OK** - All checks passed
- **DEGRADED** - Some checks passed
- **BROKEN** - All checks failed
- **UNKNOWN** - Cannot determine health

---

### `backup` - Create Configuration Backup

Create a snapshot backup of all MCP configurations.

```bash
npm run dev:cli backup [options]

Options:
  -o, --output <path>        Output file path (default: auto-generated)
  -p, --project-path <path>  Include project-specific configs
  --json                     Output as JSON
```

**Examples:**
```bash
# Create backup with auto-generated name
npm run dev:cli backup

# Specify output file
npm run dev:cli backup --output my-mcp-backup.json

# Include project configs
npm run dev:cli backup --project-path /path/to/project --output backup.json
```

**Backup Includes:**
- All client configs (JSON format)
- All `.env` credential files
- Metadata (timestamp, OS, client types)

**Default Naming:**
- Format: `mcp-backup-YYYYMMDD-HHMMSS.json`
- Example: `mcp-backup-20250119-143022.json`

---

### `restore` - Restore From Backup

Restore MCP configurations from a backup file.

```bash
npm run dev:cli restore <file> [options]

Arguments:
  <file>           Backup file to restore from

Options:
  --overwrite      Overwrite existing configurations
  --skip-backup    Skip backup before restore
  --json           Output as JSON
```

**Examples:**
```bash
# Restore (skip existing configs)
npm run dev:cli restore my-backup.json

# Restore and overwrite existing
npm run dev:cli restore my-backup.json --overwrite

# Restore without creating backup
npm run dev:cli restore backup.json --skip-backup --overwrite
```

**Behavior:**
- By default: Skips existing configs (safe)
- With `--overwrite`: Replaces existing configs
- Restores both config files and credentials
- Shows summary: restored, skipped, errors

---

## Credentials Management

MCP servers often require API keys or credentials. MCP Setter stores these in `.env` files next to config files.

### Where Credentials Are Stored

```
# Claude Desktop
~/Library/Application Support/Claude/.env.mcp-claude-desktop

# Cursor
~/Library/Application Support/Cursor/.env.mcp-cursor-desktop

# Project-specific (Claude CLI)
/path/to/project/.env.mcp
```

### Setting Credentials (Manual)

After installing a server that requires credentials:

1. The CLI will show required fields:
   ```
   This server requires 2 credential(s):
     - BRAVE_API_KEY (required)
     - API_ENDPOINT (optional)
   ```

2. Create/edit the `.env` file:
   ```bash
   # For Claude Desktop
   vim ~/Library/Application\ Support/Claude/.env.mcp-claude-desktop
   ```

3. Add credentials:
   ```env
   BRAVE_API_KEY=your_api_key_here
   API_ENDPOINT=https://api.example.com
   ```

4. Restart the client

### Credential File Format

```env
# MCP Server Credentials
# Generated by MCP Setter
# Do not commit this file to version control

API_KEY=your_key_here
ANOTHER_SECRET="value with spaces"
```

---

## Supported Clients

| Client | Global Config | Project Config | Notes |
|--------|---------------|----------------|-------|
| **Claude Desktop** | ✓ | - | macOS, Windows, Linux |
| **Claude CLI** | ✓ | ✓ (`.mcp.json`) | Prefer project configs for teams |
| **Cursor** | ✓ | ✓ (`.cursor/mcp.json`) | Project configs recommended |
| **Continue** | ✓ | ✓ (`.continue/mcpServers/`) | Primarily project-based |
| **Gemini CLI** | ✓ | - | Experimental support |

---

## JSON Output Mode

All commands support `--json` flag for machine-readable output:

```bash
# Get structured data
npm run dev:cli detect --json | jq '.clients[].clientType'

# Parse install result
npm run dev:cli install brave-search --client claude-desktop --json | jq '.success'

# Extract healthcheck status
npm run dev:cli healthcheck brave --client claude-desktop --json | jq '.healthStatus.state'
```

---

## Common Workflows

### Complete Installation Workflow

```bash
# 1. Detect clients
npm run dev:cli detect

# 2. Search for a server
npm run dev:cli search --query brave

# 3. Install to a client
npm run dev:cli install brave-search --client claude-desktop

# 4. Set credentials (if needed)
vim ~/Library/Application\ Support/Claude/.env.mcp-claude-desktop

# 5. Verify installation
npm run dev:cli installed --client claude-desktop

# 6. Run health check
npm run dev:cli healthcheck brave-search --client claude-desktop

# 7. Restart Claude Desktop
```

### Backup Before Major Changes

```bash
# Create backup
npm run dev:cli backup --output before-changes.json

# Make changes...
npm run dev:cli install ...

# Restore if needed
npm run dev:cli restore before-changes.json --overwrite
```

### Cross-Client Setup

```bash
# Install to Claude Desktop
npm run dev:cli install filesystem --client claude-desktop

# Copy to Cursor (future: use copy command)
# For now: install to both separately
npm run dev:cli install filesystem --client cursor
```

---

## Troubleshooting

### Client Not Detected

```bash
# Check if client is actually installed
which claude  # for Claude CLI
ls ~/Library/Application\ Support/Claude/  # for Claude Desktop

# Specify project path for project-specific configs
npm run dev:cli detect --project-path /path/to/project
```

### Server Not Found in Registry

```bash
# Search with different terms
npm run dev:cli search --query file
npm run dev:cli search --query system

# List all available servers
npm run dev:cli list --limit 100
```

### Installation Failed

```bash
# Check permissions
ls -la ~/Library/Application\ Support/Claude/

# Verify client is detected
npm run dev:cli detect

# Try with --json for detailed error
npm run dev:cli install server --client claude-desktop --json
```

### Health Check Failed

```bash
# Run health check
npm run dev:cli healthcheck server-name --client claude-desktop

# Common issues:
# - Server disabled → Check config, enable server
# - Missing credentials → Set in .env file
# - Invalid command → Reinstall server
```

---

## Advanced Usage

### Scripting & Automation

```bash
#!/bin/bash
# auto-setup.sh - Automated MCP setup

# Install multiple servers
servers=("brave-search" "filesystem" "github")
client="claude-desktop"

for server in "${servers[@]}"; do
  npm run dev:cli install "$server" --client "$client" --skip-backup
done

# Create backup
npm run dev:cli backup --output auto-setup-backup.json

echo "Setup complete! Restart $client"
```

### JSON Processing

```bash
# Get list of all installed servers across all clients
npm run dev:cli detect --json | \
  jq -r '.clients[].configPath' | \
  while read config; do
    npm run dev:cli installed --client $(basename $(dirname $config)) --json
  done | jq -s 'map(.servers[]) | unique_by(.name)'
```

---

## Environment Variables

None required. All configuration is file-based and local.

---

## Exit Codes

- `0` - Success
- `1` - Error (command failed, server not found, etc.)

---

## Getting Help

```bash
# Show all commands
npm run dev:cli --help

# Show command-specific help
npm run dev:cli install --help
npm run dev:cli backup --help
```

---

## Next Steps

- See [README.md](./README.md) for architecture and development info
- See [CLAUDE.md](./CLAUDE.md) for codebase guidance
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture

---

**Built with TypeScript, Clean Architecture, and SOLID principles** ✨
