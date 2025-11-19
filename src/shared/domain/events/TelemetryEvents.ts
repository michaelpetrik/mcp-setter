/**
 * Domain Events: Telemetry Events Catalog
 * Defines all telemetry events tracked by the application
 *
 * PRIVACY: All events are designed to exclude sensitive data
 * (API keys, secrets, raw configs, etc.)
 */

/**
 * Base telemetry event properties
 * Automatically added to all events
 */
export interface BaseTelemetryProperties {
  /** Operating system type */
  os: 'windows' | 'macos' | 'linux';
  /** Operating system version */
  os_version: string;
  /** Application version */
  app_version: string;
  /** Installation channel/source (homebrew, npm, direct, etc.) */
  install_channel?: string;
  /** Whether running in CLI or Desktop mode */
  interface_type: 'cli' | 'desktop';
  /** Session ID (generated per app launch) */
  session_id: string;
  /** Timestamp */
  timestamp: string;
}

/**
 * Event Categories
 */
export enum TelemetryEventCategory {
  // MCP Registry Operations
  REGISTRY_SEARCH = 'registry_search',
  REGISTRY_VIEW = 'registry_view',
  REGISTRY_LIST = 'registry_list',

  // MCP Installation
  MCP_INSTALL_STARTED = 'mcp_install_started',
  MCP_INSTALL_COMPLETED = 'mcp_install_completed',
  MCP_INSTALL_FAILED = 'mcp_install_failed',

  // MCP Configuration
  MCP_CONFIGURE_STARTED = 'mcp_configure_started',
  MCP_CONFIGURE_COMPLETED = 'mcp_configure_completed',
  MCP_CONFIGURE_FAILED = 'mcp_configure_failed',

  // MCP Uninstall
  MCP_UNINSTALL_STARTED = 'mcp_uninstall_started',
  MCP_UNINSTALL_COMPLETED = 'mcp_uninstall_completed',
  MCP_UNINSTALL_FAILED = 'mcp_uninstall_failed',

  // Cross-Client Management
  MCP_COPY_STARTED = 'mcp_copy_started',
  MCP_COPY_COMPLETED = 'mcp_copy_completed',
  MCP_COPY_FAILED = 'mcp_copy_failed',
  MCP_MOVE_STARTED = 'mcp_move_started',
  MCP_MOVE_COMPLETED = 'mcp_move_completed',
  MCP_MOVE_FAILED = 'mcp_move_failed',

  // Healthcheck
  HEALTHCHECK_STARTED = 'healthcheck_started',
  HEALTHCHECK_COMPLETED = 'healthcheck_completed',
  HEALTHCHECK_FAILED = 'healthcheck_failed',

  // Backup & Restore
  BACKUP_STARTED = 'backup_started',
  BACKUP_COMPLETED = 'backup_completed',
  BACKUP_FAILED = 'backup_failed',
  RESTORE_STARTED = 'restore_started',
  RESTORE_COMPLETED = 'restore_completed',
  RESTORE_FAILED = 'restore_failed',

  // Client Detection
  CLIENT_DETECTION_STARTED = 'client_detection_started',
  CLIENT_DETECTION_COMPLETED = 'client_detection_completed',

  // Application Lifecycle
  APP_STARTED = 'app_started',
  APP_CLOSED = 'app_closed',
  CLI_COMMAND_EXECUTED = 'cli_command_executed',

  // Desktop GUI (future)
  SCREEN_VIEWED = 'screen_viewed',
  BUTTON_CLICKED = 'button_clicked',

  // Errors
  ERROR_OCCURRED = 'error_occurred',
  PERMISSION_DENIED = 'permission_denied',

  // Settings
  PREFERENCES_UPDATED = 'preferences_updated',
  TELEMETRY_DISABLED = 'telemetry_disabled',
  TELEMETRY_ENABLED = 'telemetry_enabled',
}

/**
 * Error Categories (for safe error reporting)
 */
export enum ErrorCategory {
  NETWORK_ERROR = 'network_error',
  FILESYSTEM_ERROR = 'filesystem_error',
  PERMISSION_DENIED = 'permission_denied',
  VALIDATION_ERROR = 'validation_error',
  CONFIG_PARSE_ERROR = 'config_parse_error',
  REGISTRY_API_ERROR = 'registry_api_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * Event-specific payloads
 * Note: All payloads are designed to exclude sensitive data
 */

export interface RegistrySearchEvent {
  query?: string; // Anonymized/trimmed if needed
  result_count: number;
  duration_ms: number;
}

export interface McpInstallEvent {
  client_type: string;
  mcp_server_name: string; // Public registry name (safe)
  mcp_server_version?: string;
  custom_name_used: boolean;
  backup_created: boolean;
  duration_ms?: number;
}

export interface McpConfigureEvent {
  client_type: string;
  mcp_server_name: string;
  credentials_provided: boolean; // Boolean only, not the actual credentials
  credential_count: number; // Count of fields, not values
  duration_ms?: number;
}

export interface McpCopyMoveEvent {
  source_client_type: string;
  target_client_type: string;
  mcp_server_name: string;
  credentials_copied: boolean;
  backup_created: boolean;
  duration_ms?: number;
}

export interface HealthcheckEvent {
  client_type: string;
  mcp_server_name: string;
  health_status: 'ok' | 'degraded' | 'broken';
  check_count: number;
  duration_ms?: number;
}

export interface BackupRestoreEvent {
  clients_included: string[]; // List of client types
  total_servers: number;
  credentials_included: boolean;
  backup_size_kb?: number;
  duration_ms?: number;
}

export interface ClientDetectionEvent {
  detected_clients: string[]; // List of detected client types
  detection_duration_ms: number;
}

export interface AppLifecycleEvent {
  startup_duration_ms?: number;
  uptime_seconds?: number;
}

export interface CliCommandEvent {
  command_name: string;
  // Safe flags only (no values)
  flags_used: string[];
  success: boolean;
  duration_ms: number;
}

export interface ScreenViewedEvent {
  screen_name: string;
  previous_screen?: string;
}

export interface ButtonClickedEvent {
  button_id: string;
  screen_name: string;
}

export interface ErrorOccurredEvent {
  error_category: ErrorCategory;
  error_code?: string; // OS error codes (EACCES, ENOENT, etc.)
  feature: string; // Which feature/use case
  // NO raw error messages (may contain paths/secrets)
}

export interface PreferencesUpdatedEvent {
  preferences_changed: string[]; // Keys changed, not values
}

/**
 * Union type of all event payloads
 */
export type TelemetryEventPayload =
  | RegistrySearchEvent
  | McpInstallEvent
  | McpConfigureEvent
  | McpCopyMoveEvent
  | HealthcheckEvent
  | BackupRestoreEvent
  | ClientDetectionEvent
  | AppLifecycleEvent
  | CliCommandEvent
  | ScreenViewedEvent
  | ButtonClickedEvent
  | ErrorOccurredEvent
  | PreferencesUpdatedEvent
  | Record<string, unknown>;

/**
 * Complete telemetry event structure
 */
export interface TelemetryEvent {
  category: TelemetryEventCategory;
  properties: BaseTelemetryProperties & TelemetryEventPayload;
}
