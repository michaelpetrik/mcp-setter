/**
 * Shared Value Object: InstallMethod
 * Represents the method used to install an MCP server
 */

export enum InstallMethod {
  NPM = 'npm',
  PIP = 'pip',
  DOCKER = 'docker',
  BINARY = 'binary',
  MANUAL = 'manual',
}

/**
 * InstallMethod Value Object
 */
export class InstallMethodVO {
  private constructor(private readonly value: InstallMethod) {}

  static fromString(value: string): InstallMethodVO {
    const normalizedValue = value.toLowerCase();
    const installMethod = Object.values(InstallMethod).find(method => method === normalizedValue);

    if (!installMethod) {
      throw new Error(
        `Invalid install method: ${value}. Supported: ${Object.values(InstallMethod).join(', ')}`
      );
    }

    return new InstallMethodVO(installMethod);
  }

  static npm(): InstallMethodVO {
    return new InstallMethodVO(InstallMethod.NPM);
  }

  static pip(): InstallMethodVO {
    return new InstallMethodVO(InstallMethod.PIP);
  }

  static docker(): InstallMethodVO {
    return new InstallMethodVO(InstallMethod.DOCKER);
  }

  static binary(): InstallMethodVO {
    return new InstallMethodVO(InstallMethod.BINARY);
  }

  static manual(): InstallMethodVO {
    return new InstallMethodVO(InstallMethod.MANUAL);
  }

  getValue(): InstallMethod {
    return this.value;
  }

  getDisplayName(): string {
    switch (this.value) {
      case InstallMethod.NPM:
        return 'npm (Node.js)';
      case InstallMethod.PIP:
        return 'pip (Python)';
      case InstallMethod.DOCKER:
        return 'Docker';
      case InstallMethod.BINARY:
        return 'Binary/Executable';
      case InstallMethod.MANUAL:
        return 'Manual Installation';
      default:
        return this.value;
    }
  }

  /**
   * Get the command prefix for this install method
   */
  getCommandPrefix(): string[] {
    switch (this.value) {
      case InstallMethod.NPM:
        return ['npx', '-y'];
      case InstallMethod.PIP:
        return ['uvx', '--from']; // Modern Python execution
      case InstallMethod.DOCKER:
        return ['docker', 'run'];
      case InstallMethod.BINARY:
        return []; // Direct execution
      case InstallMethod.MANUAL:
        return []; // User-defined
      default:
        return [];
    }
  }

  equals(other: InstallMethodVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
