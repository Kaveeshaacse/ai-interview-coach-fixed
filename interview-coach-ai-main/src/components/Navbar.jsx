import { Menu, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0c0c24]/80 backdrop-blur-xl border-b border-[#2a2a5a] flex items-center justify-between px-4 lg:px-6">
      {/* left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-slate-300" />
        </button>

        {/* search bar */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141432] border border-[#2a2a5a] focus-within:border-purple-500/50 transition-colors w-72">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search features..."
            className="bg-transparent text-sm text-slate-300 placeholder:text-slate-500 outline-none flex-1"
          />
        </div>
      </div>

      {/* right */}
      <div className="flex items-center gap-3">
        {/* notifications */}
        <NotificationBell />

        {/* avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#2a2a5a]">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-200">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-500">{user?.email || 'user@email.com'}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-purple-500/20">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
