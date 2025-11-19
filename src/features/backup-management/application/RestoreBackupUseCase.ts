/**
 * Use Case: RestoreBackupUseCase
 * Restore MCP configurations from a backup snapshot
 */

import { injectable, inject } from 'tsyringe';
import { IConfigManager } from '@/features/mcp-installation/domain/IConfigManager';
import { IFileSystem } from '@/shared/infrastructure/file-system/IFileSystem';
import { BackupSnapshot } from '@/shared/domain/entities/BackupSnapshot';
import { McpConfig } from '@/shared/domain/entities/McpConfig';

export interface RestoreBackupInput {
  backupFilePath: string;
  skipBackup?: boolean;
  overwriteExisting?: boolean;
}

export interface RestoreBackupOutput {
  success: boolean;
  restoredClients: number;
  restoredServers: number;
  skippedClients: number;
  errors: string[];
}

/**
 * RestoreBackupUseCase
 * Restores MCP configurations from a backup file
 *
 * SOLID Principles:
 * - SRP: Only responsible for restoring backups
 * - DIP: Depends on interfaces
 */
@injectable()
export class RestoreBackupUseCase {
  constructor(
    @inject('IConfigManager') private readonly configManager: IConfigManager,
    @inject('IFileSystem') private readonly fileSystem: IFileSystem
  ) {}

  async execute(input: RestoreBackupInput): Promise<RestoreBackupOutput> {
    const { backupFilePath, skipBackup = false, overwriteExisting = false } = input;

    // Read backup file
    const backupContent = await this.fileSystem.readFile(backupFilePath);
    const snapshot = BackupSnapshot.fromString(backupContent);

    let restoredClients = 0;
    let restoredServers = 0;
    let skippedClients = 0;
    const errors: string[] = [];

    // Restore each client
    for (const clientBackup of snapshot.clients) {
      try {
        const configExists = await this.fileSystem.exists(clientBackup.configPath);

        if (configExists && !overwriteExisting) {
          skippedClients++;
          continue;
        }

        // Backup existing config if requested
        if (configExists && !skipBackup) {
          try {
            await this.configManager.backupConfig(clientBackup.configPath);
          } catch (error) {
            errors.push(`Failed to backup ${clientBackup.configPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        // Restore config
        const config = new McpConfig(clientBackup.config);
        await this.configManager.writeConfig(clientBackup.configPath, config);

        // Restore env files
        if (clientBackup.envFiles) {
          for (const [envPath, envContent] of Object.entries(clientBackup.envFiles)) {
            await this.fileSystem.writeFile(envPath, envContent);
          }
        }

        restoredClients++;
        restoredServers += Object.keys(clientBackup.config.mcpServers).length;
      } catch (error) {
        errors.push(
          `Failed to restore ${clientBackup.clientType}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      success: errors.length === 0,
      restoredClients,
      restoredServers,
      skippedClients,
      errors,
    };
  }
}
