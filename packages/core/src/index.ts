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

// Git (task 015, 016, 017)
export * from './git/index.js';

// Provider (task 020, 021, 022)
export * from './provider/index.js';

// Executor (task 023, 024, 025)
export * from './executor/index.js';

// Safety (task 026, 028)
export * from './safety/index.js';

// Launcher (task 029, 030)
export * from './launcher/index.js';
