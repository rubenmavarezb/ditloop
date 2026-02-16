export { loadConfig, DEFAULT_CONFIG_DIR, DEFAULT_CONFIG_PATH } from './loader.js';
export type { LoadConfigOptions } from './loader.js';
export {
  DitLoopConfigSchema,
  ProfileSchema,
  SingleWorkspaceSchema,
  GroupWorkspaceSchema,
  WorkspaceSchema,
  ServerSchema,
  DefaultsSchema,
  NotificationPreferencesSchema,
  NotificationEventTogglesSchema,
  QuietHoursSchema,
  WorkspaceNotificationOverrideSchema,
} from './schema.js';
export type {
  DitLoopConfig,
  Profile,
  SingleWorkspace,
  GroupWorkspace,
  Workspace,
  ServerConfig,
  Defaults,
  NotificationPreferences,
  NotificationEventToggles,
  QuietHours,
  WorkspaceNotificationOverride,
} from './schema.js';
