/**
 * Shared Domain Entity: McpConfig
 * Represents the complete MCP configuration for a client
 */

import { z } from 'zod';
import { McpServer, McpServerSchema } from './McpServer';
import { ConfigFormatVO } from '../value-objects/ConfigFormat';

export const McpConfigSchema = z.object({
  mcpServers: z.record(z.string(), McpServerSchema),
  // Additional client-specific metadata can be added here
  metadata: z.record(z.unknown()).optional(),
});

export type McpConfigData = z.infer<typeof McpConfigSchema>;

/**
 * McpConfig Entity
 * Represents the complete configuration file for an MCP client
 *
 * SOLID Principles:
 * - SRP: Only responsible for MCP configuration structure
 * - OCP: Can be extended but not modified
 */
export class McpConfig {
  private readonly _mcpServers: Map<string, McpServer>;
  private readonly _metadata?: Record<string, unknown>;

  constructor(config: McpConfigData) {
    const validated = McpConfigSchema.parse(config);

    // Convert record to Map with McpServer instances
    this._mcpServers = new Map(
      Object.entries(validated.mcpServers).map(([name, serverConfig]) => [
        name,
        new McpServer(serverConfig),
      ])
    );

    this._metadata = validated.metadata;
  }

  /**
   * Create an empty config
   */
  static empty(): McpConfig {
    return new McpConfig({ mcpServers: {} });
  }

  /**
   * Create from raw JSON object (used when parsing config files)
   */
  static fromJSON(json: unknown): McpConfig {
    if (typeof json !== 'object' || json === null) {
      throw new Error('Invalid config: must be an object');
    }

    const data = json as Record<string, unknown>;

    // Handle both { mcpServers: {...} } and direct { "server-name": {...} } formats
    if ('mcpServers' in data) {
      return new McpConfig(data as McpConfigData);
    } else {
      // Legacy/direct format - wrap in mcpServers
      return new McpConfig({ mcpServers: data });
    }
  }

  // Getters
  get mcpServers(): ReadonlyMap<string, McpServer> {
    return this._mcpServers;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  /**
   * Get all server names
   */
  getServerNames(): string[] {
    return Array.from(this._mcpServers.keys());
  }

  /**
   * Get a specific server by name
   */
  getServer(name: string): McpServer | undefined {
    return this._mcpServers.get(name);
  }

  /**
   * Check if a server exists
   */
  hasServer(name: string): boolean {
    return this._mcpServers.has(name);
  }

  /**
   * Get count of servers
   */
  getServerCount(): number {
    return this._mcpServers.size;
  }

  /**
   * Get all enabled servers
   */
  getEnabledServers(): Map<string, McpServer> {
    const enabled = new Map<string, McpServer>();
    for (const [name, server] of this._mcpServers.entries()) {
      if (server.isEnabled()) {
        enabled.set(name, server);
      }
    }
    return enabled;
  }

  /**
   * Add or update a server
   * Returns a new McpConfig instance (immutable)
   */
  addServer(name: string, server: McpServer): McpConfig {
    const servers = new Map(this._mcpServers);
    servers.set(name, server);

    return new McpConfig({
      mcpServers: Object.fromEntries(
        Array.from(servers.entries()).map(([n, s]) => [n, s.toJSON()])
      ),
      metadata: this._metadata,
    });
  }

  /**
   * Remove a server
   * Returns a new McpConfig instance (immutable)
   */
  removeServer(name: string): McpConfig {
    const servers = new Map(this._mcpServers);
    servers.delete(name);

    return new McpConfig({
      mcpServers: Object.fromEntries(
        Array.from(servers.entries()).map(([n, s]) => [n, s.toJSON()])
      ),
      metadata: this._metadata,
    });
  }

  /**
   * Merge with another config
   * Servers from the other config will override existing ones
   */
  merge(other: McpConfig): McpConfig {
    const merged = new Map(this._mcpServers);

    for (const [name, server] of other._mcpServers.entries()) {
      merged.set(name, server);
    }

    return new McpConfig({
      mcpServers: Object.fromEntries(
        Array.from(merged.entries()).map(([n, s]) => [n, s.toJSON()])
      ),
      metadata: { ...this._metadata, ...other._metadata },
    });
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): McpConfigData {
    return {
      mcpServers: Object.fromEntries(
        Array.from(this._mcpServers.entries()).map(([name, server]) => [name, server.toJSON()])
      ),
      metadata: this._metadata,
    };
  }

  /**
   * Convert to string for writing to file
   */
  toString(format: ConfigFormatVO = ConfigFormatVO.json(), pretty: boolean = true): string {
    const data = this.toJSON();

    switch (format.getValue()) {
      case 'json': {
        const jsonData = { mcpServers: data.mcpServers };
        return pretty ? JSON.stringify(jsonData, null, 2) : JSON.stringify(jsonData);
      }
      case 'yaml':
        // TODO: Implement YAML serialization when needed
        throw new Error('YAML format not yet implemented');
      case 'toml':
        // TODO: Implement TOML serialization when needed
        throw new Error('TOML format not yet implemented');
      default:
        throw new Error(`Unsupported format: ${format.getValue()}`);
    }
  }

  /**
   * Check if config is empty
   */
  isEmpty(): boolean {
    return this._mcpServers.size === 0;
  }
}
