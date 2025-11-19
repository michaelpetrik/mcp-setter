/**
 * Shared Domain Entity: BackupSnapshot
 * Represents a complete backup of MCP configurations
 */

import { z } from 'zod';
import { McpConfigSchema } from './McpConfig';

export const BackupClientConfigSchema = z.object({
  clientType: z.string().min(1),
  configPath: z.string().min(1),
  config: McpConfigSchema,
  envFiles: z.record(z.string(), z.string()).optional(), // filename -> content
  isProjectSpecific: z.boolean().default(false),
  projectPath: z.string().optional(),
});

export type BackupClientConfig = z.infer<typeof BackupClientConfigSchema>;

export const BackupSnapshotSchema = z.object({
  version: z.string().default('1.0.0'),
  timestamp: z.date(),
  createdBy: z.string().default('mcp-setter'),
  operatingSystem: z.string(),
  clients: z.array(BackupClientConfigSchema),
  metadata: z.record(z.unknown()).optional(),
});

export type BackupSnapshotConfig = z.infer<typeof BackupSnapshotSchema>;

/**
 * BackupSnapshot Entity
 * Represents a complete backup of all MCP configurations
 *
 * SOLID Principles:
 * - SRP: Only responsible for backup snapshot representation
 * - OCP: Can be extended but not modified
 */
export class BackupSnapshot {
  private readonly _version: string;
  private readonly _timestamp: Date;
  private readonly _createdBy: string;
  private readonly _operatingSystem: string;
  private readonly _clients: BackupClientConfig[];
  private readonly _metadata?: Record<string, unknown>;

  constructor(config: BackupSnapshotConfig) {
    const validated = BackupSnapshotSchema.parse(config);

    this._version = validated.version;
    this._timestamp = validated.timestamp;
    this._createdBy = validated.createdBy;
    this._operatingSystem = validated.operatingSystem;
    this._clients = validated.clients;
    this._metadata = validated.metadata;
  }

  /**
   * Create a new backup snapshot
   */
  static create(
    operatingSystem: string,
    clients: BackupClientConfig[],
    metadata?: Record<string, unknown>
  ): BackupSnapshot {
    return new BackupSnapshot({
      version: '1.0.0',
      timestamp: new Date(),
      createdBy: 'mcp-setter',
      operatingSystem,
      clients,
      metadata,
    });
  }

  // Getters
  get version(): string {
    return this._version;
  }

  get timestamp(): Date {
    return this._timestamp;
  }

  get createdBy(): string {
    return this._createdBy;
  }

  get operatingSystem(): string {
    return this._operatingSystem;
  }

  get clients(): ReadonlyArray<BackupClientConfig> {
    return this._clients;
  }

  get metadata(): Record<string, unknown> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  /**
   * Get total number of MCP servers across all clients
   */
  getTotalServerCount(): number {
    return this._clients.reduce((sum, client) => {
      return sum + Object.keys(client.config.mcpServers).length;
    }, 0);
  }

  /**
   * Get client configs by type
   */
  getClientsByType(clientType: string): BackupClientConfig[] {
    return this._clients.filter(c => c.clientType === clientType);
  }

  /**
   * Get all client types in this backup
   */
  getClientTypes(): string[] {
    return [...new Set(this._clients.map(c => c.clientType))];
  }

  /**
   * Check if backup contains any clients
   */
  hasClients(): boolean {
    return this._clients.length > 0;
  }

  /**
   * Check if backup was created on the same OS
   */
  isCompatibleWithOS(currentOS: string): boolean {
    // Basic compatibility check - can be enhanced
    return this._operatingSystem === currentOS;
  }

  /**
   * Get a human-readable summary
   */
  getSummary(): string {
    const clientCount = this._clients.length;
    const serverCount = this.getTotalServerCount();
    const date = this._timestamp.toLocaleString();
    return `Backup from ${date}: ${clientCount} client(s), ${serverCount} server(s)`;
  }

  /**
   * Get formatted timestamp for file names
   */
  getFileNameTimestamp(): string {
    const year = this._timestamp.getFullYear();
    const month = String(this._timestamp.getMonth() + 1).padStart(2, '0');
    const day = String(this._timestamp.getDate()).padStart(2, '0');
    const hour = String(this._timestamp.getHours()).padStart(2, '0');
    const minute = String(this._timestamp.getMinutes()).padStart(2, '0');
    const second = String(this._timestamp.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}-${hour}${minute}${second}`;
  }

  /**
   * Get suggested file name for this backup
   */
  getSuggestedFileName(): string {
    return `mcp-backup-${this.getFileNameTimestamp()}.json`;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): BackupSnapshotConfig {
    return {
      version: this._version,
      timestamp: this._timestamp,
      createdBy: this._createdBy,
      operatingSystem: this._operatingSystem,
      clients: this._clients,
      metadata: this._metadata,
    };
  }

  /**
   * Convert to JSON string for file storage
   */
  toString(pretty: boolean = true): string {
    const data = this.toJSON();
    // Convert Date objects to ISO strings for JSON serialization
    const jsonData = {
      ...data,
      timestamp: data.timestamp.toISOString(),
    };
    return pretty ? JSON.stringify(jsonData, null, 2) : JSON.stringify(jsonData);
  }

  /**
   * Parse from JSON string
   */
  static fromString(json: string): BackupSnapshot {
    const data = JSON.parse(json);
    // Convert ISO string back to Date
    if (typeof data.timestamp === 'string') {
      data.timestamp = new Date(data.timestamp);
    }
    return new BackupSnapshot(data);
  }
}
