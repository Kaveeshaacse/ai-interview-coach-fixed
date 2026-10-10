import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Ban, RotateCcw, X, PlusCircle, Trash2 } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { adminAPI } from '../../services/adminApi';

const TYPES = ['aptitude', 'technical', 'coding', 'behavioural'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const TYPE_LABELS = {
  aptitude: 'Aptitude',
  technical: 'Technical',
  coding: 'Coding',
  behavioural: 'Behavioural',
};

function emptyForm(type = 'aptitude') {
  return {
    type,
    category: '',
    difficulty: 'Medium',
    questionText: '',
    // coding — short name shown in the student-facing problem list instead of the full statement
    title: '',
    // aptitude
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    // technical
    expectedConcepts: [''],
    // coding
    constraints: '',
    testCases: [{ input: '', expectedOutput: '' }],
    // behavioural
    idealAnswerNotes: '',
  };
}

function fieldLabel(type) {
  return {
    aptitude: 'Category',
    technical: 'Technology (e.g. Java, React)',
    coding: 'Category (e.g. Arrays, Strings)',
    behavioural: 'Topic (e.g. Leadership, Conflict)',
  }[type];
}

function questionTextLabel(type) {
  return type === 'coding' ? 'Problem Statement' : 'Question Text';
}

/* ── small shared bits ─────────────────────────────────────────────────── */

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 rounded-lg bg-[#0f0f2a] border border-[#2a2a5a] text-white text-sm focus:outline-none focus:border-purple-500/50';

function DynamicList({ items, onChange, placeholderFor, addLabel, renderRow, minItems = 1, emptyItem }) {
  const update = (i, next) => onChange(items.map((it, idx) => (idx === i ? next : it)));
  const add = () => onChange([...items, emptyItem]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1">{renderRow(item, (next) => update(i, next), i)}</div>
          {items.length > minItems && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-slate-500 hover:text-red-400 cursor-pointer mt-2"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 cursor-pointer mt-1"
      >
        <PlusCircle className="w-3.5 h-3.5" /> {addLabel}
      </button>
    </div>
  );
}

/* ── per-type extra sections ───────────────────────────────────────────── */

function AptitudeFields({ form, setForm }) {
  return (
    <div className="space-y-3 border border-[#2a2a5a] rounded-xl p-3 bg-white/[0.02]">
      <p className="text-xs font-medium text-slate-300">Answer Options</p>
      <DynamicList
        items={form.options}
        minItems={2}
        emptyItem=""
        addLabel="Add option"
        onChange={(options) => setForm((p) => ({ ...p, options }))}
        renderRow={(opt, set, i) => (
          <input
            required
            value={opt}
            onChange={(e) => set(e.target.value)}
            placeholder={`Option ${i + 1}`}
            className={inputCls}
          />
        )}
      />
      <Field label="Correct Answer">
        <select
          required
          value={form.correctAnswer}
          onChange={(e) => setForm((p) => ({ ...p, correctAnswer: e.target.value }))}
          className={inputCls}
        >
          <option value="">Select the correct option…</option>
          {form.options.filter(Boolean).map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      </Field>
      <Field label="Explanation (optional)">
        <textarea
          rows={2}
          value={form.explanation}
          onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))}
          className={inputCls}
          placeholder="Why this is the correct answer"
        />
      </Field>
    </div>
  );
}

function TechnicalFields({ form, setForm }) {
  return (
    <div className="space-y-3 border border-[#2a2a5a] rounded-xl p-3 bg-white/[0.02]">
      <p className="text-xs font-medium text-slate-300">Expected Technical Terms</p>
      <p className="text-xs text-slate-500 -mt-1.5">The key concepts/keywords a strong answer should mention — used to judge the response.</p>
      <DynamicList
        items={form.expectedConcepts}
        minItems={1}
        emptyItem=""
        addLabel="Add term"
        onChange={(expectedConcepts) => setForm((p) => ({ ...p, expectedConcepts }))}
        renderRow={(term, set, i) => (
          <input
            value={term}
            onChange={(e) => set(e.target.value)}
            placeholder={`e.g. ${['closures', 'event loop', 'hoisting'][i] || 'key term'}`}
            className={inputCls}
          />
        )}
      />
    </div>
  );
}

function CodingFields({ form, setForm }) {
  return (
    <div className="space-y-3 border border-[#2a2a5a] rounded-xl p-3 bg-white/[0.02]">
      <Field label="Constraints (optional)">
        <textarea
          rows={2}
          value={form.constraints}
          onChange={(e) => setForm((p) => ({ ...p, constraints: e.target.value }))}
          className={inputCls}
          placeholder="e.g. 1 <= n <= 10^5, O(n log n) expected"
        />
      </Field>
      <p className="text-xs font-medium text-slate-300">Test Cases</p>
      <p className="text-xs text-slate-500 -mt-1.5">
        Enter exactly what a correct program reads from stdin and prints to stdout (one value per line, e.g. the array on
        line 1 and the target on line 2) — not pseudocode like "nums=[...], target=9". The submitted code is graded by
        running it and comparing its printed output to this, character for character (trimmed).
      </p>
      <DynamicList
        items={form.testCases}
        minItems={1}
        emptyItem={{ input: '', expectedOutput: '' }}
        addLabel="Add test case"
        onChange={(testCases) => setForm((p) => ({ ...p, testCases }))}
        renderRow={(tc, set, i) => (
          <div className="grid grid-cols-2 gap-2">
            <textarea
              required
              rows={2}
              value={tc.input}
              onChange={(e) => set({ ...tc, input: e.target.value })}
              placeholder={`Input ${i + 1} (one line per stdin line, e.g. an array line then a target line)`}
              className={`${inputCls} font-mono`}
            />
            <textarea
              required
              rows={2}
              value={tc.expectedOutput}
              onChange={(e) => set({ ...tc, expectedOutput: e.target.value })}
              placeholder={`Expected Output ${i + 1} (exactly what the program should print)`}
              className={`${inputCls} font-mono`}
            />
          </div>
        )}
      />
    </div>
  );
}

function BehaviouralFields({ form, setForm }) {
  return (
    <div className="space-y-3 border border-[#2a2a5a] rounded-xl p-3 bg-white/[0.02]">
      <Field label="What a strong answer should cover (optional)">
        <textarea
          rows={3}
          value={form.idealAnswerNotes}
          onChange={(e) => setForm((p) => ({ ...p, idealAnswerNotes: e.target.value }))}
          className={inputCls}
          placeholder="e.g. Uses a specific example, shows ownership of the outcome, reflects on what they'd do differently"
        />
      </Field>
    </div>
  );
}

/* ── modal ──────────────────────────────────────────────────────────────── */

function QuestionFormModal({ initial, defaultType, onClose, onSaved }) {
  const [form, setForm] = useState(initial || emptyForm(defaultType || 'aptitude'));
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let payload = {};
      if (form.type === 'aptitude') {
        const options = form.options.map((o) => o.trim()).filter(Boolean);
        if (options.length < 2) throw { response: { data: { message: 'Add at least 2 options' } } };
        if (!form.correctAnswer || !options.includes(form.correctAnswer)) {
          throw { response: { data: { message: 'Pick a correct answer that matches one of the options' } } };
        }
        payload = { options, correctAnswer: form.correctAnswer, explanation: form.explanation };
      } else if (form.type === 'technical') {
        payload = { technology: form.category, expectedConcepts: form.expectedConcepts.map((s) => s.trim()).filter(Boolean) };
      } else if (form.type === 'behavioural') {
        payload = { topic: form.category, idealAnswerNotes: form.idealAnswerNotes };
      } else if (form.type === 'coding') {
        const testCases = form.testCases
          .map((tc) => ({ input: tc.input.trim(), expectedOutput: tc.expectedOutput.trim() }))
          .filter((tc) => tc.input || tc.expectedOutput);
        if (testCases.length === 0) throw { response: { data: { message: 'Add at least one test case' } } };
        if (!form.title.trim()) throw { response: { data: { message: 'Add a short title for the problem list' } } };
        payload = { title: form.title.trim(), description: form.questionText, constraints: form.constraints, testCases };
      }

      const topLevelTitle = form.type === 'coding' ? form.title.trim() : undefined;

      if (isEdit) {
        await adminAPI.updateQuestion(initial.id, {
          title: topLevelTitle, category: form.category, difficulty: form.difficulty, questionText: form.questionText, payload,
        });
        toast.success('Question updated');
      } else {
        await adminAPI.createQuestion({
          type: form.type, title: topLevelTitle, category: form.category, difficulty: form.difficulty, questionText: form.questionText, payload,
        });
        toast.success('Question added');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <form onSubmit={submit} className="bg-[#141432] border border-[#2a2a5a] rounded-2xl max-w-xl w-full max-h-[88vh] overflow-y-auto p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{isEdit ? `Edit ${TYPE_LABELS[form.type]} Question` : `Add ${TYPE_LABELS[form.type]} Question`}</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select
              disabled={isEdit}
              value={form.type}
              onChange={(e) => setForm(emptyForm(e.target.value))}
              className={`${inputCls} disabled:opacity-50`}
            >
              {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select
              value={form.difficulty}
              onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
              className={inputCls}
            >
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        </div>

        {form.type === 'coding' && (
          <Field label="Title (short name shown in the student problem list)">
            <input
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Factorial of a Number"
              className={inputCls}
            />
          </Field>
        )}

        <Field label={fieldLabel(form.type)}>
          <input
            required
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className={inputCls}
          />
        </Field>

        <Field label={questionTextLabel(form.type)}>
          <textarea
            required
            rows={form.type === 'coding' ? 4 : 3}
            value={form.questionText}
            onChange={(e) => setForm((p) => ({ ...p, questionText: e.target.value }))}
            className={inputCls}
          />
        </Field>

        {form.type === 'aptitude' && <AptitudeFields form={form} setForm={setForm} />}
        {form.type === 'technical' && <TechnicalFields form={form} setForm={setForm} />}
        {form.type === 'coding' && <CodingFields form={form} setForm={setForm} />}
        {form.type === 'behavioural' && <BehaviouralFields form={form} setForm={setForm} />}

        <Button type="submit" loading={saving} className="w-full">{isEdit ? 'Save Changes' : 'Add Question'}</Button>
      </form>
    </div>
  );
}

/* ── page ───────────────────────────────────────────────────────────────── */

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [modalState, setModalState] = useState(null); // null | 'new' | question object

  const load = useCallback(() => {
    setLoading(true);
    adminAPI.listQuestions(typeFilter ? { type: typeFilter } : {})
      .then((res) => setQuestions(res.data.questions))
      .catch((err) => setError(err.response?.data?.message || 'Could not load questions'))
      .finally(() => setLoading(false));
  }, [typeFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (q) => {
    try {
      if (q.is_active) { await adminAPI.deactivateQuestion(q.id); toast.success('Deactivated'); }
      else { await adminAPI.activateQuestion(q.id); toast.success('Activated'); }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const openEdit = (q) => {
    setModalState({
      id: q.id,
      type: q.type,
      title: q.payload?.title || q.title || '',
      category: q.category,
      difficulty: q.difficulty,
      questionText: q.question_text,
      options: q.payload?.options?.length ? q.payload.options : ['', '', '', ''],
      correctAnswer: q.payload?.correctAnswer || '',
      explanation: q.payload?.explanation || '',
      expectedConcepts: q.payload?.expectedConcepts?.length ? q.payload.expectedConcepts : [''],
      constraints: q.payload?.constraints || '',
      testCases: q.payload?.testCases?.length ? q.payload.testCases : [{ input: '', expectedOutput: '' }],
      idealAnswerNotes: q.payload?.idealAnswerNotes || '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Question Bank</h1>
          <p className="text-slate-400 mt-1 text-sm">{questions.length} questions</p>
        </div>
        <Button icon={Plus} onClick={() => setModalState('new')}>
          Add {typeFilter ? TYPE_LABELS[typeFilter] : ''} Question
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', ...TYPES].map((t) => (
          <button
            key={t || 'all'}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize cursor-pointer ${
              typeFilter === t ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'bg-[#0f0f2a] text-slate-400 border border-[#2a2a5a] hover:text-white'
            }`}
          >
            {t || 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className="h-40 flex items-center justify-center"><LoadingSpinner /></div>
        : error ? <ErrorMessage message={error} />
        : (
        <Card hover={false} className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0f0f2a] text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Question</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Difficulty</th>
                  <th className="text-left px-4 py-3">Usage</th>
                  <th className="text-left px-4 py-3">Source</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-t border-[#2a2a5a] hover:bg-white/5">
                    <td className="px-4 py-3 text-white max-w-xs truncate" title={q.question_text}>{q.title || q.question_text}</td>
                    <td className="px-4 py-3 text-slate-400 capitalize">{q.type}</td>
                    <td className="px-4 py-3 text-slate-400">{q.category}</td>
                    <td className="px-4 py-3 text-slate-400">{q.difficulty}</td>
                    <td className="px-4 py-3 text-slate-400">{q.usage_count || 0}{q.usage_count ? ` (avg ${Math.round((q.total_score || 0) / q.usage_count)})` : ''}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs capitalize">{q.source}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${q.is_active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                        {q.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                      <button onClick={() => openEdit(q)} className="text-slate-400 hover:text-purple-300 cursor-pointer" title="Edit"><Pencil className="w-4 h-4 inline" /></button>
                      <button
                        onClick={() => toggleActive(q)}
                        className={`cursor-pointer ${q.is_active ? 'text-slate-400 hover:text-red-400' : 'text-slate-400 hover:text-emerald-400'}`}
                        title={q.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {q.is_active ? <Ban className="w-4 h-4 inline" /> : <RotateCcw className="w-4 h-4 inline" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {questions.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-slate-500">No questions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {modalState && (
        <QuestionFormModal
          key={modalState === 'new' ? `new-${typeFilter}` : modalState.id}
          initial={modalState === 'new' ? null : modalState}
          defaultType={TYPES.includes(typeFilter) ? typeFilter : 'aptitude'}
          onClose={() => setModalState(null)}
          onSaved={() => { setModalState(null); load(); }}
        />
      )}
    </div>
  );
}
