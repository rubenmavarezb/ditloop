import { useState } from 'react';
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
  { path: '/files', label: 'Files', icon: '~' },
  { path: '/settings', label: 'Settings', icon: '*' },
];

/** Sidebar navigation with collapsible width. */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-slate-800 bg-slate-950 transition-[width] duration-200 ${
        collapsed ? 'w-12' : 'w-48'
      }`}
    >
      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-0.5 p-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'bg-slate-800 text-ditloop-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="w-5 text-center font-mono text-xs font-bold">
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center border-t border-slate-800 py-2 text-xs text-slate-500 hover:text-white"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '\u00BB' : '\u00AB'}
      </button>
    </aside>
  );
}
