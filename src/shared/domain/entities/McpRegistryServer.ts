/**
 * Shared Domain Entity: McpRegistryServer
 * Represents an MCP server from the registry API
 */

import { z } from 'zod';
import { CredentialField, CredentialFieldSchema } from '../value-objects/CredentialField';

// Zod schema for registry server package
export const RegistryServerPackageSchema = z.object({
  registryType: z.enum(['npm', 'pypi', 'nuget', 'oci']),
  registryBaseUrl: z.string().optional(),
  identifier: z.string().min(1, 'Package identifier is required'),
  version: z.string().optional(),
  transport: z
    .object({
      type: z.enum(['stdio', 'streamable-http']),
    })
    .optional(),
  packageArguments: z.array(z.string()).optional(),
  environmentVariables: z.array(CredentialFieldSchema).optional(),
  runtimeHint: z.string().optional(),
  runtimeArguments: z.array(z.string()).optional(),
});

// Zod schema for registry server repository
export const RegistryServerRepositorySchema = z.object({
  url: z.string().url(),
  source: z.string().optional(),
  subfolder: z.string().optional(),
  id: z.string().optional(),
});

// Zod schema for registry server remote
export const RegistryServerRemoteSchema = z.object({
  type: z.enum(['streamable-http']),
  url: z.string().url(),
});

// Zod schema for registry server
export const McpRegistryServerSchema = z.object({
  $schema: z.string().optional(),
  name: z.string().min(1, 'Server name is required'),
  title: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  version: z.string().optional(),
  status: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  repository: RegistryServerRepositorySchema.optional(),
  packages: z.array(RegistryServerPackageSchema).optional(),
  remotes: z.array(RegistryServerRemoteSchema).optional(),
  _meta: z.record(z.unknown()).optional(),
});

export type McpRegistryServerConfig = z.infer<typeof McpRegistryServerSchema>;
export type RegistryServerPackageConfig = z.infer<typeof RegistryServerPackageSchema>;
export type RegistryServerRepositoryConfig = z.infer<typeof RegistryServerRepositorySchema>;
export type RegistryServerRemoteConfig = z.infer<typeof RegistryServerRemoteSchema>;

/**
 * McpRegistryServer Entity
 * Represents an MCP server as defined in the registry
 *
 * SOLID Principles:
 * - SRP: Only responsible for registry server domain logic
 * - OCP: Can be extended but not modified
 */
export class McpRegistryServer {
  private readonly _name: string;
  private readonly _title?: string;
  private readonly _description: string;
  private readonly _version?: string;
  private readonly _status?: string;
  private readonly _websiteUrl?: string;
  private readonly _repository?: RegistryServerRepositoryConfig;
  private readonly _packages?: RegistryServerPackageConfig[];
  private readonly _remotes?: RegistryServerRemoteConfig[];
  private readonly _meta?: Record<string, unknown>;

  constructor(config: McpRegistryServerConfig) {
    const validated = McpRegistryServerSchema.parse(config);

    this._name = validated.name;
    this._title = validated.title;
    this._description = validated.description;
    this._version = validated.version;
    this._status = validated.status;
    this._websiteUrl = validated.websiteUrl;
    this._repository = validated.repository;
    this._packages = validated.packages;
    this._remotes = validated.remotes;
    this._meta = validated._meta;

    this.validateBusinessRules();
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get title(): string | undefined {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get version(): string | undefined {
    return this._version;
  }

  get status(): string | undefined {
    return this._status;
  }

  get websiteUrl(): string | undefined {
    return this._websiteUrl;
  }

  get repository(): RegistryServerRepositoryConfig | undefined {
    return this._repository ? { ...this._repository } : undefined;
  }

  get packages(): RegistryServerPackageConfig[] | undefined {
    return this._packages ? [...this._packages] : undefined;
  }

  get remotes(): RegistryServerRemoteConfig[] | undefined {
    return this._remotes ? [...this._remotes] : undefined;
  }

  get meta(): Record<string, unknown> | undefined {
    return this._meta ? { ...this._meta } : undefined;
  }

  /**
   * Business rule validation
   */
  private validateBusinessRules(): void {
    // Must have either packages or remotes
    if (!this._packages?.length && !this._remotes?.length) {
      throw new Error(`Server '${this._name}' must have at least one package or remote`);
    }
  }

  /**
   * Get the display name (title or name)
   */
  getDisplayName(): string {
    return this._title || this._name;
  }

  /**
   * Get the short name (last part of reverse DNS)
   */
  getShortName(): string {
    return this._name.split('/').pop() || this._name;
  }

  /**
   * Check if server is installable via package managers
   */
  isInstallable(): boolean {
    return (this._packages?.length ?? 0) > 0;
  }

  /**
   * Check if server is remote (cloud-hosted)
   */
  isRemote(): boolean {
    return (this._remotes?.length ?? 0) > 0;
  }

  /**
   * Get all required credentials from all packages
   */
  getRequiredCredentials(): CredentialField[] {
    if (!this._packages) return [];

    const credentials: CredentialField[] = [];
    for (const pkg of this._packages) {
      if (pkg.environmentVariables) {
        credentials.push(...pkg.environmentVariables.map(c => new CredentialField(c)));
      }
    }

    // Deduplicate by name
    const uniqueCredentials = new Map<string, CredentialField>();
    for (const cred of credentials) {
      if (!uniqueCredentials.has(cred.name)) {
        uniqueCredentials.set(cred.name, cred);
      }
    }

    return Array.from(uniqueCredentials.values());
  }

  /**
   * Get the primary package (first one)
   */
  getPrimaryPackage(): RegistryServerPackageConfig | undefined {
    return this._packages?.[0];
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): McpRegistryServerConfig {
    return {
      name: this._name,
      title: this._title,
      description: this._description,
      version: this._version,
      status: this._status,
      websiteUrl: this._websiteUrl,
      repository: this._repository,
      packages: this._packages,
      remotes: this._remotes,
      _meta: this._meta,
    };
  }

  equals(other: McpRegistryServer): boolean {
    return this._name === other._name && this._version === other._version;
  }
}
