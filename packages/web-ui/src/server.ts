// Server-dependent exports — used by mobile (PWA), NOT by desktop.
// Desktop uses local Tauri commands instead of API/WebSocket.

// API
export { apiFetch, checkHealth, ApiError } from './api/client.js';
export { DitLoopWebSocket, ditloopWs } from './api/websocket.js';

// Connection store
export { useConnectionStore } from './store/connection.js';
export type { ConnectionState, ConnectionStatus } from './store/connection.js';

// Server hooks
export { useApiFetch } from './hooks/useApiFetch.js';
export { useConnection } from './hooks/useConnection.js';

// Server-dependent views
export { ConnectionSetup } from './views/ConnectionSetup/index.js';
export { Chat } from './views/Chat/index.js';
export { WorkspaceList, WorkspaceDetail } from './views/Workspaces/index.js';
export { ExecutionList, ExecutionDetail } from './views/Executions/index.js';
export { ApprovalList, ApprovalDetail } from './views/Approvals/index.js';
export { Settings } from './views/Settings/index.js';
