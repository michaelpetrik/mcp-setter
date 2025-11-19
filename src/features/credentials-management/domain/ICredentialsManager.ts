/**
 * Domain Interface: ICredentialsManager
 * Abstraction for credentials storage operations
 */

export interface Credentials {
  [key: string]: string;
}

export interface CredentialValidationResult {
  isValid: boolean;
  missingFields: string[];
  presentFields: string[];
}

/**
 * ICredentialsManager Interface
 * Defines operations for managing MCP server credentials
 */
export interface ICredentialsManager {
  /**
   * Save credentials to .env file next to config file
   */
  saveCredentials(configPath: string, credentials: Credentials): Promise<string>;

  /**
   * Load credentials from .env file
   */
  loadCredentials(configPath: string): Promise<Credentials>;

  /**
   * Check if credentials file exists
   */
  credentialsExist(configPath: string): Promise<boolean>;

  /**
   * Validate that required credentials are present
   */
  validateCredentials(
    configPath: string,
    requiredFields: string[]
  ): Promise<CredentialValidationResult>;

  /**
   * Get the path to the .env file for a config
   */
  getCredentialsPath(configPath: string): string;

  /**
   * Delete credentials file
   */
  deleteCredentials(configPath: string): Promise<void>;
}
