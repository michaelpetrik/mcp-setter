/**
 * Use Case: MoveMcpConfigUseCase
 * Move an MCP server config from one client to another
 */

import { injectable, inject } from 'tsyringe';
import { IConfigManager } from '@/features/mcp-installation/domain/IConfigManager';
import { ICredentialsManager } from '@/features/credentials-management/domain/ICredentialsManager';

export interface MoveMcpConfigInput {
  sourceConfigPath: string;
  targetConfigPath: string;
  serverName: string;
  skipBackup?: boolean;
}

export interface MoveMcpConfigOutput {
  success: boolean;
  serverName: string;
  sourceConfigPath: string;
  targetConfigPath: string;
  credentialsMoved: boolean;
  backupPaths: string[];
  message: string;
}

/**
 * MoveMcpConfigUseCase
 * Moves an MCP server configuration from one client to another
 *
 * SOLID Principles:
 * - SRP: Only responsible for moving configs
 * - DIP: Depends on interfaces
 */
@injectable()
export class MoveMcpConfigUseCase {
  constructor(
    @inject('IConfigManager') private readonly configManager: IConfigManager,
    @inject('ICredentialsManager') private readonly credentialsManager: ICredentialsManager
  ) {}

  async execute(input: MoveMcpConfigInput): Promise<MoveMcpConfigOutput> {
    const { sourceConfigPath, targetConfigPath, serverName, skipBackup = false } = input;

    // Check if server exists in source
    const sourceHasServer = await this.configManager.hasServer(sourceConfigPath, serverName);
    if (!sourceHasServer) {
      throw new Error(`Server '${serverName}' not found in source: ${sourceConfigPath}`);
    }

    // Get server from source
    const servers = await this.configManager.listServers(sourceConfigPath);
    const server = servers.get(serverName);
    if (!server) {
      throw new Error(`Failed to read server '${serverName}' from source`);
    }

    const backupPaths: string[] = [];

    // Backup both configs
    if (!skipBackup) {
      try {
        const sourceBackup = await this.configManager.backupConfig(sourceConfigPath);
        backupPaths.push(sourceBackup);
      } catch (error) {
        // Ignore
      }

      try {
        const targetBackup = await this.configManager.backupConfig(targetConfigPath);
        backupPaths.push(targetBackup);
      } catch (error) {
        // Ignore if target doesn't exist yet
      }
    }

    // Add server to target
    await this.configManager.addServer(targetConfigPath, serverName, server);

    // Move credentials
    let credentialsMoved = false;
    const sourceCredentials = await this.credentialsManager.loadCredentials(sourceConfigPath);
    if (Object.keys(sourceCredentials).length > 0) {
      await this.credentialsManager.saveCredentials(targetConfigPath, sourceCredentials);
      credentialsMoved = true;
    }

    // Remove server from source
    await this.configManager.removeServer(sourceConfigPath, serverName);

    return {
      success: true,
      serverName,
      sourceConfigPath,
      targetConfigPath,
      credentialsMoved,
      backupPaths,
      message: `Successfully moved ${serverName} from ${sourceConfigPath} to ${targetConfigPath}`,
    };
  }
}
