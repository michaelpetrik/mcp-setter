/**
 * Shared Infrastructure Implementation: McpRegistryHttpClient
 * Concrete implementation for MCP registry API
 */

import { injectable, inject } from 'tsyringe';
import {
  IMcpRegistryClient,
  RegistrySearchOptions,
  RegistrySearchResponse,
} from './IMcpRegistryClient';
import { IHttpClient, HttpError } from '../http/IHttpClient';
import { McpRegistryServer } from '../../domain/entities/McpRegistryServer';

/**
 * MCP Registry HTTP Client
 * Implements registry API v0 specification
 *
 * SOLID Principles:
 * - SRP: Only responsible for registry API communication
 * - DIP: Depends on IHttpClient interface
 */
@injectable()
export class McpRegistryHttpClient implements IMcpRegistryClient {
  private readonly baseUrl: string = 'https://registry.modelcontextprotocol.io';
  private readonly apiVersion: string = 'v0';

  constructor(@inject('IHttpClient') private readonly httpClient: IHttpClient) {}

  async searchServers(options: RegistrySearchOptions = {}): Promise<RegistrySearchResponse> {
    const { search, updatedSince, version, limit, cursor } = options;

    const queryParams: Record<string, string | number> = {};

    if (search) {
      queryParams.search = search;
    }

    if (updatedSince) {
      queryParams.updated_since = updatedSince.toISOString();
    }

    if (version) {
      queryParams.version = version;
    }

    if (limit) {
      queryParams.limit = limit;
    }

    if (cursor) {
      queryParams.cursor = cursor;
    }

    try {
      const response = await this.httpClient.get<RegistryApiResponse>(
        `${this.baseUrl}/${this.apiVersion}/servers`,
        { queryParams }
      );

      return this.parseRegistryResponse(response.data);
    } catch (error) {
      if (error instanceof HttpError) {
        throw new Error(`Registry API error: ${error.message}`);
      }
      throw error;
    }
  }

  async getServer(serverName: string, version?: string): Promise<McpRegistryServer | null> {
    try {
      // Search for the specific server
      const response = await this.searchServers({
        search: serverName,
        version: version ? 'latest' : undefined,
        limit: 50, // Get enough results to find exact match
      });

      // Find exact match (case-sensitive)
      const exactMatch = response.servers.find(s => s.name === serverName);

      if (!exactMatch) {
        return null;
      }

      // If version specified, check if it matches
      if (version && exactMatch.version !== version) {
        return null;
      }

      return exactMatch;
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getLatestServer(serverName: string): Promise<McpRegistryServer | null> {
    return this.getServer(serverName); // Without version, it should return latest
  }

  async listServers(limit: number = 20, cursor?: string): Promise<RegistrySearchResponse> {
    return this.searchServers({ limit, cursor });
  }

  /**
   * Parse the registry API response
   * Handles both paginated and non-paginated responses
   */
  private parseRegistryResponse(data: RegistryApiResponse): RegistrySearchResponse {
    const servers: McpRegistryServer[] = [];

    // Parse servers array
    if (data.servers && Array.isArray(data.servers)) {
      for (const serverData of data.servers) {
        try {
          servers.push(new McpRegistryServer(serverData));
        } catch (error) {
          // Log but don't fail on individual server parse errors
          console.warn(`Failed to parse server: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return {
      servers,
      nextCursor: data.nextCursor,
      hasMore: !!data.nextCursor,
      total: data.total,
    };
  }
}

/**
 * Registry API response structure
 * Based on official registry API v0 specification
 */
interface RegistryApiResponse {
  servers: unknown[];
  nextCursor?: string;
  total?: number;
}
