/**
 * Domain Interface: IClientDetector
 * Abstraction for client detection operations
 */

import { McpClient } from '@/shared/domain/entities/McpClient';
import { ClientType } from '@/shared/domain/value-objects/ClientType';
import { OperatingSystem } from '@/shared/domain/value-objects/OperatingSystem';

/**
 * IClientDetector Interface
 * Defines operations for detecting MCP clients
 */
export interface IClientDetector {
  /**
   * Detect all installed MCP clients on the system
   */
  detectAll(os: OperatingSystem, projectPath?: string): Promise<McpClient[]>;

  /**
   * Detect a specific MCP client
   */
  detectClient(
    clientType: ClientType,
    os: OperatingSystem,
    projectPath?: string
  ): Promise<McpClient | null>;

  /**
   * Check if a specific client is installed
   */
  isClientInstalled(clientType: ClientType, os: OperatingSystem): Promise<boolean>;

  /**
   * Get all supported client types
   */
  getSupportedClients(): ClientType[];
}
