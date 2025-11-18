/**
 * Shared Infrastructure Interface: IFileSystem
 * Abstract file system operations following DIP
 */

export interface IFileSystem {
  /**
   * Check if file exists
   */
  exists(path: string): Promise<boolean>;

  /**
   * Read file as string
   */
  readFile(path: string, encoding?: BufferEncoding): Promise<string>;

  /**
   * Write file
   */
  writeFile(path: string, content: string, encoding?: BufferEncoding): Promise<void>;

  /**
   * Copy file
   */
  copyFile(source: string, destination: string): Promise<void>;

  /**
   * Create directory recursively
   */
  ensureDir(path: string): Promise<void>;

  /**
   * Get file stats
   */
  stat(path: string): Promise<{ isFile: boolean; isDirectory: boolean; size: number }>;
}
