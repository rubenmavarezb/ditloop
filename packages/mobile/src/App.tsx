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
import { AppShell } from './components/Layout/AppShell.js';

/** Root application component with routing and theme management. */
export function App() {
  useTheme();
  const configured = useConnectionStore((s) => s.configured);

  if (!configured) {
    return <ConnectionSetup />;
  }

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<WorkspaceList />} />
          <Route path="/workspace/:id" element={<WorkspaceDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/approvals" element={<ApprovalList />} />
          <Route path="/approvals/:id" element={<ApprovalDetail />} />
          <Route path="/executions" element={<ExecutionList />} />
          <Route path="/executions/:id" element={<ExecutionDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
