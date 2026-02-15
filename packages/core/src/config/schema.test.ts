import { describe, it, expect } from 'vitest';
import {
  DitLoopConfigSchema,
  ProfileSchema,
  SingleWorkspaceSchema,
  GroupWorkspaceSchema,
} from './schema.js';

describe('ProfileSchema', () => {
  it('validates a complete profile', () => {
    const result = ProfileSchema.parse({
      name: 'Ruben',
      email: 'rubennmavarezb@gmail.com',
      sshHost: 'github-personal',
      platform: 'github',
    });
    expect(result.name).toBe('Ruben');
    expect(result.platform).toBe('github');
  });

  it('applies default platform', () => {
    const result = ProfileSchema.parse({ name: 'Ruben', email: 'r@test.com' });
    expect(result.platform).toBe('github');
  });

  it('rejects invalid email', () => {
    expect(() => ProfileSchema.parse({ name: 'Ruben', email: 'not-an-email' })).toThrow();
  });

  it('rejects empty name', () => {
    expect(() => ProfileSchema.parse({ name: '', email: 'r@test.com' })).toThrow();
  });
});

describe('SingleWorkspaceSchema', () => {
  it('validates a single workspace', () => {
    const result = SingleWorkspaceSchema.parse({
      name: 'OnyxOdds',
      path: '/Users/ruben/Documentos/onyxodds',
      profile: 'onyxodds',
    });
    expect(result.type).toBe('single');
    expect(result.aidf).toBe(true);
  });
});

describe('GroupWorkspaceSchema', () => {
  it('validates a group workspace', () => {
    const result = GroupWorkspaceSchema.parse({
      type: 'group',
      name: 'Solu',
      path: '/Users/ruben/Documents/freelance/solu',
      profile: 'solu',
    });
    expect(result.autoDiscover).toBe(true);
    expect(result.exclude).toEqual([]);
  });

  it('accepts exclude list', () => {
    const result = GroupWorkspaceSchema.parse({
      type: 'group',
      name: 'Solu',
      path: '/some/path',
      profile: 'solu',
      exclude: ['node_modules', '.git'],
    });
    expect(result.exclude).toEqual(['node_modules', '.git']);
  });
});

describe('DitLoopConfigSchema', () => {
  it('parses a full config', () => {
    const result = DitLoopConfigSchema.parse({
      profiles: {
        personal: { name: 'Ruben', email: 'rubennmavarezb@gmail.com', sshHost: 'github-personal' },
        solu: { name: 'Ruben', email: 'ruben.mavarez@wearesolu.com', sshHost: 'github-solu' },
      },
      workspaces: [
        { type: 'single', name: 'DitLoop', path: '/Users/ruben/Documentos/hitloop', profile: 'personal' },
        { type: 'group', name: 'Solu', path: '/Users/ruben/Documents/freelance/solu', profile: 'solu' },
      ],
      defaults: { profile: 'personal' },
      server: { enabled: true, port: 9847 },
    });

    expect(Object.keys(result.profiles)).toHaveLength(2);
    expect(result.workspaces).toHaveLength(2);
    expect(result.defaults.profile).toBe('personal');
    expect(result.server.enabled).toBe(true);
  });

  it('applies all defaults for empty config', () => {
    const result = DitLoopConfigSchema.parse({});
    expect(result.profiles).toEqual({});
    expect(result.workspaces).toEqual([]);
    expect(result.defaults.aidf).toBe(true);
    expect(result.defaults.editor).toBe('$EDITOR');
    expect(result.server.enabled).toBe(false);
    expect(result.server.port).toBe(9847);
    expect(result.server.host).toBe('127.0.0.1');
  });

  it('rejects workspace with unknown type', () => {
    expect(() =>
      DitLoopConfigSchema.parse({
        workspaces: [{ type: 'unknown', name: 'x', path: '/x', profile: 'x' }],
      })
    ).toThrow();
  });

  it('rejects workspace referencing missing fields', () => {
    expect(() =>
      DitLoopConfigSchema.parse({
        workspaces: [{ type: 'single', path: '/x', profile: 'x' }],
      })
    ).toThrow();
  });

  it('rejects invalid server port', () => {
    expect(() =>
      DitLoopConfigSchema.parse({ server: { port: 80 } })
    ).toThrow();
  });
});
