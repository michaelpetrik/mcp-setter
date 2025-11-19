/**
 * Use Case: InstallMcpServerUseCase
 * Install an MCP server to a client
 */

import { injectable, inject } from 'tsyringe';
import { IConfigManager } from '../domain/IConfigManager';
import { ICredentialsManager, Credentials } from '@/features/credentials-management/domain/ICredentialsManager';
import { McpRegistryServer } from '@/shared/domain/entities/McpRegistryServer';
import { McpServer } from '@/shared/domain/entities/McpServer';
import { ClientType } from '@/shared/domain/value-objects/ClientType';

export interface InstallMcpServerInput {
  registryServer: McpRegistryServer;
  clientConfigPath: string;
  clientType: ClientType;
  serverName?: string; // Custom name, defaults to registry server short name
  credentials?: Credentials;
  skipBackup?: boolean;
}

export interface InstallMcpServerOutput {
  success: boolean;
  serverName: string;
  configPath: string;
  backupPath?: string;
  credentialsSaved: boolean;
  message: string;
}

/**
 * InstallMcpServerUseCase
 * Installs an MCP server from the registry to a client config
 *
 * SOLID Principles:
 * - SRP: Only responsible for installation orchestration
 * - DIP: Depends on interfaces
 */
@injectable()
export class InstallMcpServerUseCase {
  constructor(
    @inject('IConfigManager') private readonly configManager: IConfigManager,
    @inject('ICredentialsManager') private readonly credentialsManager: ICredentialsManager
  ) {}

  async execute(input: InstallMcpServerInput): Promise<InstallMcpServerOutput> {
    const {
      registryServer,
      clientConfigPath,
      serverName: customName,
      credentials,
      skipBackup = false,
    } = input;

    // Determine server name
    const serverName = customName || registryServer.getShortName();

    // Backup existing config (unless skipped)
    let backupPath: string | undefined;
    if (!skipBackup) {
      try {
        backupPath = await this.configManager.backupConfig(clientConfigPath);
      } catch (error) {
        // Ignore backup errors if file doesn't exist yet
        if (error instanceof Error && !error.message.includes('does not exist')) {
          throw error;
        }
      }
    }

    // Convert registry server to MCP server config
    const mcpServer = this.registryServerToMcpServer(registryServer);

    // Add server to config
    await this.configManager.addServer(clientConfigPath, serverName, mcpServer);

    // Save credentials if provided
    let credentialsSaved = false;
    if (credentials && Object.keys(credentials).length > 0) {
      await this.credentialsManager.saveCredentials(clientConfigPath, credentials);
      credentialsSaved = true;
    }

    return {
      success: true,
      serverName,
      configPath: clientConfigPath,
      backupPath,
      credentialsSaved,
      message: `Successfully installed ${serverName} to ${clientConfigPath}`,
    };
  }

  /**
   * Convert registry server to MCP server config
   */
  private registryServerToMcpServer(registryServer: McpRegistryServer): McpServer {
    const pkg = registryServer.getPrimaryPackage();

    if (!pkg) {
      throw new Error(`Server ${registryServer.name} has no installable package`);
    }

    // Build command and args based on registry type
    let command: string;
    let args: string[] = [];

    switch (pkg.registryType) {
      case 'npm':
        command = 'npx';
        args = ['-y', pkg.identifier];
        break;
      case 'pypi':
        command = 'uvx';
        args = ['--from', pkg.identifier];
        break;
      default:
        // For other types, use the identifier as the command
        command = pkg.identifier;
        args = [];
    }

    // Add package arguments if specified
    if (pkg.packageArguments) {
      args.push(...pkg.packageArguments);
    }

    // Build env vars from credentials fields
    const env: Record<string, string> = {};
    const credentialFields = registryServer.getRequiredCredentials();
    for (const field of credentialFields) {
      // Use ${FIELD_NAME} syntax so they can be loaded from .env
      env[field.name] = `\${${field.name}}`;
    }

    return new McpServer({
      command,
      args,
      env: Object.keys(env).length > 0 ? env : undefined,
      disabled: false,
    });
  }
}
