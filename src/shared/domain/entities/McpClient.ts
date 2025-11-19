/**
 * Shared Domain Entity: McpClient
 * Represents a detected MCP client on the system
 */

import { z } from 'zod';
import { ClientType, ClientTypeVO } from '../value-objects/ClientType';
import { OperatingSystem } from '../value-objects/OperatingSystem';

export const McpClientSchema = z.object({
  clientType: z.nativeEnum(ClientType),
  configPath: z.string().min(1, 'Config path is required'),
  isInstalled: z.boolean(),
  version: z.string().optional(),
  operatingSystem: z.nativeEnum(OperatingSystem),
  isProjectSpecific: z.boolean().default(false),
  projectPath: z.string().optional(),
});

export type McpClientConfig = z.infer<typeof McpClientSchema>;

/**
 * McpClient Entity
 * Represents a detected MCP client installation
 *
 * SOLID Principles:
 * - SRP: Only responsible for client detection metadata
 * - OCP: Can be extended but not modified
 */
export class McpClient {
  private readonly _clientType: ClientTypeVO;
  private readonly _configPath: string;
  private readonly _isInstalled: boolean;
  private readonly _version?: string;
  private readonly _operatingSystem: OperatingSystem;
  private readonly _isProjectSpecific: boolean;
  private readonly _projectPath?: string;

  constructor(config: McpClientConfig) {
    const validated = McpClientSchema.parse(config);

    this._clientType = ClientTypeVO.fromString(validated.clientType);
    this._configPath = validated.configPath;
    this._isInstalled = validated.isInstalled;
    this._version = validated.version;
    this._operatingSystem = validated.operatingSystem;
    this._isProjectSpecific = validated.isProjectSpecific;
    this._projectPath = validated.projectPath;

    this.validateBusinessRules();
  }

  // Getters
  get clientType(): ClientTypeVO {
    return this._clientType;
  }

  get configPath(): string {
    return this._configPath;
  }

  get isInstalled(): boolean {
    return this._isInstalled;
  }

  get version(): string | undefined {
    return this._version;
  }

  get operatingSystem(): OperatingSystem {
    return this._operatingSystem;
  }

  get isProjectSpecific(): boolean {
    return this._isProjectSpecific;
  }

  get projectPath(): string | undefined {
    return this._projectPath;
  }

  /**
   * Business rule validation
   */
  private validateBusinessRules(): void {
    // If project-specific, must have project path
    if (this._isProjectSpecific && !this._projectPath) {
      throw new Error('Project-specific client must have a project path');
    }

    // If not project-specific, should not have project path
    if (!this._isProjectSpecific && this._projectPath) {
      throw new Error('Global client should not have a project path');
    }
  }

  /**
   * Get display name
   */
  getDisplayName(): string {
    const name = this._clientType.getDisplayName();
    if (this._isProjectSpecific && this._projectPath) {
      const projectName = this._projectPath.split('/').pop() || this._projectPath;
      return `${name} (${projectName})`;
    }
    return name;
  }

  /**
   * Get a unique identifier for this client instance
   */
  getIdentifier(): string {
    if (this._isProjectSpecific && this._projectPath) {
      return `${this._clientType.getValue()}:${this._projectPath}`;
    }
    return this._clientType.getValue();
  }

  /**
   * Check if this is a global (system-wide) client
   */
  isGlobal(): boolean {
    return !this._isProjectSpecific;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): McpClientConfig {
    return {
      clientType: this._clientType.getValue(),
      configPath: this._configPath,
      isInstalled: this._isInstalled,
      version: this._version,
      operatingSystem: this._operatingSystem,
      isProjectSpecific: this._isProjectSpecific,
      projectPath: this._projectPath,
    };
  }

  equals(other: McpClient): boolean {
    return this.getIdentifier() === other.getIdentifier();
  }
}
