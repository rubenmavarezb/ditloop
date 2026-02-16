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

/** Root desktop application component with routing and theme management. */
export function App() {
  useTheme();
  const configured = useConnectionStore((s) => s.configured);

  if (!configured) {
    return <ConnectionSetup />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen flex-col bg-slate-950">
        {/* Desktop shell placeholder — will be replaced in Task 064 */}
        <main className="flex-1 overflow-auto">
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
        </main>
      </div>
    </BrowserRouter>
  );
}
