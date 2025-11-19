/**
 * CLI Command: install
 * Install an MCP server to a client
 */

import { container } from '../di-container';
import { GetMcpServerDetailsUseCase } from '@/features/mcp-registry/application/GetMcpServerDetailsUseCase';
import { DetectSpecificClientUseCase } from '@/features/client-detection/application/DetectSpecificClientUseCase';
import { InstallMcpServerUseCase } from '@/features/mcp-installation/application/InstallMcpServerUseCase';
import { ClientType } from '@/shared/domain/value-objects/ClientType';
import * as output from '../utils/output';
import { detectOS } from '../utils/os-helper';
import { withTelemetry } from '../utils/telemetry-helper';
import { ITelemetryService } from '@/shared/infrastructure/telemetry/ITelemetryService';
import { TelemetryEventCategory } from '@/shared/domain/events/TelemetryEvents';

export interface InstallCommandOptions {
  serverName: string;
  client: string;
  customName?: string;
  skipBackup?: boolean;
  json?: boolean;
}

/**
 * Execute the install command
 */
export async function installCommand(options: InstallCommandOptions): Promise<void> {
  const { serverName, client, customName, skipBackup, json: jsonOutput } = options;

  // Track telemetry
  await withTelemetry('install', options, async () => {
    try {
      const telemetryService = container.resolve<ITelemetryService>('ITelemetryService');
      const startTime = Date.now();

      // Track install started
      await telemetryService.trackEvent(TelemetryEventCategory.MCP_INSTALL_STARTED, {
        client_type: client,
        mcp_server_name: serverName,
        custom_name_used: !!customName,
        backup_created: !skipBackup,
      });

      try {
    const os = detectOS();

    // Resolve use cases
    const getServerUseCase = container.resolve(GetMcpServerDetailsUseCase);
    const detectClientUseCase = container.resolve(DetectSpecificClientUseCase);
    const installUseCase = container.resolve(InstallMcpServerUseCase);

    // Get server from registry
    output.info(`Fetching server '${serverName}' from registry...`);
    const serverResult = await getServerUseCase.execute({ serverName });

    if (!serverResult.found || !serverResult.server) {
      output.error(`Server '${serverName}' not found in registry`);
      process.exit(1);
    }

    const registryServer = serverResult.server;
    output.success(`Found: ${registryServer.getDisplayName()}`);
    console.log(`  Description: ${registryServer.description}`);

    // Detect client
    output.info(`\nDetecting ${client} client...`);
    const clientType = ClientType[client.toUpperCase().replace(/-/g, '_') as keyof typeof ClientType];
    if (!clientType) {
      output.error(`Unknown client type: ${client}`);
      output.info('Supported clients: claude-desktop, claude-cli, cursor, continue, gemini-cli');
      process.exit(1);
    }

    const clientResult = await detectClientUseCase.execute({
      clientType,
      operatingSystem: os,
    });

    if (!clientResult.found || !clientResult.client) {
      output.error(`Client '${client}' not detected on this system`);
      process.exit(1);
    }

    output.success(`Found: ${clientResult.client.getDisplayName()}`);
    console.log(`  Config: ${clientResult.client.configPath}`);

    // Check for required credentials
    const credentials = registryServer.getRequiredCredentials();
    if (credentials.length > 0) {
      output.warn(`\nThis server requires ${credentials.length} credential(s):`);
      credentials.forEach(cred => {
        console.log(`  - ${cred.name}${cred.isRequired ? ' (required)' : ''}`);
        if (cred.description) {
          console.log(`    ${cred.description}`);
        }
      });
      output.info('\nCredentials can be added later using: mcp-setter credentials');
    }

    // Install
    output.info('\nInstalling...');
    const result = await installUseCase.execute({
      registryServer,
      clientConfigPath: clientResult.client.configPath,
      clientType,
      serverName: customName,
      skipBackup,
    });

    if (jsonOutput) {
      output.json(result);
      return;
    }

    output.success(`\n${result.message}`);
    if (result.backupPath) {
      output.info(`Backup created: ${result.backupPath}`);
    }

    output.info(`\nNext steps:`);
    output.list([
      credentials.length > 0
        ? `Set credentials: mcp-setter credentials --config "${result.configPath}" --server "${result.serverName}"`
        : `Server ready to use!`,
      `Restart ${client} to load the new server`,
    ]);

        // Track install completed
        const duration = Date.now() - startTime;
        await telemetryService.trackEvent(TelemetryEventCategory.MCP_INSTALL_COMPLETED, {
          client_type: client,
          mcp_server_name: serverName,
          mcp_server_version: registryServer.version,
          custom_name_used: !!customName,
          backup_created: !!result.backupPath,
          duration_ms: duration,
        });
      } catch (err) {
        // Track install failed
        const duration = Date.now() - startTime;
        await telemetryService.trackEvent(TelemetryEventCategory.MCP_INSTALL_FAILED, {
          client_type: client,
          mcp_server_name: serverName,
          duration_ms: duration,
        });

        output.error(`Installation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        process.exit(1);
      }
    } catch (err) {
      output.error(`Installation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      process.exit(1);
    }
  });
}
