/**
 * Use Case: GetMcpServerDetailsUseCase
 * Get detailed information about a specific MCP server
 */

import { injectable, inject } from 'tsyringe';
import { IMcpRegistryClient } from '@/shared/infrastructure/registry/IMcpRegistryClient';
import { McpRegistryServer } from '@/shared/domain/entities/McpRegistryServer';

export interface GetMcpServerDetailsInput {
  serverName: string;
  version?: string;
}

export interface GetMcpServerDetailsOutput {
  server: McpRegistryServer | null;
  found: boolean;
}

/**
 * GetMcpServerDetailsUseCase
 * Retrieves detailed information about a specific MCP server
 *
 * SOLID Principles:
 * - SRP: Only responsible for retrieving server details
 * - DIP: Depends on IMcpRegistryClient interface
 */
@injectable()
export class GetMcpServerDetailsUseCase {
  constructor(
    @inject('IMcpRegistryClient') private readonly registryClient: IMcpRegistryClient
  ) {}

  async execute(input: GetMcpServerDetailsInput): Promise<GetMcpServerDetailsOutput> {
    const { serverName, version } = input;

    const server = await this.registryClient.getServer(serverName, version);

    return {
      server,
      found: server !== null,
    };
  }
}
