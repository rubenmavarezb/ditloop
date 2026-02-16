import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  useTheme,
  useConnectionStore,
  ConnectionSetup,
  Chat,
  WorkspaceList,
  WorkspaceDetail,
  ExecutionList,
  ExecutionDetail,
  ApprovalList,
  ApprovalDetail,
  Settings,
} from '@ditloop/web-ui';
import { DesktopShell } from './components/Layout/DesktopShell.js';

/** Placeholder for the filesystem browser view (Task 067). */
function FileBrowserPlaceholder() {
  return (
    <div className="flex h-full items-center justify-center text-slate-500">
      <p>File browser — coming soon</p>
    </div>
  );
}

/** Root desktop application component with routing and theme management. */
export function App() {
  useTheme();
  const configured = useConnectionStore((s) => s.configured);

  if (!configured) {
    return <ConnectionSetup />;
  }

  return (
    <BrowserRouter>
      <DesktopShell>
        <Routes>
          <Route path="/" element={<WorkspaceList />} />
          <Route path="/workspace/:id" element={<WorkspaceDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/approvals" element={<ApprovalList />} />
          <Route path="/approvals/:id" element={<ApprovalDetail />} />
          <Route path="/executions" element={<ExecutionList />} />
          <Route path="/executions/:id" element={<ExecutionDetail />} />
          <Route path="/files" element={<FileBrowserPlaceholder />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </DesktopShell>
    </BrowserRouter>
  );
}
