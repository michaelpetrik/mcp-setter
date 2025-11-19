/**
 * Use Case: DetectSpecificClientUseCase
 * Detect a specific MCP client
 */

import { injectable, inject } from 'tsyringe';
import { IClientDetector } from '../domain/IClientDetector';
import { McpClient } from '@/shared/domain/entities/McpClient';
import { ClientType } from '@/shared/domain/value-objects/ClientType';
import { OperatingSystem } from '@/shared/domain/value-objects/OperatingSystem';

export interface DetectSpecificClientInput {
  clientType: ClientType;
  operatingSystem: OperatingSystem;
  projectPath?: string;
}

export interface DetectSpecificClientOutput {
  client: McpClient | null;
  found: boolean;
  isGlobal: boolean;
  isProjectSpecific: boolean;
}

/**
 * DetectSpecificClientUseCase
 * Detects a specific MCP client on the system
 *
 * SOLID Principles:
 * - SRP: Only responsible for detecting a single client
 * - DIP: Depends on IClientDetector interface
 */
@injectable()
export class DetectSpecificClientUseCase {
  constructor(@inject('IClientDetector') private readonly detector: IClientDetector) {}

  async execute(input: DetectSpecificClientInput): Promise<DetectSpecificClientOutput> {
    const { clientType, operatingSystem, projectPath } = input;

    const client = await this.detector.detectClient(clientType, operatingSystem, projectPath);

    return {
      client,
      found: client !== null,
      isGlobal: client?.isGlobal() ?? false,
      isProjectSpecific: client?.isProjectSpecific ?? false,
    };
  }
}
