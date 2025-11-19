/**
 * Use Case: LoadCredentialsUseCase
 * Load credentials for an MCP server
 */

import { injectable, inject } from 'tsyringe';
import { ICredentialsManager, Credentials } from '../domain/ICredentialsManager';

export interface LoadCredentialsInput {
  configPath: string;
}

export interface LoadCredentialsOutput {
  credentials: Credentials;
  found: boolean;
  credentialCount: number;
}

/**
 * LoadCredentialsUseCase
 * Loads credentials from .env file
 *
 * SOLID Principles:
 * - SRP: Only responsible for loading credentials
 * - DIP: Depends on ICredentialsManager interface
 */
@injectable()
export class LoadCredentialsUseCase {
  constructor(
    @inject('ICredentialsManager') private readonly credentialsManager: ICredentialsManager
  ) {}

  async execute(input: LoadCredentialsInput): Promise<LoadCredentialsOutput> {
    const { configPath } = input;

    const found = await this.credentialsManager.credentialsExist(configPath);
    const credentials = await this.credentialsManager.loadCredentials(configPath);

    return {
      credentials,
      found,
      credentialCount: Object.keys(credentials).length,
    };
  }
}
