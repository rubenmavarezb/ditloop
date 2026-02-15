import { execSync } from 'node:child_process';

/** Configuration for a supported AI CLI tool. */
export interface CliDefinition {
  /** CLI display name. */
  name: string;
  /** Binary name to detect on PATH. */
  binary: string;
  /** How to get version (flag). */
  versionFlag: string;
  /** How to inject context. */
  contextInjection: ContextInjectionMode;
  /** Default arguments when launching. */
  defaultArgs?: string[];
  /** Install URL for when CLI is not found. */
  installUrl: string;
}

/** How context gets injected into the AI CLI. */
export type ContextInjectionMode =
  | { type: 'flag'; flag: string }
  | { type: 'file'; fileName: string }
  | { type: 'env'; envVar: string };

/** Detected CLI with version and path info. */
export interface DetectedCli {
  /** CLI definition. */
  definition: CliDefinition;
  /** Resolved binary path. */
  binaryPath: string;
  /** Version string. */
  version: string;
  /** Whether the CLI is available for launch. */
  available: boolean;
}

/**
 * Registry of supported AI CLI tools with detection and launch configuration.
 * Extensible via the register() method.
 */
export class CliRegistry {
  private definitions: Map<string, CliDefinition> = new Map();
  private cache: DetectedCli[] | undefined;

  constructor() {
    // Register built-in CLIs
    this.registerBuiltIns();
  }

  /**
   * Register a new CLI definition.
   *
   * @param id - Unique CLI identifier
   * @param definition - CLI configuration
   */
  register(id: string, definition: CliDefinition): void {
    this.definitions.set(id, definition);
    this.cache = undefined; // Invalidate cache
  }

  /**
   * Get a CLI definition by ID.
   *
   * @param id - CLI identifier
   * @returns CLI definition or undefined
   */
  get(id: string): CliDefinition | undefined {
    return this.definitions.get(id);
  }

  /**
   * List all registered CLI IDs.
   *
   * @returns Array of CLI identifiers
   */
  listIds(): string[] {
    return Array.from(this.definitions.keys());
  }

  /**
   * Detect all available AI CLIs on the system.
   *
   * @param refresh - Force re-detection (bypass cache)
   * @returns Array of detected CLIs
   */
  detectAvailable(refresh = false): DetectedCli[] {
    if (this.cache && !refresh) {
      return this.cache;
    }

    const results: DetectedCli[] = [];

    for (const [_id, def] of this.definitions) {
      const detected = this.detectCli(def);
      if (detected) {
        results.push(detected);
      }
    }

    this.cache = results;
    return this.cache;
  }

  /**
   * Check if a specific CLI is available.
   *
   * @param id - CLI identifier
   * @returns Detected CLI or undefined
   */
  detect(id: string): DetectedCli | undefined {
    const def = this.definitions.get(id);
    if (!def) return undefined;
    return this.detectCli(def);
  }

  /**
   * Invalidate the detection cache.
   */
  invalidateCache(): void {
    this.cache = undefined;
  }

  private detectCli(definition: CliDefinition): DetectedCli | undefined {
    try {
      const binaryPath = execSync(`which ${definition.binary}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      if (!binaryPath) return undefined;

      let version = 'unknown';
      try {
        version = execSync(`${definition.binary} ${definition.versionFlag}`, {
          encoding: 'utf-8',
          timeout: 5000,
          stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();
        // Extract just the version number if possible
        const versionMatch = version.match(/(\d+\.\d+[\d.]*)/);
        if (versionMatch) version = versionMatch[1];
      } catch {
        // Binary exists but version check failed — still available
      }

      return { definition, binaryPath, version, available: true };
    } catch {
      return undefined;
    }
  }

  private registerBuiltIns(): void {
    this.definitions.set('claude', {
      name: 'Claude Code',
      binary: 'claude',
      versionFlag: '--version',
      contextInjection: { type: 'flag', flag: '--system-prompt' },
      defaultArgs: [],
      installUrl: 'https://docs.anthropic.com/en/docs/claude-code',
    });

    this.definitions.set('aider', {
      name: 'Aider',
      binary: 'aider',
      versionFlag: '--version',
      contextInjection: { type: 'flag', flag: '--message' },
      defaultArgs: [],
      installUrl: 'https://aider.chat/docs/install.html',
    });

    this.definitions.set('copilot', {
      name: 'GitHub Copilot CLI',
      binary: 'gh',
      versionFlag: 'copilot --version',
      contextInjection: { type: 'env', envVar: 'COPILOT_INSTRUCTIONS' },
      defaultArgs: ['copilot'],
      installUrl: 'https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line',
    });
  }
}
