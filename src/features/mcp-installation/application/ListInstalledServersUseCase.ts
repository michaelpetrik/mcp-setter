/**
 * Use Case: ListInstalledServersUseCase
 * List all installed MCP servers for a client
 */

import { injectable, inject } from 'tsyringe';
import { IConfigManager } from '../domain/IConfigManager';
import { McpServer } from '@/shared/domain/entities/McpServer';

export interface ListInstalledServersInput {
  configPath: string;
}

export interface InstalledServerInfo {
  name: string;
  server: McpServer;
  enabled: boolean;
  command: string;
}

export interface ListInstalledServersOutput {
  servers: InstalledServerInfo[];
  totalCount: number;
  enabledCount: number;
  disabledCount: number;
}

/**
 * ListInstalledServersUseCase
 * Lists all MCP servers installed for a client
 *
 * SOLID Principles:
 * - SRP: Only responsible for listing servers
 * - DIP: Depends on IConfigManager interface
 */
@injectable()
export class ListInstalledServersUseCase {
  constructor(@inject('IConfigManager') private readonly configManager: IConfigManager) {}

  async execute(input: ListInstalledServersInput): Promise<ListInstalledServersOutput> {
    const { configPath } = input;

    const serversMap = await this.configManager.listServers(configPath);

    const servers: InstalledServerInfo[] = Array.from(serversMap.entries()).map(
      ([name, server]) => ({
        name,
        server,
        enabled: server.isEnabled(),
        command: server.command,
      })
    );

    const enabledCount = servers.filter(s => s.enabled).length;
    const disabledCount = servers.filter(s => !s.enabled).length;

    return {
      servers,
      totalCount: servers.length,
      enabledCount,
      disabledCount,
    };
  }
}
