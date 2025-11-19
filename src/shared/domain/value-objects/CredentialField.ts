/**
 * Shared Value Object: CredentialField
 * Represents a credential field required by an MCP server
 */

import { z } from 'zod';

export const CredentialFieldSchema = z.object({
  name: z.string().min(1, 'Credential name is required'),
  description: z.string().optional(),
  isRequired: z.boolean().default(true),
  isSecret: z.boolean().default(true),
  defaultValue: z.string().optional(),
});

export type CredentialFieldConfig = z.infer<typeof CredentialFieldSchema>;

/**
 * CredentialField Value Object
 * Represents metadata about a required credential/environment variable
 */
export class CredentialField {
  private readonly _name: string;
  private readonly _description?: string;
  private readonly _isRequired: boolean;
  private readonly _isSecret: boolean;
  private readonly _defaultValue?: string;

  constructor(config: CredentialFieldConfig) {
    const validated = CredentialFieldSchema.parse(config);

    this._name = validated.name;
    this._description = validated.description;
    this._isRequired = validated.isRequired;
    this._isSecret = validated.isSecret;
    this._defaultValue = validated.defaultValue;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | undefined {
    return this._description;
  }

  get isRequired(): boolean {
    return this._isRequired;
  }

  get isSecret(): boolean {
    return this._isSecret;
  }

  get defaultValue(): string | undefined {
    return this._defaultValue;
  }

  /**
   * Get display label for UI
   */
  getDisplayLabel(): string {
    const required = this._isRequired ? ' *' : '';
    return `${this._name}${required}`;
  }

  /**
   * Get input type for UI
   */
  getInputType(): 'text' | 'password' {
    return this._isSecret ? 'password' : 'text';
  }

  toJSON(): CredentialFieldConfig {
    return {
      name: this._name,
      description: this._description,
      isRequired: this._isRequired,
      isSecret: this._isSecret,
      defaultValue: this._defaultValue,
    };
  }

  equals(other: CredentialField): boolean {
    return this._name === other._name;
  }
}
