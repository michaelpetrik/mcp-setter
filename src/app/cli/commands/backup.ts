/**
 * CLI Command: backup
 * Create or restore MCP configuration backups
 */

import { container } from '../di-container';
import { CreateBackupUseCase } from '@/features/backup-management/application/CreateBackupUseCase';
import { RestoreBackupUseCase } from '@/features/backup-management/application/RestoreBackupUseCase';
import * as output from '../utils/output';
import { detectOS, getCurrentWorkingDirectory } from '../utils/os-helper';

export interface BackupCommandOptions {
  output?: string;
  projectPath?: string;
  json?: boolean;
}

export interface RestoreCommandOptions {
  input: string;
  overwrite?: boolean;
  skipBackup?: boolean;
  json?: boolean;
}

/**
 * Execute the backup command
 */
export async function backupCommand(options: BackupCommandOptions): Promise<void> {
  const { output: outputPath, projectPath, json: jsonOutput } = options;

  try {
    const os = detectOS();
    const useCase = container.resolve(CreateBackupUseCase);

    output.info('Creating backup...\n');

    const result = await useCase.execute({
      operatingSystem: os,
      projectPath: projectPath || getCurrentWorkingDirectory(),
      outputPath,
    });

    if (jsonOutput) {
      output.json(result);
      return;
    }

    output.success(`Backup created: ${result.filePath}`);
    output.info(`Clients backed up: ${result.clientCount}`);
    output.info(`Total servers: ${result.serverCount}`);
    console.log('');
    output.info(`Summary: ${result.snapshot.getSummary()}`);
  } catch (err) {
    output.error(`Backup failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    process.exit(1);
  }
}

/**
 * Execute the restore command
 */
export async function restoreCommand(options: RestoreCommandOptions): Promise<void> {
  const { input: inputPath, overwrite, skipBackup, json: jsonOutput } = options;

  try {
    const useCase = container.resolve(RestoreBackupUseCase);

    output.info(`Restoring from: ${inputPath}\n`);

    const result = await useCase.execute({
      backupFilePath: inputPath,
      skipBackup,
      overwriteExisting: overwrite,
    });

    if (jsonOutput) {
      output.json(result);
      return;
    }

    output.success(`Restored ${result.restoredClients} client(s), ${result.restoredServers} server(s)`);

    if (result.skippedClients > 0) {
      output.info(`Skipped ${result.skippedClients} client(s) (already exists, use --overwrite to replace)`);
    }

    if (result.errors.length > 0) {
      output.warn(`\nErrors:`);
      result.errors.forEach(err => console.log(`  - ${err}`));
    }

    if (result.success) {
      output.success('\nRestore completed successfully');
    } else {
      output.warn('\nRestore completed with errors');
    }
  } catch (err) {
    output.error(`Restore failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    process.exit(1);
  }
}
