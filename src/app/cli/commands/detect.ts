/**
 * CLI Command: detect
 * Detect installed MCP clients on the system
 */

import { container } from '../di-container';
import { DetectClientsUseCase } from '@/features/client-detection/application/DetectClientsUseCase';
import * as output from '../utils/output';
import { detectOS, getCurrentWorkingDirectory } from '../utils/os-helper';

export interface DetectCommandOptions {
  projectPath?: string;
  json?: boolean;
}

/**
 * Execute the detect command
 */
export async function detectCommand(options: DetectCommandOptions = {}): Promise<void> {
  const { projectPath, json: jsonOutput } = options;

  try {
    // Resolve use case from container
    const useCase = container.resolve(DetectClientsUseCase);

    // Detect OS
    const os = detectOS();

    // Use provided project path or current directory
    const projectDir = projectPath || getCurrentWorkingDirectory();

    // Execute detection
    output.info('Detecting installed MCP clients...\n');

    const result = await useCase.execute({
      operatingSystem: os,
      projectPath: projectDir,
    });

    // Output results
    if (jsonOutput) {
      output.json(result);
      return;
    }

    // Human-readable output
    output.header(`Detected MCP Clients (${os})`);

    if (result.totalFound === 0) {
      output.warn('No MCP clients detected on this system');
      output.info('\nSupported clients: Claude Desktop, Claude CLI, Cursor, Continue, Gemini CLI');
      return;
    }

    output.success(`Found ${result.totalFound} client(s)\n`);

    // Global clients
    if (result.globalClients.length > 0) {
      console.log('Global Clients:');
      result.globalClients.forEach(client => {
        console.log(`  ✓ ${client.clientType.getDisplayName()}`);
        console.log(`    Config: ${client.configPath}`);
        if (client.version) {
          console.log(`    Version: ${client.version}`);
        }
        console.log('');
      });
    }

    // Project-specific clients
    if (result.projectClients.length > 0) {
      console.log('Project-Specific Clients:');
      result.projectClients.forEach(client => {
        console.log(`  ✓ ${client.clientType.getDisplayName()}`);
        console.log(`    Project: ${client.projectPath}`);
        console.log(`    Config: ${client.configPath}`);
        console.log('');
      });
    }

    output.success('Detection completed');
  } catch (err) {
    output.error(`Detection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    process.exit(1);
  }
}
