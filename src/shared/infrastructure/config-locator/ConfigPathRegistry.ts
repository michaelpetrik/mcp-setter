/**
 * Shared Infrastructure: ConfigPathRegistry
 * Registry of config paths per client and OS
 */

import * as path from 'node:path';
import * as os from 'node:os';
import { ClientType } from '../../domain/value-objects/ClientType';
import { OperatingSystem } from '../../domain/value-objects/OperatingSystem';

/**
 * Config path mapping structure
 */
interface ConfigPathMapping {
  [key: string]: {
    // key is ClientType
    [key: string]: string; // key is OperatingSystem, value is path template
  };
}

/**
 * ConfigPathRegistry
 * Centralized registry of config paths for all clients and OSes
 *
 * SOLID Principles:
 * - SRP: Only responsible for path mapping
 * - OCP: Can be extended with new clients without modification (configuration-based)
 */
export class ConfigPathRegistry {
  private static readonly HOME_DIR = os.homedir();

  /**
   * Global config paths per client and OS
   * Path templates support variables:
   * - ${HOME} - User home directory
   * - ${APPDATA} - Windows AppData (only on Windows)
   * - ${LOCALAPPDATA} - Windows LocalAppData (only on Windows)
   */
  private static readonly GLOBAL_CONFIG_PATHS: ConfigPathMapping = {
    [ClientType.CLAUDE_DESKTOP]: {
      [OperatingSystem.MACOS]: `${ConfigPathRegistry.HOME_DIR}/Library/Application Support/Claude/claude_desktop_config.json`,
      [OperatingSystem.WINDOWS]: path.join(
        process.env.APPDATA || `${ConfigPathRegistry.HOME_DIR}/AppData/Roaming`,
        'Claude',
        'claude_desktop_config.json'
      ),
      [OperatingSystem.LINUX]: `${ConfigPathRegistry.HOME_DIR}/.config/Claude/claude_desktop_config.json`,
    },
    [ClientType.CLAUDE_CLI]: {
      [OperatingSystem.MACOS]: `${ConfigPathRegistry.HOME_DIR}/.claude.json`,
      [OperatingSystem.WINDOWS]: `${ConfigPathRegistry.HOME_DIR}/.claude.json`,
      [OperatingSystem.LINUX]: `${ConfigPathRegistry.HOME_DIR}/.claude.json`,
    },
    [ClientType.CURSOR]: {
      [OperatingSystem.MACOS]: `${ConfigPathRegistry.HOME_DIR}/Library/Application Support/Cursor/cursor_desktop_config.json`,
      [OperatingSystem.WINDOWS]: path.join(
        process.env.APPDATA || `${ConfigPathRegistry.HOME_DIR}/AppData/Roaming`,
        'Cursor',
        'cursor_desktop_config.json'
      ),
      [OperatingSystem.LINUX]: `${ConfigPathRegistry.HOME_DIR}/.config/Cursor/cursor_desktop_config.json`,
    },
    [ClientType.CONTINUE]: {
      // Continue is primarily project-based, but can have a global fallback
      [OperatingSystem.MACOS]: `${ConfigPathRegistry.HOME_DIR}/.continue/mcpServers`,
      [OperatingSystem.WINDOWS]: `${ConfigPathRegistry.HOME_DIR}/.continue/mcpServers`,
      [OperatingSystem.LINUX]: `${ConfigPathRegistry.HOME_DIR}/.continue/mcpServers`,
    },
    [ClientType.GEMINI_CLI]: {
      // TODO: Verify actual Gemini CLI config path
      [OperatingSystem.MACOS]: `${ConfigPathRegistry.HOME_DIR}/.gemini/config.json`,
      [OperatingSystem.WINDOWS]: `${ConfigPathRegistry.HOME_DIR}/.gemini/config.json`,
      [OperatingSystem.LINUX]: `${ConfigPathRegistry.HOME_DIR}/.gemini/config.json`,
    },
  };

  /**
   * Project-specific config paths
   * Relative paths from project root
   */
  private static readonly PROJECT_CONFIG_PATHS: Record<string, string> = {
    [ClientType.CLAUDE_CLI]: '.mcp.json',
    [ClientType.CURSOR]: '.cursor/mcp.json',
    [ClientType.CONTINUE]: '.continue/mcpServers',
  };

  /**
   * Get global config path for a client
   */
  static getGlobalConfigPath(clientType: ClientType, operatingSystem: OperatingSystem): string {
    const clientPaths = this.GLOBAL_CONFIG_PATHS[clientType];
    if (!clientPaths) {
      throw new Error(`No global config path defined for client: ${clientType}`);
    }

    const configPath = clientPaths[operatingSystem];
    if (!configPath) {
      throw new Error(
        `No global config path defined for client ${clientType} on OS ${operatingSystem}`
      );
    }

    return configPath;
  }

  /**
   * Get project-specific config path for a client
   */
  static getProjectConfigPath(clientType: ClientType, projectPath: string): string | undefined {
    const relativePath = this.PROJECT_CONFIG_PATHS[clientType];
    if (!relativePath) {
      return undefined;
    }

    return path.join(projectPath, relativePath);
  }

  /**
   * Check if client supports project-specific configs
   */
  static supportsProjectConfig(clientType: ClientType): boolean {
    return clientType in this.PROJECT_CONFIG_PATHS;
  }

  /**
   * Get all supported clients
   */
  static getSupportedClients(): ClientType[] {
    return Object.keys(this.GLOBAL_CONFIG_PATHS) as ClientType[];
  }

  /**
   * Get all supported operating systems for a client
   */
  static getSupportedOSes(clientType: ClientType): OperatingSystem[] {
    const clientPaths = this.GLOBAL_CONFIG_PATHS[clientType];
    if (!clientPaths) {
      return [];
    }

    return Object.keys(clientPaths) as OperatingSystem[];
  }
}
