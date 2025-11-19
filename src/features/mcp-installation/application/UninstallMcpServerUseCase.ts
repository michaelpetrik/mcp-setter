/**
 * Use Case: UninstallMcpServerUseCase
 * Uninstall an MCP server from a client
 */

import { injectable, inject } from 'tsyringe';
import { IConfigManager } from '../domain/IConfigManager';

export interface UninstallMcpServerInput {
  configPath: string;
  serverName: string;
  skipBackup?: boolean;
}

export interface UninstallMcpServerOutput {
  success: boolean;
  serverName: string;
  configPath: string;
  backupPath?: string;
  message: string;
}

/**
 * UninstallMcpServerUseCase
 * Uninstalls an MCP server from a client config
 *
 * SOLID Principles:
 * - SRP: Only responsible for uninstallation
 * - DIP: Depends on IConfigManager interface
 */
@injectable()
export class UninstallMcpServerUseCase {
  constructor(@inject('IConfigManager') private readonly configManager: IConfigManager) {}

  async execute(input: UninstallMcpServerInput): Promise<UninstallMcpServerOutput> {
    const { configPath, serverName, skipBackup = false } = input;

    // Check if server exists
    const exists = await this.configManager.hasServer(configPath, serverName);
    if (!exists) {
      throw new Error(`Server '${serverName}' not found in ${configPath}`);
    }

    // Backup existing config (unless skipped)
    let backupPath: string | undefined;
    if (!skipBackup) {
      backupPath = await this.configManager.backupConfig(configPath);
    }

    // Remove server
    await this.configManager.removeServer(configPath, serverName);

    return {
      success: true,
      serverName,
      configPath,
      backupPath,
      message: `Successfully uninstalled ${serverName} from ${configPath}`,
    };
  }
}
