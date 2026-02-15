import { z } from 'zod';

// --- Profile ---

export const ProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  sshHost: z.string().optional(),
  platform: z.enum(['github', 'bitbucket', 'azure', 'gitlab']).default('github'),
});

export type Profile = z.infer<typeof ProfileSchema>;

// --- Workspace: Single ---

export const SingleWorkspaceSchema = z.object({
  type: z.literal('single').default('single'),
  name: z.string().min(1),
  path: z.string().min(1),
  profile: z.string().min(1),
  aidf: z.boolean().default(true),
});

export type SingleWorkspace = z.infer<typeof SingleWorkspaceSchema>;

// --- Workspace: Group ---

export const GroupWorkspaceSchema = z.object({
  type: z.literal('group'),
  name: z.string().min(1),
  path: z.string().min(1),
  profile: z.string().min(1),
  aidf: z.boolean().default(true),
  autoDiscover: z.boolean().default(true),
  exclude: z.array(z.string()).default([]),
});

export type GroupWorkspace = z.infer<typeof GroupWorkspaceSchema>;

// --- Workspace union ---

export const WorkspaceSchema = z.discriminatedUnion('type', [
  SingleWorkspaceSchema,
  GroupWorkspaceSchema,
]);

export type Workspace = z.infer<typeof WorkspaceSchema>;

// --- Server (for future mobile PWA) ---

export const ServerSchema = z.object({
  enabled: z.boolean().default(false),
  port: z.number().int().min(1024).max(65535).default(9847),
  host: z.string().default('127.0.0.1'),
});

export type ServerConfig = z.infer<typeof ServerSchema>;

// --- Defaults ---

export const DefaultsSchema = z.object({
  profile: z.string().optional(),
  editor: z.string().default('$EDITOR'),
  aidf: z.boolean().default(true),
});

export type Defaults = z.infer<typeof DefaultsSchema>;

// --- Root config ---

export const DitLoopConfigSchema = z.object({
  profiles: z.record(z.string(), ProfileSchema).default({}),
  workspaces: z.array(WorkspaceSchema).default([]),
  defaults: DefaultsSchema.default({}),
  server: ServerSchema.default({}),
});

export type DitLoopConfig = z.infer<typeof DitLoopConfigSchema>;
