/**
 * CLI Command: installed
 * List installed MCP servers for a client
 */

import { container } from '../di-container';
import { DetectSpecificClientUseCase } from '@/features/client-detection/application/DetectSpecificClientUseCase';
import { ListInstalledServersUseCase } from '@/features/mcp-installation/application/ListInstalledServersUseCase';
import { ClientType } from '@/shared/domain/value-objects/ClientType';
import * as output from '../utils/output';
import { detectOS } from '../utils/os-helper';

export interface InstalledCommandOptions {
  client: string;
  json?: boolean;
}

/**
 * Execute the installed command
 */
export async function installedCommand(options: InstalledCommandOptions): Promise<void> {
  const { client, json: jsonOutput } = options;

  try {
    const os = detectOS();

    const detectClientUseCase = container.resolve(DetectSpecificClientUseCase);
    const listServersUseCase = container.resolve(ListInstalledServersUseCase);

    // Detect client
    const clientType = ClientType[client.toUpperCase().replace(/-/g, '_') as keyof typeof ClientType];
    if (!clientType) {
      output.error(`Unknown client type: ${client}`);
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

    // List installed servers
    const result = await listServersUseCase.execute({
      configPath: clientResult.client.configPath,
    });

    if (jsonOutput) {
      output.json(result);
      return;
    }

    output.header(`Installed MCP Servers - ${clientResult.client.getDisplayName()}`);

    if (result.totalCount === 0) {
      output.warn('No MCP servers installed');
      return;
    }

    output.info(`Total: ${result.totalCount} | Enabled: ${result.enabledCount} | Disabled: ${result.disabledCount}\n`);

    result.servers.forEach((server, index) => {
      const status = server.enabled ? '✓' : '✗';
      console.log(`${index + 1}. ${status} ${server.name}`);
      console.log(`   Command: ${server.command}`);
      if (server.server.args && server.server.args.length > 0) {
        console.log(`   Args: ${server.server.args.join(' ')}`);
      }
      if (server.server.env) {
        console.log(`   Env vars: ${Object.keys(server.server.env).length}`);
      }
      console.log('');
    });

    output.success('Listing completed');
  } catch (err) {
    output.error(`Failed to list servers: ${err instanceof Error ? err.message : 'Unknown error'}`);
    process.exit(1);
  }
}
