import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, UserCog, BarChart3, LogOut, ShieldCheck,
  SlidersHorizontal, History, AlertTriangle, ClipboardCheck, TrendingDown,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminNotificationBell from '../components/AdminNotificationBell';

const NAV = [
  { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/staff', label: 'Staff Members', icon: UserCog },
  { to: '/admin/questions', label: 'Question Bank', icon: BookOpen },
  { to: '/admin/evaluations', label: 'Evaluations', icon: ClipboardCheck },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/skill-gaps', label: 'Skill Gaps', icon: TrendingDown },
  { to: '/admin/settings', label: 'Settings', icon: SlidersHorizontal },
  { to: '/admin/alerts', label: 'Alerts', icon: AlertTriangle },
  { to: '/admin/audit-log', label: 'Audit Log', icon: History },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/staff-login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a1a]">
      <aside className="w-64 flex-shrink-0 bg-[#0f0f2a] border-r border-[#2a2a5a] flex flex-col">
        <div className="p-5 flex items-center gap-2 border-b border-[#2a2a5a]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Admin Portal</p>
            <p className="text-slate-500 text-xs">{admin?.role === 'admin' ? 'Administrator' : 'Staff'}</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[#2a2a5a]">
          <div className="px-3 py-2 mb-2">
            <p className="text-white text-sm font-medium truncate">{admin?.name}</p>
            <p className="text-slate-500 text-xs truncate">{admin?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-end px-4 lg:px-6 py-3 border-b border-[#2a2a5a] bg-[#0f0f2a]/60">
          <AdminNotificationBell />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
