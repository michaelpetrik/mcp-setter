/**
 * Infrastructure: MultiClientDetector
 * Orchestrates detection across all MCP clients
 */

import { injectable, inject } from 'tsyringe';
import { IClientDetector } from '../domain/IClientDetector';
import { IConfigLocator } from '@/shared/infrastructure/config-locator/IConfigLocator';
import { McpClient } from '@/shared/domain/entities/McpClient';
import { ClientType, ClientTypeVO } from '@/shared/domain/value-objects/ClientType';
import { OperatingSystem } from '@/shared/domain/value-objects/OperatingSystem';
import { ConfigPathRegistry } from '@/shared/infrastructure/config-locator/ConfigPathRegistry';

/**
 * MultiClientDetector
 * Detects all MCP clients using the config locator
 *
 * SOLID Principles:
 * - SRP: Only responsible for orchestrating client detection
 * - DIP: Depends on IConfigLocator interface
 */
@injectable()
export class MultiClientDetector implements IClientDetector {
  constructor(@inject('IConfigLocator') private readonly configLocator: IConfigLocator) {}

  async detectAll(os: OperatingSystem, projectPath?: string): Promise<McpClient[]> {
    const detectedClients: McpClient[] = [];
    const supportedClients = this.getSupportedClients();

    for (const clientType of supportedClients) {
      const client = await this.detectClient(clientType, os, projectPath);
      if (client) {
        detectedClients.push(client);
      }
    }

    return detectedClients;
  }

  async detectClient(
    clientType: ClientType,
    os: OperatingSystem,
    projectPath?: string
  ): Promise<McpClient | null> {
    // Find all possible config locations
    const locations = await this.configLocator.findConfigLocations(clientType, os, projectPath);

    // Find the first existing location (prefer project-specific if available)
    const existingLocation = locations.find(loc => loc.exists);

    if (!existingLocation) {
      return null;
    }

    // Create McpClient entity
    return new McpClient({
      clientType,
      configPath: existingLocation.path,
      isInstalled: true,
      operatingSystem: os,
      isProjectSpecific: existingLocation.isProjectSpecific,
      projectPath: existingLocation.projectPath,
    });
  }

  async isClientInstalled(clientType: ClientType, os: OperatingSystem): Promise<boolean> {
    const client = await this.detectClient(clientType, os);
    return client !== null;
  }

  getSupportedClients(): ClientType[] {
    return ConfigPathRegistry.getSupportedClients();
  }
}
