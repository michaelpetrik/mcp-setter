# Setup Scripts

This folder contains scripts to help configure MCP servers for Claude Desktop.

## Available Scripts

### `setup-env.sh`
Loads environment variables from `.env` file into the current shell session.

**Usage:**
```bash
source scripts/setup-env.sh
```

**Note:** Variables are only available in the current shell session.

### `install-env-globally.sh`
Installs environment variables globally by adding them to your shell profile (~/.zshrc or ~/.bashrc).

**Usage:**
```bash
./scripts/install-env-globally.sh
```

**What it does:**
- Detects your shell (bash or zsh)
- Adds environment variables to the appropriate profile file
- Makes variables available to all applications including Claude Desktop

**After running:**
```bash
# Apply changes immediately
source ~/.zshrc  # or ~/.bashrc for bash

# Or restart Claude Desktop
```

## Environment Variables

The following environment variables are configured:

- `CONTEXT7_API_KEY` - API key for Context7 MCP server
- `GITHUB_MCP_PAT` - GitHub Personal Access Token for GitHub MCP server
- `N8N_API_KEY` - API key for n8n MCP server
- `N8N_API_URL` - URL for n8n instance

## Security

**Important:** Never commit the `.env` file to version control. It contains sensitive API keys.

The `.env` file is already added to `.gitignore`.

## Troubleshooting

### Claude Desktop doesn't see the environment variables

1. Make sure you've run `install-env-globally.sh`
2. Restart Claude Desktop completely (Quit and reopen)
3. On macOS, you may need to restart your system for Launch Services to pick up the new environment

### Variables work in terminal but not in Claude Desktop

macOS applications launched from Finder/Launchpad may not inherit shell environment variables. To fix this:

1. Add variables to `/etc/launchd.conf` (requires sudo)
2. Or use `launchctl setenv` command
3. Or restart your system after adding to shell profile

### Script says variables already added

If you need to update the variables:

1. Manually edit your shell profile (`~/.zshrc` or `~/.bashrc`)
2. Find the "MCP Server Environment Variables" section
3. Update the values
4. Run `source ~/.zshrc` to apply changes
