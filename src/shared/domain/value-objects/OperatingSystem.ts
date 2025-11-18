/**
 * Shared Value Object: OperatingSystem
 * Represents the operating system the application is running on
 */

export enum OSType {
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
}

export class OperatingSystem {
  private constructor(private readonly type: OSType) {}

  static detect(): OperatingSystem {
    const platform = process.platform;

    switch (platform) {
      case 'win32':
        return new OperatingSystem(OSType.WINDOWS);
      case 'darwin':
        return new OperatingSystem(OSType.MACOS);
      case 'linux':
        return new OperatingSystem(OSType.LINUX);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  static windows(): OperatingSystem {
    return new OperatingSystem(OSType.WINDOWS);
  }

  static macos(): OperatingSystem {
    return new OperatingSystem(OSType.MACOS);
  }

  static linux(): OperatingSystem {
    return new OperatingSystem(OSType.LINUX);
  }

  getType(): OSType {
    return this.type;
  }

  isWindows(): boolean {
    return this.type === OSType.WINDOWS;
  }

  isMacOS(): boolean {
    return this.type === OSType.MACOS;
  }

  isLinux(): boolean {
    return this.type === OSType.LINUX;
  }

  getHomeDirectory(): string {
    return process.env.HOME || process.env.USERPROFILE || '';
  }

  getAppDataDirectory(): string {
    switch (this.type) {
      case OSType.WINDOWS:
        return process.env.APPDATA || '';
      case OSType.MACOS:
        return `${this.getHomeDirectory()}/Library/Application Support`;
      case OSType.LINUX:
        return process.env.XDG_CONFIG_HOME || `${this.getHomeDirectory()}/.config`;
    }
  }

  getPathSeparator(): string {
    return this.type === OSType.WINDOWS ? '\\' : '/';
  }

  equals(other: OperatingSystem): boolean {
    return this.type === other.type;
  }

  toString(): string {
    return this.type;
  }

  getDisplayName(): string {
    switch (this.type) {
      case OSType.WINDOWS:
        return 'Windows';
      case OSType.MACOS:
        return 'macOS';
      case OSType.LINUX:
        return 'Linux';
    }
  }
}
