/**
 * Domain Entity: InstallerMetadata
 * Tracks installation source and channel information
 */

import { z } from 'zod';

/**
 * Installation channel/source
 */
export enum InstallChannel {
  HOMEBREW = 'homebrew',
  NPM = 'npm',
  DIRECT_DOWNLOAD = 'direct',
  GITHUB_RELEASE = 'github',
  WINDOWS_INSTALLER = 'windows_installer',
  LINUX_PACKAGE = 'linux_package',
  DEVELOPMENT = 'development',
  UNKNOWN = 'unknown',
}

/**
 * Installer Metadata Schema
 */
export const InstallerMetadataSchema = z.object({
  /** Installation channel */
  channel: z.nativeEnum(InstallChannel),

  /** Installation timestamp */
  installedAt: z.string(),

  /** Installer version */
  installerVersion: z.string().optional(),

  /** Installation path */
  installPath: z.string().optional(),

  /** Whether installed system-wide or user-level */
  systemWide: z.boolean().default(false),

  /** Additional metadata */
  metadata: z.record(z.string()).optional(),
});

export type InstallerMetadataData = z.infer<typeof InstallerMetadataSchema>;

/**
 * InstallerMetadata Entity
 * Encapsulates installer metadata with validation
 *
 * SOLID Principles:
 * - SRP: Only responsible for installer metadata
 * - OCP: Can be extended with new metadata fields
 */
export class InstallerMetadata {
  private readonly data: InstallerMetadataData;

  constructor(data: InstallerMetadataData) {
    this.data = InstallerMetadataSchema.parse(data);
  }

  /**
   * Create from environment detection
   */
  static detect(): InstallerMetadata {
    // Try to detect installation channel from environment
    const channel = this.detectChannel();
    const installedAt = new Date().toISOString();

    return new InstallerMetadata({
      channel,
      installedAt,
      installerVersion: process.env.npm_package_version,
      installPath: process.cwd(),
      systemWide: this.isSystemWide(),
    });
  }

  /**
   * Create from JSON data
   */
  static fromJSON(json: unknown): InstallerMetadata {
    const data = InstallerMetadataSchema.parse(json);
    return new InstallerMetadata(data);
  }

  /**
   * Detect installation channel
   */
  private static detectChannel(): InstallChannel {
    // Check environment variables
    if (process.env.MCP_SETTER_INSTALL_CHANNEL) {
      const channel = process.env.MCP_SETTER_INSTALL_CHANNEL.toLowerCase();
      const matched = Object.values(InstallChannel).find(c => c === channel);
      if (matched) {
        return matched;
      }
    }

    // Check for Homebrew
    if (process.env.HOMEBREW_PREFIX || process.execPath.includes('homebrew')) {
      return InstallChannel.HOMEBREW;
    }

    // Check for npm global install
    if (process.env.npm_config_prefix || __dirname.includes('node_modules')) {
      return InstallChannel.NPM;
    }

    // Check for development mode
    if (process.env.NODE_ENV === 'development' || __dirname.includes('/src/')) {
      return InstallChannel.DEVELOPMENT;
    }

    return InstallChannel.UNKNOWN;
  }

  /**
   * Check if installed system-wide
   */
  private static isSystemWide(): boolean {
    // Check common system paths
    const execPath = process.execPath.toLowerCase();

    // Unix system paths
    if (
      execPath.includes('/usr/local') ||
      execPath.includes('/usr/bin') ||
      execPath.includes('/opt/')
    ) {
      return true;
    }

    // Windows system paths
    if (
      execPath.includes('program files') ||
      execPath.includes('\\windows\\') ||
      execPath.includes('c:\\programdata')
    ) {
      return true;
    }

    return false;
  }

  // Getters

  getChannel(): InstallChannel {
    return this.data.channel;
  }

  getInstalledAt(): string {
    return this.data.installedAt;
  }

  getInstallerVersion(): string | undefined {
    return this.data.installerVersion;
  }

  getInstallPath(): string | undefined {
    return this.data.installPath;
  }

  isSystemWide(): boolean {
    return this.data.systemWide;
  }

  getMetadata(): Record<string, string> | undefined {
    return this.data.metadata;
  }

  getChannelDisplayName(): string {
    switch (this.data.channel) {
      case InstallChannel.HOMEBREW:
        return 'Homebrew';
      case InstallChannel.NPM:
        return 'npm';
      case InstallChannel.DIRECT_DOWNLOAD:
        return 'Direct Download';
      case InstallChannel.GITHUB_RELEASE:
        return 'GitHub Release';
      case InstallChannel.WINDOWS_INSTALLER:
        return 'Windows Installer';
      case InstallChannel.LINUX_PACKAGE:
        return 'Linux Package';
      case InstallChannel.DEVELOPMENT:
        return 'Development';
      default:
        return 'Unknown';
    }
  }

  /**
   * Convert to JSON
   */
  toJSON(): InstallerMetadataData {
    return { ...this.data };
  }

  /**
   * Convert to plain object for serialization
   */
  toObject(): InstallerMetadataData {
    return this.toJSON();
  }
}
