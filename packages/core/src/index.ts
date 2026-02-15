// @ditloop/core — DitLoop Core Engine
// Workspace management, git profiles, AI providers, execution, and AIDF integration

export const version = '0.1.0';

// Events (task 006)
export * from './events/index.js';

// Config (task 002)
export * from './config/index.js';

// Workspace (task 003)
export * from './workspace/index.js';

// Profile + Identity Guard (task 004, 005)
export * from './profile/index.js';

// AIDF (task 007, 008)
export * from './aidf/index.js';

// Future modules:
// - git
// - chat
// - provider
// - executor
// - safety
