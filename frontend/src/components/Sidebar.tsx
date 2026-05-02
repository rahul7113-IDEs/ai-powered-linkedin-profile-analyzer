import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Sparkles } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">

      <nav className="p-3 space-y-1 text-sm">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive
              ? 'bg-primary/10 text-primary'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/analyze"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive
              ? 'bg-primary/10 text-primary'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`
          }
        >
          <FileText className="h-4 w-4" />
          <span>Analyze Profile</span>
        </NavLink>

        <NavLink
          to="/recommendations"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive
              ? 'bg-primary/10 text-primary'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`
          }
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Recommendations</span>
        </NavLink>

      </nav>
    </aside>
  );
}

