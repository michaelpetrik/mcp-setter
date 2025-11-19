/**
 * Shared Infrastructure Implementation: NodeConfigLocator
 * Concrete implementation for locating config files
 */

import * as path from 'node:path';
import { injectable, inject } from 'tsyringe';
import { IConfigLocator, ConfigLocation } from './IConfigLocator';
import { IFileSystem } from '../file-system/IFileSystem';
import { ClientType } from '../../domain/value-objects/ClientType';
import { OperatingSystem } from '../../domain/value-objects/OperatingSystem';
import { ConfigPathRegistry } from './ConfigPathRegistry';

/**
 * Node.js Config Locator
 * Locates config files for MCP clients on the file system
 *
 * SOLID Principles:
 * - SRP: Only responsible for locating config files
 * - DIP: Depends on IFileSystem interface
 */
@injectable()
export class NodeConfigLocator implements IConfigLocator {
  constructor(@inject('IFileSystem') private readonly fileSystem: IFileSystem) {}

  getGlobalConfigPath(clientType: ClientType, os: OperatingSystem): string {
    return ConfigPathRegistry.getGlobalConfigPath(clientType, os);
  }

  getProjectConfigPath(
    clientType: ClientType,
    projectPath: string,
    os: OperatingSystem
  ): string | undefined {
    if (!ConfigPathRegistry.supportsProjectConfig(clientType)) {
      return undefined;
    }

    return ConfigPathRegistry.getProjectConfigPath(clientType, projectPath);
  }

  async findConfigLocations(
    clientType: ClientType,
    os: OperatingSystem,
    projectPath?: string
  ): Promise<ConfigLocation[]> {
    const locations: ConfigLocation[] = [];

    // Check global config
    try {
      const globalPath = this.getGlobalConfigPath(clientType, os);
      const exists = await this.fileSystem.exists(globalPath);

      locations.push({
        path: globalPath,
        exists,
        isProjectSpecific: false,
      });
    } catch (error) {
      // Ignore if global path not defined for this OS
    }

    // Check project-specific config if project path provided
    if (projectPath) {
      const projectConfigPath = this.getProjectConfigPath(clientType, projectPath, os);

      if (projectConfigPath) {
        const exists = await this.fileSystem.exists(projectConfigPath);

        locations.push({
          path: projectConfigPath,
          exists,
          isProjectSpecific: true,
          projectPath,
        });
      }
    }

    return locations;
  }

  getEnvFileDirectory(configPath: string): string {
    // .env files should be stored in the same directory as the config file
    return path.dirname(configPath);
  }
}
