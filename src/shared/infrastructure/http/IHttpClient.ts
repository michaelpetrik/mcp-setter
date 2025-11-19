/**
 * Shared Infrastructure Interface: IHttpClient
 * Abstract HTTP operations following DIP
 */

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
  timeout?: number;
  queryParams?: Record<string, string | number | boolean>;
}

export interface HttpResponse<T = unknown> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly statusText: string,
    public readonly url: string,
    public readonly responseBody?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * IHttpClient Interface
 * Abstraction for HTTP operations
 */
export interface IHttpClient {
  /**
   * Perform a GET request
   */
  get<T = unknown>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;

  /**
   * Perform a POST request
   */
  post<T = unknown>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;

  /**
   * Perform a PUT request
   */
  put<T = unknown>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;

  /**
   * Perform a DELETE request
   */
  delete<T = unknown>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;

  /**
   * Perform a generic HTTP request
   */
  request<T = unknown>(url: string, options: HttpRequestOptions): Promise<HttpResponse<T>>;
}
