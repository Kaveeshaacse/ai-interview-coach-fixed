import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search, Download, Eye, Ban, RotateCcw, X } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { adminAPI } from '../../services/adminApi';

function StudentDetailModal({ studentId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStudent(studentId)
      .then((res) => setDetail(res.data.student))
      .catch(() => toast.error('Could not load student detail'))
      .finally(() => setLoading(false));
  }, [studentId]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#141432] border border-[#2a2a5a] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Student Detail</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        {loading ? <LoadingSpinner /> : detail ? (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-white font-semibold">{detail.name}</p>
              <p className="text-slate-400">{detail.email} {detail.college ? `· ${detail.college}` : ''}</p>
            </div>
            {detail.scores && (
              <div className="grid grid-cols-3 gap-2">
                {['resume_score', 'ats_score', 'interview_score', 'communication_score', 'coding_score', 'aptitude_score'].map((k) => (
                  <div key={k} className="bg-[#0f0f2a] rounded-lg p-2 border border-[#2a2a5a]">
                    <p className="text-slate-500 text-xs capitalize">{k.replace('_score', '')}</p>
                    <p className="text-white font-bold">{Math.round(detail.scores[k] || 0)}</p>
                  </div>
                ))}
              </div>
            )}
            <div>
              <p className="text-slate-300 font-medium mb-1">Recent Interviews ({detail.recentInterviews.length})</p>
              {detail.recentInterviews.slice(0, 5).map((iv) => (
                <p key={iv.id} className="text-slate-500 text-xs">{iv.type} — {iv.role} — {iv.status} — {Math.round(iv.total_score || 0)}/100</p>
              ))}
            </div>
          </div>
        ) : <p className="text-slate-500">Not found.</p>}
      </div>
    </div>
  );
}

export default function AdminStudentsPage() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [viewingId, setViewingId] = useState(null);

  const load = useCallback((q = search) => {
    setLoading(true);
    adminAPI.listStudents(q)
      .then((res) => setStudents(res.data.students))
      .catch((err) => setError(err.response?.data?.message || 'Could not load students'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(search); }, []); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const toggleActive = async (student) => {
    try {
      if (student.isActive) {
        await adminAPI.deactivateStudent(student.id);
        toast.success(`${student.name} deactivated`);
      } else {
        await adminAPI.reactivateStudent(student.id);
        toast.success(`${student.name} reactivated`);
      }
      load(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const exportCsv = async () => {
    try {
      const res = await adminAPI.exportStudentsCsv();
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'students.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Management</h1>
          <p className="text-slate-400 mt-1 text-sm">{students.length} students</p>
        </div>
        <Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or college..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      {loading ? <div className="h-40 flex items-center justify-center"><LoadingSpinner /></div>
        : error ? <ErrorMessage message={error} />
        : (
        <Card hover={false} className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0f0f2a] text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">College</th>
                  <th className="text-left px-4 py-3">Interviews</th>
                  <th className="text-left px-4 py-3">Avg Score</th>
                  <th className="text-left px-4 py-3">Last Active</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-[#2a2a5a] hover:bg-white/5">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{s.name}</p>
                      <p className="text-slate-500 text-xs">{s.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{s.college || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{s.interviews}</td>
                    <td className="px-4 py-3 text-slate-400">{s.averageScore ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleDateString() : 'Never'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${s.isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                        {s.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => setViewingId(s.id)} className="text-slate-400 hover:text-purple-300 cursor-pointer" title="View"><Eye className="w-4 h-4 inline" /></button>
                      <button
                        onClick={() => toggleActive(s)}
                        className={`cursor-pointer ${s.isActive ? 'text-slate-400 hover:text-red-400' : 'text-slate-400 hover:text-emerald-400'}`}
                        title={s.isActive ? 'Deactivate' : 'Reactivate'}
                      >
                        {s.isActive ? <Ban className="w-4 h-4 inline" /> : <RotateCcw className="w-4 h-4 inline" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-500">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {viewingId && <StudentDetailModal studentId={viewingId} onClose={() => setViewingId(null)} />}
    </div>
  );
}
