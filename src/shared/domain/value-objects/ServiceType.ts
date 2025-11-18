/**
 * Shared Value Object: ServiceType
 * Represents the type of AI service that can host MCP servers
 */

export enum ServiceType {
  CLAUDE_DESKTOP = 'claude-desktop',
  // Future services (YAGNI - add when needed):
  // CODEX = 'codex',
  // GEMINI = 'gemini',
}

/**
 * ServiceType Value Object
 */
export class ServiceTypeVO {
  private constructor(private readonly value: ServiceType) {}

  static fromString(value: string): ServiceTypeVO {
    const normalizedValue = value.toLowerCase().replace(/[_\s-]/g, '-');
    const serviceType = Object.values(ServiceType).find(type => type === normalizedValue);

    if (!serviceType) {
      throw new Error(
        `Invalid service type: ${value}. Supported: ${Object.values(ServiceType).join(', ')}`
      );
    }

    return new ServiceTypeVO(serviceType);
  }

  static claudeDesktop(): ServiceTypeVO {
    return new ServiceTypeVO(ServiceType.CLAUDE_DESKTOP);
  }

  getValue(): ServiceType {
    return this.value;
  }

  getDisplayName(): string {
    switch (this.value) {
      case ServiceType.CLAUDE_DESKTOP:
        return 'Claude Desktop';
      default:
        return this.value;
    }
  }

  getConfigFileName(): string {
    switch (this.value) {
      case ServiceType.CLAUDE_DESKTOP:
        return 'claude_desktop_config.json';
      default:
        throw new Error(`No config file name defined for service: ${this.value}`);
    }
  }

  equals(other: ServiceTypeVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
