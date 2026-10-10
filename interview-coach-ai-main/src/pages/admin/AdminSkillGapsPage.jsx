import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../../components/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { adminAPI } from '../../services/adminApi';

function WeakAreaList({ title, items, kind, onSelect }) {
  if (items.length === 0) return <p className="text-sm text-slate-500 italic">No data yet.</p>;
  return (
    <div className="space-y-2">
      {items.map((w) => (
        <button
          key={w.label}
          onClick={() => onSelect({ kind, label: w.label, count: w.count })}
          className="w-full flex items-center justify-between text-sm px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-left"
        >
          <span className="text-slate-300">{w.label}</span>
          <span className="text-purple-300 font-medium">{w.count}</span>
        </button>
      ))}
    </div>
  );
}

function StudentsDrawer({ selection, onClose }) {
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    adminAPI.getWeakAreaStudents(selection.kind, selection.label)
      .then((res) => setStudents(res.data.students))
      .catch((err) => setError(err.response?.data?.message || 'Could not load students'))
      .finally(() => setLoading(false));
  }, [selection]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#141432] border border-[#2a2a5a] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{selection.label}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {selection.kind === 'aptitude' ? 'Students with this aptitude weak area' : 'Students with this interview weakness'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="h-24 flex items-center justify-center"><LoadingSpinner /></div>
        ) : error ? (
          <ErrorMessage message={error} />
        ) : students.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No matching students found.</p>
        ) : (
          <div className="space-y-2">
            {students.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0f0f2a] border border-[#2a2a5a]">
                <div>
                  <p className="text-white text-sm font-medium">{s.name}</p>
                  <p className="text-slate-500 text-xs">{s.email}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  {selection.kind === 'aptitude' ? (
                    <>
                      <p>{s.category}</p>
                      <p>{s.accuracy != null ? `${Math.round(s.accuracy)}% accuracy` : ''}</p>
                    </>
                  ) : (
                    <>
                      <p>{s.role}</p>
                      <p>{s.score != null ? `${Math.round(s.score)}/100` : ''}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSkillGapsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState(null); // { kind: 'aptitude'|'interview', label, count }

  useEffect(() => {
    adminAPI.getAnalytics()
      .then((res) => setAnalytics(res.data.analytics))
      .catch((err) => setError(err.response?.data?.message || 'Could not load skill gaps'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Skill Gaps</h1>
        <p className="text-slate-400 mt-1 text-sm">The weak areas showing up most often across all students' real attempts — click any row to see which students</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Most Common Aptitude Weak Areas</CardTitle></CardHeader>
          <WeakAreaList title="aptitude" items={analytics.topAptitudeWeakAreas} kind="aptitude" onSelect={setSelection} />
        </Card>

        <Card>
          <CardHeader><CardTitle>Most Common Interview Weaknesses</CardTitle></CardHeader>
          <WeakAreaList title="interview" items={analytics.topInterviewWeaknesses} kind="interview" onSelect={setSelection} />
        </Card>
      </div>

      {selection && <StudentsDrawer selection={selection} onClose={() => setSelection(null)} />}
    </div>
  );
}
