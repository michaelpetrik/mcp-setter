/**
 * Use Case: CopyMcpConfigUseCase
 * Copy an MCP server config from one client to another
 */

import { injectable, inject } from 'tsyringe';
import { IConfigManager } from '@/features/mcp-installation/domain/IConfigManager';
import { ICredentialsManager } from '@/features/credentials-management/domain/ICredentialsManager';

export interface CopyMcpConfigInput {
  sourceConfigPath: string;
  targetConfigPath: string;
  serverName: string;
  copyCredentials?: boolean;
  skipBackup?: boolean;
}

export interface CopyMcpConfigOutput {
  success: boolean;
  serverName: string;
  sourceConfigPath: string;
  targetConfigPath: string;
  credentialsCopied: boolean;
  backupPath?: string;
  message: string;
}

/**
 * CopyMcpConfigUseCase
 * Copies an MCP server configuration from one client to another
 *
 * SOLID Principles:
 * - SRP: Only responsible for copying configs
 * - DIP: Depends on interfaces
 */
@injectable()
export class CopyMcpConfigUseCase {
  constructor(
    @inject('IConfigManager') private readonly configManager: IConfigManager,
    @inject('ICredentialsManager') private readonly credentialsManager: ICredentialsManager
  ) {}

  async execute(input: CopyMcpConfigInput): Promise<CopyMcpConfigOutput> {
    const {
      sourceConfigPath,
      targetConfigPath,
      serverName,
      copyCredentials = true,
      skipBackup = false,
    } = input;

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

    // Backup target config
    let backupPath: string | undefined;
    if (!skipBackup) {
      try {
        backupPath = await this.configManager.backupConfig(targetConfigPath);
      } catch (error) {
        // Ignore if target doesn't exist yet
      }
    }

    // Add server to target
    await this.configManager.addServer(targetConfigPath, serverName, server);

    // Copy credentials if requested
    let credentialsCopied = false;
    if (copyCredentials) {
      const sourceCredentials = await this.credentialsManager.loadCredentials(sourceConfigPath);
      if (Object.keys(sourceCredentials).length > 0) {
        await this.credentialsManager.saveCredentials(targetConfigPath, sourceCredentials);
        credentialsCopied = true;
      }
    }

    return {
      success: true,
      serverName,
      sourceConfigPath,
      targetConfigPath,
      credentialsCopied,
      backupPath,
      message: `Successfully copied ${serverName} from ${sourceConfigPath} to ${targetConfigPath}`,
    };
  }
}
