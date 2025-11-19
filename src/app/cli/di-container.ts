/**
 * CLI Dependency Injection Container
 * Registers all dependencies for the CLI application
 */

import 'reflect-metadata';
import { container } from 'tsyringe';

// Infrastructure
import { IFileSystem } from '@/shared/infrastructure/file-system/IFileSystem';
import { NodeFileSystem } from '@/shared/infrastructure/file-system/NodeFileSystem';
import { IHttpClient } from '@/shared/infrastructure/http/IHttpClient';
import { NodeHttpClient } from '@/shared/infrastructure/http/NodeHttpClient';
import { IMcpRegistryClient } from '@/shared/infrastructure/registry/IMcpRegistryClient';
import { McpRegistryHttpClient } from '@/shared/infrastructure/registry/McpRegistryHttpClient';
import { IConfigLocator } from '@/shared/infrastructure/config-locator/IConfigLocator';
import { NodeConfigLocator } from '@/shared/infrastructure/config-locator/NodeConfigLocator';

// Features - Client Detection
import { IClientDetector } from '@/features/client-detection/domain/IClientDetector';
import { MultiClientDetector } from '@/features/client-detection/infrastructure/MultiClientDetector';

// Features - Credentials Management
import { ICredentialsManager } from '@/features/credentials-management/domain/ICredentialsManager';
import { DotEnvCredentialsManager } from '@/features/credentials-management/infrastructure/DotEnvCredentialsManager';

// Features - MCP Installation
import { IConfigManager } from '@/features/mcp-installation/domain/IConfigManager';
import { JsonConfigManager } from '@/features/mcp-installation/infrastructure/JsonConfigManager';

// Features - User Preferences
import { IPreferencesService } from '@/features/user-preferences/domain/IPreferencesService';
import { JsonPreferencesStorage } from '@/features/user-preferences/infrastructure/JsonPreferencesStorage';

// Telemetry
import { ITelemetryService } from '@/shared/infrastructure/telemetry/ITelemetryService';
import { TelemetryServiceFactory } from '@/shared/infrastructure/telemetry/TelemetryServiceFactory';

// Permissions
import { IPermissionsService } from '@/shared/infrastructure/permissions/IPermissionsService';
import { NodePermissionsService } from '@/shared/infrastructure/permissions/NodePermissionsService';

/**
 * Initialize and configure the DI container
 */
export function initializeContainer(): void {
  // Register shared infrastructure
  container.register<IFileSystem>('IFileSystem', {
    useClass: NodeFileSystem,
  });

  container.register<IHttpClient>('IHttpClient', {
    useClass: NodeHttpClient,
  });

  container.register<IMcpRegistryClient>('IMcpRegistryClient', {
    useClass: McpRegistryHttpClient,
  });

  container.register<IConfigLocator>('IConfigLocator', {
    useClass: NodeConfigLocator,
  });

  // Register feature services
  container.register<IClientDetector>('IClientDetector', {
    useClass: MultiClientDetector,
  });

  container.register<ICredentialsManager>('ICredentialsManager', {
    useClass: DotEnvCredentialsManager,
  });

  container.register<IConfigManager>('IConfigManager', {
    useClass: JsonConfigManager,
  });

  container.register<IPreferencesService>('IPreferencesService', {
    useClass: JsonPreferencesStorage,
  });

  // Register telemetry service (factory creates the right implementation)
  container.register<ITelemetryService>('ITelemetryService', {
    useFactory: () => TelemetryServiceFactory.create(),
  });

  // Register permissions service
  container.register<IPermissionsService>('IPermissionsService', {
    useClass: NodePermissionsService,
  });

  // Use cases are auto-registered via @injectable() decorator
}

export { container };
