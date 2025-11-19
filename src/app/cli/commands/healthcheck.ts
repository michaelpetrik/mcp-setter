/**
 * CLI Command: healthcheck
 * Check health of an MCP server
 */

import { container } from '../di-container';
import { DetectSpecificClientUseCase } from '@/features/client-detection/application/DetectSpecificClientUseCase';
import { RunHealthCheckUseCase } from '@/features/healthcheck/application/RunHealthCheckUseCase';
import { ClientType } from '@/shared/domain/value-objects/ClientType';
import * as output from '../utils/output';
import { detectOS } from '../utils/os-helper';

export interface HealthCheckCommandOptions {
  serverName: string;
  client: string;
  json?: boolean;
}

/**
 * Execute the healthcheck command
 */
export async function healthcheckCommand(options: HealthCheckCommandOptions): Promise<void> {
  const { serverName, client, json: jsonOutput } = options;

  try {
    const os = detectOS();

    const detectClientUseCase = container.resolve(DetectSpecificClientUseCase);
    const healthCheckUseCase = container.resolve(RunHealthCheckUseCase);

    // Detect client
    const clientType = ClientType[client.toUpperCase().replace(/-/g, '_') as keyof typeof ClientType];
    if (!clientType) {
      output.error(`Unknown client type: ${client}`);
      process.exit(1);
    }

    const clientResult = await detectClientUseCase.execute({
      clientType,
      operatingSystem: os,
    });

    if (!clientResult.found || !clientResult.client) {
      output.error(`Client '${client}' not detected on this system`);
      process.exit(1);
    }

    // Run health check
    const result = await healthCheckUseCase.execute({
      configPath: clientResult.client.configPath,
      serverName,
      clientType: client,
    });

    if (jsonOutput) {
      output.json(result);
      return;
    }

    const { healthStatus } = result;

    output.header(`Health Check: ${serverName} @ ${client}`);

    console.log(`Status: ${healthStatus.getDisplayIcon()} ${healthStatus.state.toUpperCase()}`);
    console.log(`Summary: ${healthStatus.getSummaryMessage()}`);
    console.log('');

    // Show checks
    output.info('Checks:');
    healthStatus.checks.forEach(check => {
      const icon = check.passed ? '✓' : '✗';
      console.log(`  ${icon} ${check.check}`);
      if (check.message) {
        console.log(`    ${check.message}`);
      }
    });

    console.log('');

    if (healthStatus.isHealthy()) {
      output.success('Health check passed');
    } else if (healthStatus.isBroken()) {
      output.error('Health check failed');
      process.exit(1);
    } else {
      output.warn('Health check degraded');
    }
  } catch (err) {
    output.error(`Health check failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    process.exit(1);
  }
}
