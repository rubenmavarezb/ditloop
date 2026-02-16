import { useLocation, useNavigate } from 'react-router-dom';

/** Navigation item definition. */
interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Workspaces', icon: '{}' },
  { path: '/chat', label: 'Chat', icon: '>' },
  { path: '/approvals', label: 'Approvals', icon: '!' },
  { path: '/executions', label: 'Runs', icon: '#' },
  { path: '/settings', label: 'Settings', icon: '*' },
];

/** Bottom navigation bar for mobile app. */
export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 pb-safe backdrop-blur-sm">
      <div className="flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-ditloop-400'
                  : 'text-slate-500 active:text-slate-300'
              }`}
            >
              <span className="text-base font-mono font-bold">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
