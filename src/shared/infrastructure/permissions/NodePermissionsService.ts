/**
 * Node.js Permissions Service
 * Cross-platform permission checking using Node.js fs APIs
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { injectable } from 'tsyringe';
import {
  IPermissionsService,
  PermissionCheckResult,
  ElevationOptions,
} from './IPermissionsService';
import { OperatingSystem, OSType } from '../../domain/value-objects/OperatingSystem';

/**
 * NodePermissionsService
 * Cross-platform permissions service using Node.js APIs
 *
 * SOLID Principles:
 * - SRP: Only responsible for permission checking
 * - LSP: Substitutable for IPermissionsService
 */
@injectable()
export class NodePermissionsService implements IPermissionsService {
  private readonly operatingSystem: OperatingSystem;

  constructor() {
    this.operatingSystem = OperatingSystem.detect();
  }

  async canRead(filePath: string): Promise<PermissionCheckResult> {
    try {
      await fs.access(filePath, fs.constants.R_OK);
      return {
        canPerform: true,
        elevationRequired: false,
      };
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;

      if (nodeError.code === 'EACCES' || nodeError.code === 'EPERM') {
        return {
          canPerform: false,
          elevationRequired: true,
          reason: 'Permission denied',
          suggestion: this.getSuggestion('read', filePath),
        };
      }

      if (nodeError.code === 'ENOENT') {
        return {
          canPerform: false,
          elevationRequired: false,
          reason: 'File does not exist',
        };
      }

      return {
        canPerform: false,
        elevationRequired: false,
        reason: nodeError.message,
      };
    }
  }

  async canWrite(filePath: string): Promise<PermissionCheckResult> {
    try {
      // Check if file exists
      try {
        await fs.access(filePath);
        // File exists - check write permission
        await fs.access(filePath, fs.constants.W_OK);
      } catch {
        // File doesn't exist - check parent directory
        const parentDir = path.dirname(filePath);
        await fs.access(parentDir, fs.constants.W_OK);
      }

      return {
        canPerform: true,
        elevationRequired: false,
      };
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;

      if (nodeError.code === 'EACCES' || nodeError.code === 'EPERM') {
        return {
          canPerform: false,
          elevationRequired: true,
          reason: 'Permission denied',
          suggestion: this.getSuggestion('write', filePath),
        };
      }

      return {
        canPerform: false,
        elevationRequired: false,
        reason: nodeError.message,
      };
    }
  }

  async canExecute(filePath: string): Promise<PermissionCheckResult> {
    try {
      await fs.access(filePath, fs.constants.X_OK);
      return {
        canPerform: true,
        elevationRequired: false,
      };
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;

      if (nodeError.code === 'EACCES' || nodeError.code === 'EPERM') {
        return {
          canPerform: false,
          elevationRequired: true,
          reason: 'Permission denied',
          suggestion: this.getSuggestion('execute', filePath),
        };
      }

      return {
        canPerform: false,
        elevationRequired: false,
        reason: nodeError.message,
      };
    }
  }

  async isElevated(): Promise<boolean> {
    // Check if running as root/admin
    if (this.operatingSystem.isWindows()) {
      // Windows: Check if running as admin (simplified)
      // A more robust check would use Windows APIs
      return process.env.USERNAME?.toLowerCase() === 'administrator';
    }

    // Unix: Check if running as root
    return process.getuid?.() === 0;
  }

  async requestElevation(_options: ElevationOptions): Promise<boolean> {
    // Note: Actual elevation requires OS-specific implementations
    // This is a placeholder that returns false
    // Real implementations would use:
    // - Windows: UAC prompts, runas
    // - macOS: osascript with administrator privileges
    // - Linux: sudo, pkexec, or polkit

    console.warn(
      'Elevation requested but not implemented. Please run the command with elevated privileges manually.'
    );
    console.warn(`Reason: ${_options.reason}`);
    console.warn(`Command: ${_options.command} ${_options.args.join(' ')}`);

    return false;
  }

  async getCurrentUser(): Promise<string> {
    return os.userInfo().username;
  }

  async isSystemProtected(filePath: string): Promise<boolean> {
    const normalizedPath = path.normalize(filePath).toLowerCase();

    if (this.operatingSystem.isWindows()) {
      // Windows system paths
      return (
        normalizedPath.includes('\\windows\\') ||
        normalizedPath.includes('\\program files\\') ||
        normalizedPath.includes('\\program files (x86)\\') ||
        normalizedPath.startsWith('c:\\programdata\\')
      );
    }

    if (this.operatingSystem.isMacOS()) {
      // macOS system paths
      return (
        normalizedPath.startsWith('/system/') ||
        normalizedPath.startsWith('/library/') ||
        normalizedPath.startsWith('/usr/') ||
        normalizedPath.startsWith('/bin/') ||
        normalizedPath.startsWith('/sbin/')
      );
    }

    if (this.operatingSystem.isLinux()) {
      // Linux system paths
      return (
        normalizedPath.startsWith('/usr/') ||
        normalizedPath.startsWith('/etc/') ||
        normalizedPath.startsWith('/bin/') ||
        normalizedPath.startsWith('/sbin/') ||
        normalizedPath.startsWith('/sys/') ||
        normalizedPath.startsWith('/proc/') ||
        normalizedPath.startsWith('/boot/')
      );
    }

    return false;
  }

  /**
   * Get OS-specific suggestion for permission issues
   */
  private getSuggestion(operation: 'read' | 'write' | 'execute', filePath: string): string {
    const osType = this.operatingSystem.getType();

    switch (osType) {
      case OSType.WINDOWS:
        return `Try running the command as Administrator, or check file permissions in File Explorer.`;

      case OSType.MACOS:
        return operation === 'write'
          ? `Try using 'sudo' to run with elevated privileges, or change file permissions.`
          : `Check file permissions using 'ls -la ${path.dirname(filePath)}'.`;

      case OSType.LINUX:
        return operation === 'write'
          ? `Try using 'sudo' or 'pkexec', or change file permissions with 'chmod'.`
          : `Check file permissions using 'ls -la ${path.dirname(filePath)}'.`;

      default:
        return 'Check file permissions and try running with elevated privileges.';
    }
  }
}
