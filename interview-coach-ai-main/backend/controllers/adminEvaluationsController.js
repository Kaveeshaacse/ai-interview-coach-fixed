import { getSupabase } from '../config/supabase.js';

// Lets staff review AI-scored interview answers. Kept as a direct,
// read-only query (no write path) since this is a review/inspection tool,
// not a place that changes student data.
export const listEvaluations = async (req, res, next) => {
  try {
    const sb = getSupabase();
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const { data, error } = await sb
      .from('interview_answers')
      .select('id, interview_id, question_text, user_answer, score, clarity_score, grammar_score, confidence_score, technical_score, feedback, evaluated_at, interviews(role, type, user_id, users(name, email))')
      .order('evaluated_at', { ascending: false })
      .limit(limit);
    if (error) throw error;

    const evaluations = (data || []).map((row) => {
      const interview = Array.isArray(row.interviews) ? row.interviews[0] : row.interviews;
      const student = interview ? (Array.isArray(interview.users) ? interview.users[0] : interview.users) : null;
      return {
        id: row.id,
        questionText: row.question_text,
        userAnswer: row.user_answer,
        score: row.score,
        clarityScore: row.clarity_score,
        grammarScore: row.grammar_score,
        confidenceScore: row.confidence_score,
        technicalScore: row.technical_score,
        feedback: row.feedback,
        evaluatedAt: row.evaluated_at,
        interviewType: interview?.type,
        role: interview?.role,
        studentName: student?.name,
        studentEmail: student?.email,
      };
    });

    res.json({ success: true, evaluations });
  } catch (err) {
    next(err);
  }
};

export default { listEvaluations };
