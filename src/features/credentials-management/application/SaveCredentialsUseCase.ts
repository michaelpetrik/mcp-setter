/**
 * Use Case: SaveCredentialsUseCase
 * Save credentials for an MCP server
 */

import { injectable, inject } from 'tsyringe';
import { ICredentialsManager, Credentials } from '../domain/ICredentialsManager';

export interface SaveCredentialsInput {
  configPath: string;
  credentials: Credentials;
  serverName?: string;
}

export interface SaveCredentialsOutput {
  success: boolean;
  envFilePath: string;
  credentialCount: number;
}

/**
 * SaveCredentialsUseCase
 * Saves credentials to .env file
 *
 * SOLID Principles:
 * - SRP: Only responsible for saving credentials
 * - DIP: Depends on ICredentialsManager interface
 */
@injectable()
export class SaveCredentialsUseCase {
  constructor(
    @inject('ICredentialsManager') private readonly credentialsManager: ICredentialsManager
  ) {}

  async execute(input: SaveCredentialsInput): Promise<SaveCredentialsOutput> {
    const { configPath, credentials } = input;

    const envFilePath = await this.credentialsManager.saveCredentials(configPath, credentials);

    return {
      success: true,
      envFilePath,
      credentialCount: Object.keys(credentials).length,
    };
  }
}
