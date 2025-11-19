#!/usr/bin/env node
/**
 * MCP Setter CLI
 * Command-line interface for managing MCP servers
 */

import { Command } from 'commander';
import { initializeContainer } from './di-container';
import { searchCommand } from './commands/search';
import { listCommand } from './commands/list';
import { detectCommand } from './commands/detect';
import { installCommand } from './commands/install';
import { installedCommand } from './commands/installed';
import { healthcheckCommand } from './commands/healthcheck';
import { backupCommand, restoreCommand } from './commands/backup';
import * as output from './utils/output';

// Initialize DI container
initializeContainer();

// Create CLI program
const program = new Command();

program
  .name('mcp-setter')
  .description('CLI tool for managing Model Context Protocol (MCP) servers')
  .version('0.1.0');

// Search command
program
  .command('search')
  .description('Search for MCP servers in the registry')
  .option('-q, --query <query>', 'Search query')
  .option('-l, --limit <number>', 'Maximum number of results', '20')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    await searchCommand({
      query: options.query,
      limit: parseInt(options.limit, 10),
      json: options.json,
    });
  });

// List command
program
  .command('list')
  .description('List all available MCP servers from the registry')
  .option('-l, --limit <number>', 'Maximum number of results', '20')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    await listCommand({
      limit: parseInt(options.limit, 10),
      json: options.json,
    });
  });

// Detect command
program
  .command('detect')
  .description('Detect installed MCP clients on the system')
  .option('-p, --project-path <path>', 'Project path to check for project-specific configs')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    await detectCommand({
      projectPath: options.projectPath,
      json: options.json,
    });
  });

// Install command
program
  .command('install <server-name>')
  .description('Install an MCP server to a client')
  .requiredOption('-c, --client <client>', 'Client to install to (claude-desktop, cursor, etc.)')
  .option('-n, --custom-name <name>', 'Custom name for the server')
  .option('--skip-backup', 'Skip backup before installation')
  .option('--json', 'Output as JSON')
  .action(async (serverName, options) => {
    await installCommand({
      serverName,
      client: options.client,
      customName: options.customName,
      skipBackup: options.skipBackup,
      json: options.json,
    });
  });

// Installed command
program
  .command('installed')
  .description('List installed MCP servers for a client')
  .requiredOption('-c, --client <client>', 'Client to list (claude-desktop, cursor, etc.)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    await installedCommand({
      client: options.client,
      json: options.json,
    });
  });

// Healthcheck command
program
  .command('healthcheck <server-name>')
  .description('Check health of an MCP server')
  .requiredOption('-c, --client <client>', 'Client to check (claude-desktop, cursor, etc.)')
  .option('--json', 'Output as JSON')
  .action(async (serverName, options) => {
    await healthcheckCommand({
      serverName,
      client: options.client,
      json: options.json,
    });
  });

// Backup command
program
  .command('backup')
  .description('Create a backup of all MCP configurations')
  .option('-o, --output <path>', 'Output file path')
  .option('-p, --project-path <path>', 'Project path to include')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    await backupCommand({
      output: options.output,
      projectPath: options.projectPath,
      json: options.json,
    });
  });

// Restore command
program
  .command('restore <file>')
  .description('Restore MCP configurations from a backup')
  .option('--overwrite', 'Overwrite existing configurations')
  .option('--skip-backup', 'Skip backup before restore')
  .option('--json', 'Output as JSON')
  .action(async (file, options) => {
    await restoreCommand({
      input: file,
      overwrite: options.overwrite,
      skipBackup: options.skipBackup,
      json: options.json,
    });
  });

// Parse arguments and run
program.parse(process.argv);

// Show help if no command specified
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
