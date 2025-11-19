/**
 * Use Case: DetectClientsUseCase
 * Detect all installed MCP clients on the system
 */

import { injectable, inject } from 'tsyringe';
import { IClientDetector } from '../domain/IClientDetector';
import { McpClient } from '@/shared/domain/entities/McpClient';
import { OperatingSystem } from '@/shared/domain/value-objects/OperatingSystem';

export interface DetectClientsInput {
  operatingSystem: OperatingSystem;
  projectPath?: string;
}

export interface DetectClientsOutput {
  clients: McpClient[];
  totalFound: number;
  globalClients: McpClient[];
  projectClients: McpClient[];
}

/**
 * DetectClientsUseCase
 * Detects all installed MCP clients on the system
 *
 * SOLID Principles:
 * - SRP: Only responsible for client detection orchestration
 * - DIP: Depends on IClientDetector interface
 */
@injectable()
export class DetectClientsUseCase {
  constructor(@inject('IClientDetector') private readonly detector: IClientDetector) {}

  async execute(input: DetectClientsInput): Promise<DetectClientsOutput> {
    const { operatingSystem, projectPath } = input;

    const clients = await this.detector.detectAll(operatingSystem, projectPath);

    // Separate global and project-specific clients
    const globalClients = clients.filter(c => !c.isProjectSpecific);
    const projectClients = clients.filter(c => c.isProjectSpecific);

    return {
      clients,
      totalFound: clients.length,
      globalClients,
      projectClients,
    };
  }
}
