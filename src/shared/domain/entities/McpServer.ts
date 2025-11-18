/**
 * Shared Domain Entity: McpServer
 * Represents an MCP (Model Context Protocol) server configuration
 */

import { z } from 'zod';

// Zod schema for runtime validation
export const McpServerSchema = z.object({
  command: z.string().min(1, 'Command is required'),
  args: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
  disabled: z.boolean().optional(),
});

export type McpServerConfig = z.infer<typeof McpServerSchema>;

/**
 * McpServer Entity
 *
 * Responsibilities:
 * - Represent a valid MCP server configuration
 * - Enforce business rules and validation
 * - Provide domain operations
 *
 * SOLID Principles:
 * - SRP: Only responsible for MCP server domain logic
 * - OCP: Can be extended but not modified
 */
export class McpServer {
  private readonly _command: string;
  private readonly _args?: string[];
  private readonly _env?: Record<string, string>;
  private readonly _disabled: boolean;

  constructor(config: McpServerConfig) {
    // Validate using Zod schema
    const validated = McpServerSchema.parse(config);

    this._command = validated.command;
    this._args = validated.args;
    this._env = validated.env;
    this._disabled = validated.disabled ?? false;

    this.validateBusinessRules();
  }

  // Getters (immutable)
  get command(): string {
    return this._command;
  }

  get args(): string[] | undefined {
    return this._args ? [...this._args] : undefined;
  }

  get env(): Record<string, string> | undefined {
    return this._env ? { ...this._env } : undefined;
  }

  get disabled(): boolean {
    return this._disabled;
  }

  /**
   * Business rule validation
   * Domain-specific rules beyond schema validation
   */
  private validateBusinessRules(): void {
    // Example: Validate command is not a dangerous system command
    const dangerousCommands = ['rm', 'del', 'format', 'shutdown'];
    const commandName = this._command.split('/').pop()?.split('\\').pop() || '';

    if (dangerousCommands.some(cmd => commandName.toLowerCase().includes(cmd))) {
      throw new Error(`Command '${this._command}' contains potentially dangerous operations`);
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): McpServerConfig {
    return {
      command: this._command,
      args: this._args,
      env: this._env,
      disabled: this._disabled,
    };
  }

  /**
   * Domain method: Create a disabled copy
   */
  disable(): McpServer {
    return new McpServer({ ...this.toJSON(), disabled: true });
  }

  /**
   * Domain method: Create an enabled copy
   */
  enable(): McpServer {
    return new McpServer({ ...this.toJSON(), disabled: false });
  }

  /**
   * Domain method: Check if server is enabled
   */
  isEnabled(): boolean {
    return !this._disabled;
  }

  /**
   * Equality comparison
   */
  equals(other: McpServer): boolean {
    return (
      this._command === other._command &&
      JSON.stringify(this._args) === JSON.stringify(other._args)
    );
  }
}
