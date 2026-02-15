import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';
import { AiLauncher } from './ai-launcher.js';
import { EventBus } from '../events/index.js';

describe('AiLauncher', () => {
  let eventBus: EventBus;
  let launcher: AiLauncher;
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'ditloop-launcher-'));
    eventBus = new EventBus();
    launcher = new AiLauncher(eventBus);

    // Create a minimal workspace
    mkdirSync(join(tempDir, '.ai', 'tasks'), { recursive: true });
    writeFileSync(join(tempDir, 'package.json'), '{"name": "test"}');

    // Init git
    execSync('git init', { cwd: tempDir, stdio: 'ignore' });
    execSync('git config user.email "test@test.com"', { cwd: tempDir, stdio: 'ignore' });
    execSync('git config user.name "Test"', { cwd: tempDir, stdio: 'ignore' });
    execSync('git add -A && git commit -m "init"', { cwd: tempDir, stdio: 'ignore' });
  });

  afterEach(() => {
    launcher.kill();
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('detectAvailable', () => {
    it('returns detected CLIs', () => {
      const detected = launcher.detectAvailable();
      expect(Array.isArray(detected)).toBe(true);
    });
  });

  describe('getRegistry', () => {
    it('returns the CLI registry', () => {
      const registry = launcher.getRegistry();
      expect(registry.listIds()).toContain('claude');
    });

    it('allows registering custom CLIs', () => {
      launcher.getRegistry().register('echo-test', {
        name: 'Echo Test',
        binary: 'echo',
        versionFlag: '--version',
        contextInjection: { type: 'flag', flag: '' },
        installUrl: 'n/a',
      });

      expect(launcher.getRegistry().get('echo-test')).toBeDefined();
    });
  });

  describe('launch (non-interactive)', () => {
    it('throws for unknown CLI', async () => {
      await expect(launcher.launch('unknown-cli', {
        workspacePath: tempDir,
        interactive: false,
      })).rejects.toThrow('Unknown AI CLI');
    });

    it('launches a registered CLI and captures output', async () => {
      // Register echo as a test CLI
      launcher.getRegistry().register('echo-test', {
        name: 'Echo Test',
        binary: 'echo',
        versionFlag: '"1.0"',
        contextInjection: { type: 'env', envVar: 'DITLOOP_CONTEXT' },
        installUrl: 'n/a',
      });

      const result = await launcher.launch('echo-test', {
        workspacePath: tempDir,
        interactive: false,
        extraArgs: ['hello', 'from', 'ditloop'],
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('hello from ditloop');
    });

    it('emits launcher:started and launcher:exited events', async () => {
      const events: string[] = [];
      eventBus.on('launcher:started', () => events.push('started'));
      eventBus.on('launcher:exited', () => events.push('exited'));

      launcher.getRegistry().register('true-test', {
        name: 'True Test',
        binary: 'true',
        versionFlag: '',
        contextInjection: { type: 'env', envVar: 'DITLOOP_CONTEXT' },
        installUrl: 'n/a',
      });

      await launcher.launch('true-test', {
        workspacePath: tempDir,
        interactive: false,
      });

      expect(events).toEqual(['started', 'exited']);
    });
  });

  describe('isRunning', () => {
    it('returns false when no process is running', () => {
      expect(launcher.isRunning).toBe(false);
    });
  });
});
