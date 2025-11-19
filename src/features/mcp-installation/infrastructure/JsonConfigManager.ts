/**
 * Infrastructure: JsonConfigManager
 * Manages JSON MCP configuration files
 */

import * as path from 'node:path';
import { injectable, inject } from 'tsyringe';
import { IConfigManager } from '../domain/IConfigManager';
import { IFileSystem } from '@/shared/infrastructure/file-system/IFileSystem';
import { McpConfig } from '@/shared/domain/entities/McpConfig';
import { McpServer } from '@/shared/domain/entities/McpServer';

/**
 * JsonConfigManager
 * Manages MCP configs in JSON format
 *
 * SOLID Principles:
 * - SRP: Only responsible for JSON config file operations
 * - DIP: Depends on IFileSystem interface
 */
@injectable()
export class JsonConfigManager implements IConfigManager {
  constructor(@inject('IFileSystem') private readonly fileSystem: IFileSystem) {}

  async readConfig(configPath: string): Promise<McpConfig> {
    const exists = await this.fileSystem.exists(configPath);

    if (!exists) {
      // Return empty config if file doesn't exist
      return McpConfig.empty();
    }

    const content = await this.fileSystem.readFile(configPath);
    const json = JSON.parse(content);

    return McpConfig.fromJSON(json);
  }

  async writeConfig(configPath: string, config: McpConfig): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(configPath);
    await this.fileSystem.ensureDir(dir);

    // Convert to JSON string (pretty-printed)
    const content = config.toString();

    // Write to file
    await this.fileSystem.writeFile(configPath, content);
  }

  async backupConfig(configPath: string): Promise<string> {
    const exists = await this.fileSystem.exists(configPath);

    if (!exists) {
      throw new Error(`Config file does not exist: ${configPath}`);
    }

    // Create backup with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${configPath}.backup-${timestamp}`;

    // Copy file
    await this.fileSystem.copyFile(configPath, backupPath);

    return backupPath;
  }

  async addServer(configPath: string, serverName: string, server: McpServer): Promise<void> {
    // Read existing config
    const config = await this.readConfig(configPath);

    // Add server
    const updatedConfig = config.addServer(serverName, server);

    // Write back
    await this.writeConfig(configPath, updatedConfig);
  }

  async removeServer(configPath: string, serverName: string): Promise<void> {
    // Read existing config
    const config = await this.readConfig(configPath);

    // Remove server
    const updatedConfig = config.removeServer(serverName);

    // Write back
    await this.writeConfig(configPath, updatedConfig);
  }

  async hasServer(configPath: string, serverName: string): Promise<boolean> {
    const config = await this.readConfig(configPath);
    return config.hasServer(serverName);
  }

  async listServers(configPath: string): Promise<Map<string, McpServer>> {
    const config = await this.readConfig(configPath);
    return new Map(config.mcpServers);
  }
}
