/**
 * Shared Infrastructure Interface: IPermissionsService
 * Abstract permissions and privilege operations
 */

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  /** Whether the operation can be performed */
  canPerform: boolean;

  /** Whether elevation is required */
  elevationRequired: boolean;

  /** Reason if permission denied */
  reason?: string;

  /** Suggested action */
  suggestion?: string;
}

/**
 * Elevation options
 */
export interface ElevationOptions {
  /** Command to run with elevation */
  command: string;

  /** Arguments for the command */
  args: string[];

  /** Working directory */
  cwd?: string;

  /** Reason message to show user */
  reason: string;
}

/**
 * IPermissionsService Interface
 * Abstraction for OS-specific permission operations
 *
 * SOLID Principles:
 * - DIP: Application layer depends on this abstraction
 * - ISP: Small, focused interface for permissions
 */
export interface IPermissionsService {
  /**
   * Check if we can read a file/directory
   */
  canRead(path: string): Promise<PermissionCheckResult>;

  /**
   * Check if we can write to a file/directory
   */
  canWrite(path: string): Promise<PermissionCheckResult>;

  /**
   * Check if we can execute a file
   */
  canExecute(path: string): Promise<PermissionCheckResult>;

  /**
   * Check if running with elevated privileges
   */
  isElevated(): Promise<boolean>;

  /**
   * Request elevation for an operation
   * Returns true if elevation was granted, false otherwise
   */
  requestElevation(options: ElevationOptions): Promise<boolean>;

  /**
   * Get the current user's username
   */
  getCurrentUser(): Promise<string>;

  /**
   * Check if a path is in a system-protected location
   */
  isSystemProtected(path: string): Promise<boolean>;
}
