/**
 * Domain Interface: IConfigManager
 * Abstraction for MCP config file operations
 */

import { McpConfig } from '@/shared/domain/entities/McpConfig';
import { McpServer } from '@/shared/domain/entities/McpServer';

/**
 * IConfigManager Interface
 * Defines operations for managing MCP configuration files
 */
export interface IConfigManager {
  /**
   * Read config from file
   */
  readConfig(configPath: string): Promise<McpConfig>;

  /**
   * Write config to file
   */
  writeConfig(configPath: string, config: McpConfig): Promise<void>;

  /**
   * Backup config file
   */
  backupConfig(configPath: string): Promise<string>;

  /**
   * Add or update an MCP server in the config
   */
  addServer(configPath: string, serverName: string, server: McpServer): Promise<void>;

  /**
   * Remove an MCP server from the config
   */
  removeServer(configPath: string, serverName: string): Promise<void>;

  /**
   * Check if a server exists in the config
   */
  hasServer(configPath: string, serverName: string): Promise<boolean>;

  /**
   * List all servers in the config
   */
  listServers(configPath: string): Promise<Map<string, McpServer>>;
}
