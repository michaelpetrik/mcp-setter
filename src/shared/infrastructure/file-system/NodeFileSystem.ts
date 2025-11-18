/**
 * Shared Infrastructure Implementation: NodeFileSystem
 * Concrete implementation using fs-extra
 */

import * as fs from 'fs-extra';
import { IFileSystem } from './IFileSystem';

/**
 * Node.js file system implementation
 * SRP: Only responsible for file system operations
 */
export class NodeFileSystem implements IFileSystem {
  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async readFile(path: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    return fs.readFile(path, encoding);
  }

  async writeFile(
    path: string,
    content: string,
    encoding: BufferEncoding = 'utf-8'
  ): Promise<void> {
    await fs.writeFile(path, content, encoding);
  }

  async copyFile(source: string, destination: string): Promise<void> {
    await fs.copy(source, destination);
  }

  async ensureDir(path: string): Promise<void> {
    await fs.ensureDir(path);
  }

  async stat(path: string): Promise<{ isFile: boolean; isDirectory: boolean; size: number }> {
    const stats = await fs.stat(path);
    return {
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      size: stats.size,
    };
  }
}
