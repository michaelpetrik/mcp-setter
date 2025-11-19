/**
 * Shared Value Object: ClientType
 * Represents the type of MCP client that can host MCP servers
 */

export enum ClientType {
  CLAUDE_DESKTOP = 'claude-desktop',
  CLAUDE_CLI = 'claude-cli',
  CURSOR = 'cursor',
  CONTINUE = 'continue',
  GEMINI_CLI = 'gemini-cli',
  // Future clients (extensible):
  // CLINE = 'cline',
  // WINDSURF = 'windsurf',
}

/**
 * ClientType Value Object
 * Encapsulates client type with validation and metadata
 */
export class ClientTypeVO {
  private constructor(private readonly value: ClientType) {}

  static fromString(value: string): ClientTypeVO {
    const normalizedValue = value.toLowerCase().replace(/[_\s]/g, '-');
    const clientType = Object.values(ClientType).find(type => type === normalizedValue);

    if (!clientType) {
      throw new Error(
        `Invalid client type: ${value}. Supported: ${Object.values(ClientType).join(', ')}`
      );
    }

    return new ClientTypeVO(clientType);
  }

  static claudeDesktop(): ClientTypeVO {
    return new ClientTypeVO(ClientType.CLAUDE_DESKTOP);
  }

  static claudeCLI(): ClientTypeVO {
    return new ClientTypeVO(ClientType.CLAUDE_CLI);
  }

  static cursor(): ClientTypeVO {
    return new ClientTypeVO(ClientType.CURSOR);
  }

  static continue(): ClientTypeVO {
    return new ClientTypeVO(ClientType.CONTINUE);
  }

  static geminiCLI(): ClientTypeVO {
    return new ClientTypeVO(ClientType.GEMINI_CLI);
  }

  getValue(): ClientType {
    return this.value;
  }

  getDisplayName(): string {
    switch (this.value) {
      case ClientType.CLAUDE_DESKTOP:
        return 'Claude Desktop';
      case ClientType.CLAUDE_CLI:
        return 'Claude CLI';
      case ClientType.CURSOR:
        return 'Cursor';
      case ClientType.CONTINUE:
        return 'Continue';
      case ClientType.GEMINI_CLI:
        return 'Gemini CLI';
      default:
        return this.value;
    }
  }

  /**
   * Get the primary config file name for this client
   * Note: Some clients support multiple config locations (global + project-specific)
   */
  getConfigFileName(): string {
    switch (this.value) {
      case ClientType.CLAUDE_DESKTOP:
        return 'claude_desktop_config.json';
      case ClientType.CLAUDE_CLI:
        return '.claude.json'; // Global config
      case ClientType.CURSOR:
        return 'cursor_desktop_config.json'; // Global config
      case ClientType.CONTINUE:
        return 'mcpServers'; // Directory name
      case ClientType.GEMINI_CLI:
        return 'config.json'; // TODO: Verify with actual Gemini CLI
      default:
        throw new Error(`No config file name defined for client: ${this.value}`);
    }
  }

  /**
   * Check if this client supports project-specific configs
   */
  supportsProjectConfig(): boolean {
    return [ClientType.CLAUDE_CLI, ClientType.CURSOR, ClientType.CONTINUE].includes(this.value);
  }

  /**
   * Get the project-specific config file name (if supported)
   */
  getProjectConfigFileName(): string | undefined {
    switch (this.value) {
      case ClientType.CLAUDE_CLI:
        return '.mcp.json';
      case ClientType.CURSOR:
        return '.cursor/mcp.json';
      case ClientType.CONTINUE:
        return '.continue/mcpServers';
      default:
        return undefined;
    }
  }

  equals(other: ClientTypeVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
