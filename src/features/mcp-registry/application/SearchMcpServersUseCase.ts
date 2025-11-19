/**
 * Use Case: SearchMcpServersUseCase
 * Search for MCP servers in the registry
 */

import { injectable, inject } from 'tsyringe';
import { IMcpRegistryClient } from '@/shared/infrastructure/registry/IMcpRegistryClient';
import { McpRegistryServer } from '@/shared/domain/entities/McpRegistryServer';

export interface SearchMcpServersInput {
  query?: string;
  updatedSince?: Date;
  latestOnly?: boolean;
  limit?: number;
  cursor?: string;
}

export interface SearchMcpServersOutput {
  servers: McpRegistryServer[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

/**
 * SearchMcpServersUseCase
 * Searches the MCP registry for servers matching the query
 *
 * SOLID Principles:
 * - SRP: Only responsible for server search logic
 * - DIP: Depends on IMcpRegistryClient interface
 */
@injectable()
export class SearchMcpServersUseCase {
  constructor(
    @inject('IMcpRegistryClient') private readonly registryClient: IMcpRegistryClient
  ) {}

  async execute(input: SearchMcpServersInput): Promise<SearchMcpServersOutput> {
    const { query, updatedSince, latestOnly, limit = 20, cursor } = input;

    const result = await this.registryClient.searchServers({
      search: query,
      updatedSince,
      version: latestOnly ? 'latest' : undefined,
      limit,
      cursor,
    });

    return {
      servers: result.servers,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      total: result.total,
    };
  }
}
