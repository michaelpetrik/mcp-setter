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

// Parse arguments and run
program.parse(process.argv);

// Show help if no command specified
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
