import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UserPlus, Ban, RotateCcw, X } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { adminAPI } from '../../services/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

function AddStaffModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createStaff(form);
      toast.success('Staff account created');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <form onSubmit={submit} className="bg-[#141432] border border-[#2a2a5a] rounded-2xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Add Staff Account</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[#0f0f2a] border border-[#2a2a5a] text-white text-sm" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[#0f0f2a] border border-[#2a2a5a] text-white text-sm" />
        <input required type="password" placeholder="Password (6+ characters)" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[#0f0f2a] border border-[#2a2a5a] text-white text-sm" />
        <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-[#0f0f2a] border border-[#2a2a5a] text-white text-sm">
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        <Button type="submit" loading={saving} className="w-full">Create Account</Button>
      </form>
    </div>
  );
}

export default function AdminStaffPage() {
  const { admin } = useAdminAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const loadStaff = () => {
    setLoading(true);
    adminAPI.listStaff()
      .then((res) => setStaff(res.data.staff))
      .catch((err) => setError(err.response?.data?.message || 'Could not load staff'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadStaff(); }, []);

  const toggleStaffActive = async (s) => {
    try {
      if (s.is_active) { await adminAPI.deactivateStaff(s.id); toast.success('Deactivated'); }
      else { await adminAPI.reactivateStaff(s.id); toast.success('Reactivated'); }
      loadStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Members</h1>
          <p className="text-slate-400 mt-1 text-sm">Manage staff and admin accounts for this portal</p>
        </div>
        {admin?.role === 'admin' && (
          <Button icon={UserPlus} onClick={() => setShowAdd(true)}>Add Staff</Button>
        )}
      </div>

      {loading ? <div className="h-40 flex items-center justify-center"><LoadingSpinner /></div>
        : error ? <ErrorMessage message={error} />
        : (
          <Card hover={false} className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0f0f2a] text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Role</th>
                    <th className="text-left px-4 py-3">Last Login</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id} className="border-t border-[#2a2a5a] hover:bg-white/5">
                      <td className="px-4 py-3"><p className="text-white font-medium">{s.name}</p><p className="text-slate-500 text-xs">{s.email}</p></td>
                      <td className="px-4 py-3 text-slate-400 capitalize">{s.role}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{s.last_login_at ? new Date(s.last_login_at).toLocaleDateString() : 'Never'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${s.is_active !== false ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                          {s.is_active !== false ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {admin?.role === 'admin' && s.id !== admin.id && (
                          <button
                            onClick={() => toggleStaffActive(s)}
                            className={`cursor-pointer ${s.is_active !== false ? 'text-slate-400 hover:text-red-400' : 'text-slate-400 hover:text-emerald-400'}`}
                          >
                            {s.is_active !== false ? <Ban className="w-4 h-4 inline" /> : <RotateCcw className="w-4 h-4 inline" />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-500">No staff accounts yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      {showAdd && <AddStaffModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); loadStaff(); }} />}
    </div>
  );
}
