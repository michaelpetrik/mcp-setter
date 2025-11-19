/**
 * CLI Command: list
 * List all available MCP servers from the registry
 */

import { container } from '../di-container';
import { ListMcpServersUseCase } from '@/features/mcp-registry/application/ListMcpServersUseCase';
import * as output from '../utils/output';

export interface ListCommandOptions {
  limit?: number;
  json?: boolean;
}

/**
 * Execute the list command
 */
export async function listCommand(options: ListCommandOptions = {}): Promise<void> {
  const { limit = 20, json: jsonOutput } = options;

  try {
    // Resolve use case from container
    const useCase = container.resolve(ListMcpServersUseCase);

    // Execute list
    output.info('Fetching servers from registry...\n');

    const result = await useCase.execute({ limit });

    // Output results
    if (jsonOutput) {
      output.json(result);
      return;
    }

    // Human-readable output
    output.header('Available MCP Servers');

    if (result.servers.length === 0) {
      output.warn('No servers available in the registry');
      return;
    }

    output.info(`Showing ${result.servers.length} server(s)${result.hasMore ? ' (more available)' : ''}\n`);

    // Create table
    const headers = ['#', 'Name', 'Description', 'Type'];
    const rows = result.servers.map((server, index) => {
      const pkg = server.getPrimaryPackage();
      const installType = pkg
        ? `${pkg.registryType}${pkg.identifier ? `: ${pkg.identifier}` : ''}`
        : server.isRemote()
          ? 'remote'
          : 'n/a';

      return [
        String(index + 1),
        server.getShortName(),
        server.description.substring(0, 50) + (server.description.length > 50 ? '...' : ''),
        installType,
      ];
    });

    output.table(headers, rows);

    console.log('');
    if (result.hasMore) {
      output.info('Use --limit to see more results');
    }

    output.success('Listing completed');
  } catch (err) {
    output.error(`Listing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    process.exit(1);
  }
}
