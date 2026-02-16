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
  contactEmail: z.string().default('ditloop@localhost').describe('Contact email for VAPID push notifications'),
});

export type ServerConfig = z.infer<typeof ServerSchema>;

// --- Defaults ---

export const DefaultsSchema = z.object({
  profile: z.string().optional(),
  editor: z.string().default('$EDITOR'),
  aidf: z.boolean().default(true),
});

export type Defaults = z.infer<typeof DefaultsSchema>;

// --- Provider config ---

export const ProviderConfigSchema = z.object({
  type: z.enum(['claude', 'openai']),
  apiKey: z.string().optional().describe('API key. Falls back to env variable if not set.'),
  model: z.string().optional().describe('Default model to use'),
  baseURL: z.string().url().optional().describe('Custom API endpoint'),
});

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

// --- Quiet Hours ---

export const QuietHoursSchema = z.object({
  enabled: z.boolean().default(false),
  start: z.string().regex(/^\d{2}:\d{2}$/).default('22:00').describe('Start time in HH:MM format'),
  end: z.string().regex(/^\d{2}:\d{2}$/).default('08:00').describe('End time in HH:MM format'),
});

export type QuietHours = z.infer<typeof QuietHoursSchema>;

// --- Notification Event Toggles ---

export const NotificationEventTogglesSchema = z.object({
  'approval-requested': z.boolean().default(true),
  'execution-completed': z.boolean().default(true),
  'execution-failed': z.boolean().default(true),
  'session-message': z.boolean().default(true),
});

export type NotificationEventToggles = z.infer<typeof NotificationEventTogglesSchema>;

// --- Per-Workspace Notification Override ---

export const WorkspaceNotificationOverrideSchema = z.object({
  enabled: z.boolean().optional(),
  events: NotificationEventTogglesSchema.partial().optional(),
});

export type WorkspaceNotificationOverride = z.infer<typeof WorkspaceNotificationOverrideSchema>;

// --- Notification Preferences ---

export const NotificationPreferencesSchema = z.object({
  enabled: z.boolean().default(true),
  quietHours: QuietHoursSchema.default({}),
  events: NotificationEventTogglesSchema.default({}),
  workspaceOverrides: z.record(z.string(), WorkspaceNotificationOverrideSchema).default({}),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

// --- Root config ---

export const DitLoopConfigSchema = z.object({
  profiles: z.record(z.string(), ProfileSchema).default({}),
  workspaces: z.array(WorkspaceSchema).default([]),
  defaults: DefaultsSchema.default({}),
  server: ServerSchema.default({}),
  providers: z.record(z.string(), ProviderConfigSchema).default({}),
  notifications: NotificationPreferencesSchema.default({}),
});

export type DitLoopConfig = z.infer<typeof DitLoopConfigSchema>;
