/**
 * Shared Infrastructure Implementation: NodeHttpClient
 * Concrete implementation using Node.js fetch API
 */

import { IHttpClient, HttpRequestOptions, HttpResponse, HttpError } from './IHttpClient';

/**
 * Node.js HTTP client implementation
 * Uses the built-in fetch API (Node 18+)
 *
 * SOLID Principles:
 * - SRP: Only responsible for HTTP operations
 * - DIP: Implements IHttpClient interface
 */
export class NodeHttpClient implements IHttpClient {
  private readonly defaultTimeout: number = 30000; // 30 seconds

  async get<T = unknown>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = unknown>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST' });
  }

  async put<T = unknown>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT' });
  }

  async delete<T = unknown>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  async request<T = unknown>(
    url: string,
    options: HttpRequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      queryParams,
    } = options;

    // Build URL with query params
    const fullUrl = this.buildUrl(url, queryParams);

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    // Build request body
    let requestBody: string | undefined;
    if (body) {
      if (typeof body === 'string') {
        requestBody = body;
      } else {
        requestBody = JSON.stringify(body);
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = (await response.json()) as T;
      } else {
        data = (await response.text()) as unknown as T;
      }

      // Check for HTTP errors
      if (!response.ok) {
        throw new HttpError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
          fullUrl,
          data
        );
      }

      // Build response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        status: response.status,
        statusText: response.statusText,
        data,
        headers: responseHeaders,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpError(`Request timeout after ${timeout}ms`, 408, 'Request Timeout', fullUrl);
      }

      // Re-throw HttpError
      if (error instanceof HttpError) {
        throw error;
      }

      // Wrap other errors
      throw new HttpError(
        error instanceof Error ? error.message : 'Unknown HTTP error',
        0,
        'Network Error',
        fullUrl
      );
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(url: string, queryParams?: Record<string, string | number | boolean>): string {
    if (!queryParams || Object.keys(queryParams).length === 0) {
      return url;
    }

    const urlObj = new URL(url);
    Object.entries(queryParams).forEach(([key, value]) => {
      urlObj.searchParams.append(key, String(value));
    });

    return urlObj.toString();
  }
}
