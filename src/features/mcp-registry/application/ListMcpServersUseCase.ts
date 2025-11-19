/**
 * Use Case: ListMcpServersUseCase
 * List all available MCP servers with pagination
 */

import { injectable, inject } from 'tsyringe';
import { IMcpRegistryClient } from '@/shared/infrastructure/registry/IMcpRegistryClient';
import { McpRegistryServer } from '@/shared/domain/entities/McpRegistryServer';

export interface ListMcpServersInput {
  limit?: number;
  cursor?: string;
}

export interface ListMcpServersOutput {
  servers: McpRegistryServer[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

/**
 * ListMcpServersUseCase
 * Lists all available MCP servers from the registry with pagination
 *
 * SOLID Principles:
 * - SRP: Only responsible for listing servers
 * - DIP: Depends on IMcpRegistryClient interface
 */
@injectable()
export class ListMcpServersUseCase {
  constructor(
    @inject('IMcpRegistryClient') private readonly registryClient: IMcpRegistryClient
  ) {}

  async execute(input: ListMcpServersInput = {}): Promise<ListMcpServersOutput> {
    const { limit = 20, cursor } = input;

    const result = await this.registryClient.listServers(limit, cursor);

    return {
      servers: result.servers,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      total: result.total,
    };
  }
}
