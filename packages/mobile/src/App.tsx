import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme.js';
import { useConnectionStore } from './store/connection.js';
import { ConnectionSetup } from './views/ConnectionSetup/index.js';
import { Chat } from './views/Chat/index.js';
import { WorkspaceList, WorkspaceDetail } from './views/Workspaces/index.js';
import { ExecutionList, ExecutionDetail } from './views/Executions/index.js';
import { ApprovalList, ApprovalDetail } from './views/Approvals/index.js';
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
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
