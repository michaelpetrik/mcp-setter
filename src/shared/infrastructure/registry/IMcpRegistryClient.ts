/**
 * Shared Infrastructure Interface: IMcpRegistryClient
 * Abstract MCP registry operations following DIP
 */

import { McpRegistryServer } from '../../domain/entities/McpRegistryServer';

export interface RegistrySearchOptions {
  search?: string;
  updatedSince?: Date;
  version?: 'latest';
  limit?: number;
  cursor?: string;
}

export interface RegistrySearchResponse {
  servers: McpRegistryServer[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

/**
 * IMcpRegistryClient Interface
 * Abstraction for MCP registry API operations
 */
export interface IMcpRegistryClient {
  /**
   * Search for MCP servers in the registry
   */
  searchServers(options?: RegistrySearchOptions): Promise<RegistrySearchResponse>;

  /**
   * Get a specific MCP server by name
   */
  getServer(serverName: string, version?: string): Promise<McpRegistryServer | null>;

  /**
   * Get the latest version of a server
   */
  getLatestServer(serverName: string): Promise<McpRegistryServer | null>;

  /**
   * List all servers (with pagination)
   */
  listServers(limit?: number, cursor?: string): Promise<RegistrySearchResponse>;
}
