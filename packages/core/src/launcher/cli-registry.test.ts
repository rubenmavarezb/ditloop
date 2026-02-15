import { describe, it, expect, beforeEach } from 'vitest';
import { CliRegistry } from './cli-registry.js';

describe('CliRegistry', () => {
  let registry: CliRegistry;

  beforeEach(() => {
    registry = new CliRegistry();
  });

  describe('built-in CLIs', () => {
    it('registers claude, aider, and copilot by default', () => {
      const ids = registry.listIds();
      expect(ids).toContain('claude');
      expect(ids).toContain('aider');
      expect(ids).toContain('copilot');
    });

    it('has correct definition for claude', () => {
      const def = registry.get('claude');
      expect(def).toBeDefined();
      expect(def?.name).toBe('Claude Code');
      expect(def?.binary).toBe('claude');
      expect(def?.contextInjection.type).toBe('flag');
    });

    it('has correct definition for aider', () => {
      const def = registry.get('aider');
      expect(def).toBeDefined();
      expect(def?.name).toBe('Aider');
      expect(def?.binary).toBe('aider');
    });
  });

  describe('register', () => {
    it('adds a new CLI definition', () => {
      registry.register('custom', {
        name: 'Custom AI',
        binary: 'custom-ai',
        versionFlag: '--version',
        contextInjection: { type: 'flag', flag: '--context' },
        installUrl: 'https://example.com',
      });

      expect(registry.get('custom')).toBeDefined();
      expect(registry.listIds()).toContain('custom');
    });
  });

  describe('detectAvailable', () => {
    it('returns an array of detected CLIs', () => {
      const detected = registry.detectAvailable();
      expect(Array.isArray(detected)).toBe(true);

      // All detected CLIs should have required properties
      for (const cli of detected) {
        expect(cli.definition).toBeDefined();
        expect(cli.binaryPath).toBeTruthy();
        expect(cli.available).toBe(true);
      }
    });

    it('caches results', () => {
      const first = registry.detectAvailable();
      const second = registry.detectAvailable();
      expect(first).toBe(second);
    });

    it('refresh bypasses cache', () => {
      const first = registry.detectAvailable();
      const second = registry.detectAvailable(true);
      expect(first).not.toBe(second);
    });
  });

  describe('detect', () => {
    it('returns undefined for unknown CLI', () => {
      expect(registry.detect('nonexistent')).toBeUndefined();
    });

    it('returns detected CLI for known binary', () => {
      // Register a CLI that uses a binary we know exists
      registry.register('node-test', {
        name: 'Node Test',
        binary: 'node',
        versionFlag: '--version',
        contextInjection: { type: 'flag', flag: '--eval' },
        installUrl: 'https://nodejs.org',
      });

      const detected = registry.detect('node-test');
      expect(detected).toBeDefined();
      expect(detected?.available).toBe(true);
      expect(detected?.version).toMatch(/\d+\.\d+/);
    });
  });

  describe('invalidateCache', () => {
    it('clears the cache', () => {
      const first = registry.detectAvailable();
      registry.invalidateCache();
      const second = registry.detectAvailable();
      expect(first).not.toBe(second);
    });
  });
});
