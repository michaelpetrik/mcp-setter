/**
 * CLI OS Helper
 * Utilities for detecting the current operating system
 */

import * as os from 'node:os';
import { OperatingSystem } from '@/shared/domain/value-objects/OperatingSystem';

/**
 * Detect the current operating system
 */
export function detectOS(): OperatingSystem {
  const platform = os.platform();

  switch (platform) {
    case 'darwin':
      return OperatingSystem.MACOS;
    case 'win32':
      return OperatingSystem.WINDOWS;
    case 'linux':
      return OperatingSystem.LINUX;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Get the current working directory
 */
export function getCurrentWorkingDirectory(): string {
  return process.cwd();
}
