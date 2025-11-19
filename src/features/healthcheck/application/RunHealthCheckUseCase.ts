/**
 * Use Case: RunHealthCheckUseCase
 * Run health check on an MCP server
 */

import { injectable, inject } from 'tsyringe';
import { IConfigManager } from '@/features/mcp-installation/domain/IConfigManager';
import { ICredentialsManager } from '@/features/credentials-management/domain/ICredentialsManager';
import { IFileSystem } from '@/shared/infrastructure/file-system/IFileSystem';
import { HealthStatus, HealthCheckResult, HealthState } from '@/shared/domain/entities/HealthStatus';

export interface RunHealthCheckInput {
  configPath: string;
  serverName: string;
  clientType: string;
}

export interface RunHealthCheckOutput {
  healthStatus: HealthStatus;
}

/**
 * RunHealthCheckUseCase
 * Runs health checks on an MCP server configuration
 *
 * SOLID Principles:
 * - SRP: Only responsible for health checking
 * - DIP: Depends on interfaces
 */
@injectable()
export class RunHealthCheckUseCase {
  constructor(
    @inject('IConfigManager') private readonly configManager: IConfigManager,
    @inject('ICredentialsManager') private readonly credentialsManager: ICredentialsManager,
    @inject('IFileSystem') private readonly fileSystem: IFileSystem
  ) {}

  async execute(input: RunHealthCheckInput): Promise<RunHealthCheckOutput> {
    const { configPath, serverName, clientType } = input;

    const checks: HealthCheckResult[] = [];

    // Check 1: Config file exists
    const configExists = await this.fileSystem.exists(configPath);
    checks.push({
      check: 'Config file exists',
      passed: configExists,
      message: configExists ? `Config file found at ${configPath}` : `Config file not found at ${configPath}`,
    });

    if (!configExists) {
      // Early return if config doesn't exist
      const healthStatus = HealthStatus.fromChecks(serverName, clientType, checks, 'Config file not found');
      return { healthStatus };
    }

    // Check 2: Server exists in config
    const hasServer = await this.configManager.hasServer(configPath, serverName);
    checks.push({
      check: 'Server in config',
      passed: hasServer,
      message: hasServer ? `Server '${serverName}' found in config` : `Server '${serverName}' not found in config`,
    });

    if (!hasServer) {
      const healthStatus = HealthStatus.fromChecks(serverName, clientType, checks, 'Server not configured');
      return { healthStatus };
    }

    // Check 3: Server is enabled
    const servers = await this.configManager.listServers(configPath);
    const server = servers.get(serverName);
    const isEnabled = server?.isEnabled() ?? false;
    checks.push({
      check: 'Server enabled',
      passed: isEnabled,
      message: isEnabled ? 'Server is enabled' : 'Server is disabled',
    });

    // Check 4: Command is valid
    if (server) {
      const commandValid = server.command && server.command.length > 0;
      checks.push({
        check: 'Command valid',
        passed: commandValid,
        message: commandValid ? `Command: ${server.command}` : 'No command specified',
      });
    }

    // Check 5: Required credentials present
    if (server && server.env) {
      const envVars = Object.keys(server.env);
      if (envVars.length > 0) {
        const credentials = await this.credentialsManager.loadCredentials(configPath);
        const missingCreds = envVars.filter(key => {
          // Extract variable name from ${VAR} syntax
          const match = server.env?.[key]?.match(/\$\{(\w+)\}/);
          const varName = match ? match[1] : null;
          return varName && !(varName in credentials);
        });

        checks.push({
          check: 'Credentials configured',
          passed: missingCreds.length === 0,
          message:
            missingCreds.length === 0
              ? `All ${envVars.length} credentials configured`
              : `Missing credentials: ${missingCreds.join(', ')}`,
        });
      }
    }

    const healthStatus = HealthStatus.fromChecks(serverName, clientType, checks);
    return { healthStatus };
  }
}
