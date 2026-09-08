import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Target,
  Mic,
  Monitor,
  Code2,
  Brain,
  Lightbulb,
  BarChart3,
  User,
  LogOut,
  X,
  GraduationCap,
  GitCompare,
} from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume', label: 'Resume Analyzer', icon: FileText },
  { to: '/ats', label: 'ATS Score', icon: Target },
  { to: '/job-match', label: 'Job Match', icon: GitCompare },
  { to: '/mock-interview', label: 'Mock Interview', icon: Mic },
  { to: '/technical', label: 'Technical Interview', icon: Monitor },
  { to: '/coding', label: 'Coding Practice', icon: Code2 },
  { to: '/aptitude', label: 'Aptitude', icon: Brain },
  { to: '/communication', label: 'Communication', icon: GraduationCap },
  { to: '/skills', label: 'Skill Recommendations', icon: Lightbulb },
  { to: '/performance', label: 'Performance', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-[#0c0c24]/95 backdrop-blur-xl border-r border-[#2a2a5a]
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2a2a5a]">
          <NavLink to="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold gradient-text leading-tight">Interview</h1>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase">Coach AI</p>
            </div>
          </NavLink>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/10 text-purple-300 border border-purple-500/20 shadow-lg shadow-purple-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* logout */}
        <div className="p-4 border-t border-[#2a2a5a]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
