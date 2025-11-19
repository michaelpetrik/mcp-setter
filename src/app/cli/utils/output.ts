/**
 * CLI Output Utilities
 * Helpers for formatting CLI output
 */

/**
 * Print a success message
 */
export function success(message: string): void {
  console.log(`✓ ${message}`);
}

/**
 * Print an error message
 */
export function error(message: string): void {
  console.error(`✗ ${message}`);
}

/**
 * Print an info message
 */
export function info(message: string): void {
  console.log(`ℹ ${message}`);
}

/**
 * Print a warning message
 */
export function warn(message: string): void {
  console.warn(`⚠ ${message}`);
}

/**
 * Print a section header
 */
export function header(title: string): void {
  console.log(`\n${'='.repeat(60)}`);
  console.log(title);
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Print a table row
 */
export function tableRow(columns: string[], widths: number[]): void {
  const row = columns.map((col, i) => col.padEnd(widths[i])).join(' | ');
  console.log(row);
}

/**
 * Print a table separator
 */
export function tableSeparator(widths: number[]): void {
  const separator = widths.map(w => '-'.repeat(w)).join('-+-');
  console.log(separator);
}

/**
 * Print a formatted table
 */
export function table(headers: string[], rows: string[][], widths?: number[]): void {
  // Auto-calculate widths if not provided
  const columnWidths =
    widths ||
    headers.map((header, i) => {
      const maxRowWidth = Math.max(...rows.map(row => (row[i] || '').length));
      return Math.max(header.length, maxRowWidth);
    });

  // Print headers
  tableRow(headers, columnWidths);
  tableSeparator(columnWidths);

  // Print rows
  rows.forEach(row => tableRow(row, columnWidths));
}

/**
 * Print JSON output (for --json flag)
 */
export function json(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Print a list with bullets
 */
export function list(items: string[]): void {
  items.forEach(item => console.log(`  • ${item}`));
}

/**
 * Print a numbered list
 */
export function numberedList(items: string[]): void {
  items.forEach((item, i) => console.log(`  ${i + 1}. ${item}`));
}
