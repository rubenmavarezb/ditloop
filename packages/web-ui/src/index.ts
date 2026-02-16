// API
export { apiFetch, checkHealth, ApiError } from './api/client.js';
export { DitLoopWebSocket, ditloopWs } from './api/websocket.js';

// Stores
export { useConnectionStore } from './store/connection.js';
export { useThemeStore } from './store/theme.js';

// Hooks
export { useApiFetch } from './hooks/useApiFetch.js';
export { useConnection } from './hooks/useConnection.js';
export { useTheme } from './hooks/useTheme.js';

// Components
export {
  ConfirmDialog,
  DiffViewer,
  ExecutionCard,
  MessageBubble,
  WorkspaceCard,
} from './components/index.js';

// Views
export { ConnectionSetup } from './views/ConnectionSetup/index.js';
export { Chat } from './views/Chat/index.js';
export { WorkspaceList, WorkspaceDetail } from './views/Workspaces/index.js';
export { ExecutionList, ExecutionDetail } from './views/Executions/index.js';
export { ApprovalList, ApprovalDetail } from './views/Approvals/index.js';
export { Settings } from './views/Settings/index.js';

// Tailwind preset
export { ditloopPreset } from './tailwind.preset.js';
