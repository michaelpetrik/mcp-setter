/**
 * Use Case: CreateBackupUseCase
 * Create a backup snapshot of all MCP configurations
 */

import { injectable, inject } from 'tsyringe';
import { IClientDetector } from '@/features/client-detection/domain/IClientDetector';
import { IConfigManager } from '@/features/mcp-installation/domain/IConfigManager';
import { ICredentialsManager } from '@/features/credentials-management/domain/ICredentialsManager';
import { IFileSystem } from '@/shared/infrastructure/file-system/IFileSystem';
import { BackupSnapshot, BackupClientConfig } from '@/shared/domain/entities/BackupSnapshot';
import { OperatingSystem } from '@/shared/domain/value-objects/OperatingSystem';

export interface CreateBackupInput {
  operatingSystem: OperatingSystem;
  projectPath?: string;
  outputPath?: string; // If not provided, uses default naming
}

export interface CreateBackupOutput {
  snapshot: BackupSnapshot;
  filePath: string;
  clientCount: number;
  serverCount: number;
}

/**
 * CreateBackupUseCase
 * Creates a backup snapshot of all MCP configurations
 *
 * SOLID Principles:
 * - SRP: Only responsible for creating backups
 * - DIP: Depends on interfaces
 */
@injectable()
export class CreateBackupUseCase {
  constructor(
    @inject('IClientDetector') private readonly clientDetector: IClientDetector,
    @inject('IConfigManager') private readonly configManager: IConfigManager,
    @inject('ICredentialsManager') private readonly credentialsManager: ICredentialsManager,
    @inject('IFileSystem') private readonly fileSystem: IFileSystem
  ) {}

  async execute(input: CreateBackupInput): Promise<CreateBackupOutput> {
    const { operatingSystem, projectPath, outputPath } = input;

    // Detect all clients
    const clients = await this.clientDetector.detectAll(operatingSystem, projectPath);

    // Collect configs from all clients
    const backupClients: BackupClientConfig[] = [];

    for (const client of clients) {
      try {
        // Read config
        const config = await this.configManager.readConfig(client.configPath);

        // Read credentials
        const credentials = await this.credentialsManager.loadCredentials(client.configPath);

        // Create env files map
        const envFiles: Record<string, string> = {};
        if (Object.keys(credentials).length > 0) {
          const envPath = this.credentialsManager.getCredentialsPath(client.configPath);
          envFiles[envPath] = await this.fileSystem.readFile(envPath);
        }

        backupClients.push({
          clientType: client.clientType.getValue(),
          configPath: client.configPath,
          config: config.toJSON(),
          envFiles,
          isProjectSpecific: client.isProjectSpecific,
          projectPath: client.projectPath,
        });
      } catch (error) {
        // Continue even if one client fails
        console.warn(`Failed to backup client ${client.clientType.getValue()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Create snapshot
    const snapshot = BackupSnapshot.create(operatingSystem, backupClients);

    // Determine output path
    const filePath = outputPath || snapshot.getSuggestedFileName();

    // Write snapshot to file
    await this.fileSystem.writeFile(filePath, snapshot.toString());

    return {
      snapshot,
      filePath,
      clientCount: backupClients.length,
      serverCount: snapshot.getTotalServerCount(),
    };
  }
}
