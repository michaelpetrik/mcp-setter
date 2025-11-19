/**
 * Shared Value Object: ConfigFormat
 * Represents the format of configuration files
 */

export enum ConfigFormat {
  JSON = 'json',
  YAML = 'yaml',
  TOML = 'toml',
}

/**
 * ConfigFormat Value Object
 */
export class ConfigFormatVO {
  private constructor(private readonly value: ConfigFormat) {}

  static fromString(value: string): ConfigFormatVO {
    const normalizedValue = value.toLowerCase();
    const configFormat = Object.values(ConfigFormat).find(format => format === normalizedValue);

    if (!configFormat) {
      throw new Error(
        `Invalid config format: ${value}. Supported: ${Object.values(ConfigFormat).join(', ')}`
      );
    }

    return new ConfigFormatVO(configFormat);
  }

  static fromFileName(fileName: string): ConfigFormatVO {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'json':
        return ConfigFormatVO.json();
      case 'yaml':
      case 'yml':
        return ConfigFormatVO.yaml();
      case 'toml':
        return ConfigFormatVO.toml();
      default:
        throw new Error(`Cannot determine config format from file name: ${fileName}`);
    }
  }

  static json(): ConfigFormatVO {
    return new ConfigFormatVO(ConfigFormat.JSON);
  }

  static yaml(): ConfigFormatVO {
    return new ConfigFormatVO(ConfigFormat.YAML);
  }

  static toml(): ConfigFormatVO {
    return new ConfigFormatVO(ConfigFormat.TOML);
  }

  getValue(): ConfigFormat {
    return this.value;
  }

  getFileExtension(): string {
    return `.${this.value}`;
  }

  getDisplayName(): string {
    return this.value.toUpperCase();
  }

  equals(other: ConfigFormatVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
