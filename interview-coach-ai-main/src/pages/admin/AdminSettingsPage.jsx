import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { adminAPI } from '../../services/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

function NumberField({ label, hint, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-[#0f0f2a] border border-[#2a2a5a] text-white text-sm"
      />
      {hint && <p className="text-slate-500 text-xs mt-1">{hint}</p>}
    </div>
  );
}

export default function AdminSettingsPage() {
  const { admin } = useAdminAuth();
  const canEdit = admin?.role === 'admin';

  const [evaluation, setEvaluation] = useState(null);
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingEval, setSavingEval] = useState(false);
  const [savingInterview, setSavingInterview] = useState(false);

  useEffect(() => {
    Promise.all([adminAPI.getEvaluationSettings(), adminAPI.getInterviewSettings()])
      .then(([evRes, ivRes]) => {
        setEvaluation(evRes.data.settings);
        setInterview(ivRes.data.settings);
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load settings'))
      .finally(() => setLoading(false));
  }, []);

  const saveEvaluation = async () => {
    setSavingEval(true);
    try {
      const res = await adminAPI.updateEvaluationSettings(evaluation);
      setEvaluation(res.data.settings);
      toast.success('Evaluation settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save evaluation settings');
    } finally {
      setSavingEval(false);
    }
  };

  const saveInterview = async () => {
    setSavingInterview(true);
    try {
      const res = await adminAPI.updateInterviewSettings(interview);
      setInterview(res.data.settings);
      toast.success('Interview settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save interview settings');
    } finally {
      setSavingInterview(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (error) return <ErrorMessage message={error} />;
  if (!evaluation || !interview) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1 text-sm">
          {canEdit
            ? 'These control live behavior — the attention threshold below is the same one the Dashboard and Alerts use right now.'
            : 'Staff can view settings; only an admin can change them.'}
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Evaluation Settings</CardTitle></CardHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberField
            label="Passing score"
            hint="Score (0-100) considered a pass on an interview/evaluation."
            value={evaluation.passingScore}
            onChange={(v) => setEvaluation((p) => ({ ...p, passingScore: v }))}
          />
          <NumberField
            label="Attention threshold"
            hint="Students with an overall score below this are flagged on the Dashboard and Alerts."
            value={evaluation.attentionThreshold}
            onChange={(v) => setEvaluation((p) => ({ ...p, attentionThreshold: v }))}
          />
        </div>
        {canEdit && (
          <Button icon={Save} loading={savingEval} onClick={saveEvaluation} className="mt-4">
            Save Evaluation Settings
          </Button>
        )}
      </Card>

      <Card>
        <CardHeader><CardTitle>Interview Settings</CardTitle></CardHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <NumberField
            label="Default duration (minutes)"
            value={interview.defaultDurationMinutes}
            onChange={(v) => setInterview((p) => ({ ...p, defaultDurationMinutes: v }))}
          />
          <NumberField
            label="Questions per interview"
            value={interview.questionsPerInterview}
            onChange={(v) => setInterview((p) => ({ ...p, questionsPerInterview: v }))}
          />
        </div>
        {canEdit && (
          <Button icon={Save} loading={savingInterview} onClick={saveInterview} className="mt-4">
            Save Interview Settings
          </Button>
        )}
      </Card>
    </div>
  );
}
