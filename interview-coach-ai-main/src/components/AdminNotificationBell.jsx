import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { adminAPI } from '../services/adminApi';

const TYPE_DOT = { info: 'bg-blue-400', warning: 'bg-amber-400', action: 'bg-purple-400' };

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const load = useCallback(() => {
    adminAPI.listNotifications()
      .then((res) => {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000); // poll every minute — real data, not static
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const markAllRead = async () => {
    try {
      await adminAPI.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // non-critical — leave state as-is, next poll will reconcile
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer"
      >
        <Bell className="w-4 h-4 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#141432] border border-[#2a2a5a] rounded-xl shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a5a]">
            <p className="text-white text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-purple-300 hover:text-purple-200 cursor-pointer">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 italic">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-[#2a2a5a]">
              {notifications.map((n) => (
                <div key={n.id} className={`p-3 flex gap-2 ${n.is_read ? 'opacity-60' : ''}`}>
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${TYPE_DOT[n.type] || TYPE_DOT.info}`} />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium">{n.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{n.message}</p>
                    <p className="text-slate-500 text-[10px] mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
