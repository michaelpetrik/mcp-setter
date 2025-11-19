/**
 * Shared Infrastructure Interface: IConfigLocator
 * Abstract config path location operations following DIP
 */

import { ClientType } from '../../domain/value-objects/ClientType';
import { OperatingSystem } from '../../domain/value-objects/OperatingSystem';

export interface ConfigLocation {
  path: string;
  exists: boolean;
  isProjectSpecific: boolean;
  projectPath?: string;
}

/**
 * IConfigLocator Interface
 * Abstraction for locating client configuration files
 */
export interface IConfigLocator {
  /**
   * Get the global config path for a client on a specific OS
   */
  getGlobalConfigPath(clientType: ClientType, os: OperatingSystem): string;

  /**
   * Get the project-specific config path for a client (if supported)
   * Returns undefined if client doesn't support project configs
   */
  getProjectConfigPath(
    clientType: ClientType,
    projectPath: string,
    os: OperatingSystem
  ): string | undefined;

  /**
   * Find all possible config locations for a client
   * Includes both global and project-specific paths
   */
  findConfigLocations(
    clientType: ClientType,
    os: OperatingSystem,
    projectPath?: string
  ): Promise<ConfigLocation[]>;

  /**
   * Get the directory where .env files should be stored for a client
   * Typically the same directory as the config file
   */
  getEnvFileDirectory(configPath: string): string;
}
