/**
 * CLI Command: search
 * Search for MCP servers in the registry
 */

import { container } from '../di-container';
import { SearchMcpServersUseCase } from '@/features/mcp-registry/application/SearchMcpServersUseCase';
import * as output from '../utils/output';

export interface SearchCommandOptions {
  query?: string;
  limit?: number;
  json?: boolean;
}

/**
 * Execute the search command
 */
export async function searchCommand(options: SearchCommandOptions): Promise<void> {
  const { query, limit = 20, json: jsonOutput } = options;

  try {
    // Resolve use case from container
    const useCase = container.resolve(SearchMcpServersUseCase);

    // Execute search
    const result = await useCase.execute({
      query,
      limit,
      latestOnly: true,
    });

    // Output results
    if (jsonOutput) {
      output.json(result);
      return;
    }

    // Human-readable output
    if (result.servers.length === 0) {
      output.warn('No servers found');
      return;
    }

    output.header(`MCP Registry Search Results${query ? ` for "${query}"` : ''}`);
    output.info(`Found ${result.servers.length} server(s)${result.hasMore ? ' (more available)' : ''}\n`);

    // Print servers
    result.servers.forEach((server, index) => {
      console.log(`${index + 1}. ${server.getDisplayName()}`);
      console.log(`   Name: ${server.name}`);
      console.log(`   Description: ${server.description}`);

      if (server.version) {
        console.log(`   Version: ${server.version}`);
      }

      if (server.websiteUrl) {
        console.log(`   Website: ${server.websiteUrl}`);
      }

      const pkg = server.getPrimaryPackage();
      if (pkg) {
        console.log(`   Install: ${pkg.registryType} ${pkg.identifier}`);
      }

      const credentials = server.getRequiredCredentials();
      if (credentials.length > 0) {
        console.log(`   Required credentials: ${credentials.map(c => c.name).join(', ')}`);
      }

      console.log('');
    });

    if (result.hasMore) {
      output.info('Use --limit to see more results');
    }

    output.success('Search completed');
  } catch (err) {
    output.error(`Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    process.exit(1);
  }
}
