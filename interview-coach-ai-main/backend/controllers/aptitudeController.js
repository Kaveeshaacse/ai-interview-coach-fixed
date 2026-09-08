import { aptitudeRepository } from '../repositories/aptitude.repository.js';
import { recordActivity      } from '../services/activity.service.js';
import { getQuestionsByCategory } from '../utils/aptitudeQuestions.js';

export const getAptitudeCategories = async (req, res) => {
  res.json({
    success: true,
    categories: [
      { id: 'quantitative', label: 'Quantitative Aptitude',        totalQuestions: 10, timeMinutes: 10, icon: '📊' },
      { id: 'logical',      label: 'Logical Reasoning',            totalQuestions: 10, timeMinutes: 10, icon: '🧠' },
      { id: 'verbal',       label: 'Verbal Ability',               totalQuestions: 10, timeMinutes: 10, icon: '📝' },
      { id: 'all',          label: 'Full Mock Assessment (Combined)', totalQuestions: 30, timeMinutes: 30, icon: '🎯' },
    ],
  });
};

export const startAptitudeTest = async (req, res, next) => {
  try {
    const category = (req.body?.category || req.query?.category || 'quantitative').toLowerCase();
    const questions = getQuestionsByCategory(category);

    // Strip answers before sending to client
    const sanitized = questions.map(q => ({
      id:       q.id,
      question: q.question,
      options:  q.options,
      category: q.category,
    }));

    res.json({
      success:          true,
      testId:           `test-${category}-${Date.now()}`,
      category,
      totalQuestions:   sanitized.length,
      timeLimitMinutes: category === 'all' ? 30 : 10,
      questions:        sanitized,
    });
  } catch (err) {
    next(err);
  }
};

export const submitAptitudeTest = async (req, res, next) => {
  try {
    const category  = (req.body?.category || 'quantitative').toLowerCase();
    const timeTaken = req.body?.timeTaken || '08:45';

    // Normalize answers from any payload format
    const answersMap = new Map();
    if (Array.isArray(req.body?.answers)) {
      req.body.answers.forEach(item => {
        if (item?.questionId !== undefined) {
          answersMap.set(Number(item.questionId), item.selectedAnswer != null ? String(item.selectedAnswer).trim() : '');
        }
      });
    } else if (req.body?.answers && typeof req.body.answers === 'object') {
      Object.entries(req.body.answers).forEach(([id, ans]) => {
        answersMap.set(Number(id), ans != null ? String(ans).trim() : '');
      });
    } else if (req.body?.userAnswers && typeof req.body.userAnswers === 'object') {
      Object.entries(req.body.userAnswers).forEach(([id, ans]) => {
        answersMap.set(Number(id), ans != null ? String(ans).trim() : '');
      });
    }

    const questions = getQuestionsByCategory(category);
    let correct = 0, wrong = 0, unanswered = 0;
    const categoryStats = {};
    const detailedReview = [];

    for (const q of questions) {
      const cat = q.category || 'General';
      if (!categoryStats[cat]) categoryStats[cat] = { total: 0, correct: 0 };
      categoryStats[cat].total++;

      let selected = answersMap.get(q.id);
      if (selected !== undefined && !isNaN(Number(selected)) && q.options[Number(selected)]) {
        selected = q.options[Number(selected)];
      }

      const isEmpty = selected === undefined || selected === null || selected === '';
      if (isEmpty) {
        unanswered++;
        detailedReview.push({ questionId: q.id, question: q.question, category: cat, options: q.options, selectedAnswer: null, correctAnswer: q.correctAnswer, isCorrect: false, status: 'unanswered', explanation: q.explanation });
        continue;
      }

      const isCorrect = String(selected).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
      if (isCorrect) { correct++; categoryStats[cat].correct++; }
      else            { wrong++; }

      detailedReview.push({ questionId: q.id, question: q.question, category: cat, options: q.options, selectedAnswer: selected, correctAnswer: q.correctAnswer, isCorrect, status: isCorrect ? 'correct' : 'wrong', explanation: q.explanation });
    }

    const total    = questions.length;
    const score    = total > 0 ? Math.round((correct / total) * 100) : 0;
    const answered = correct + wrong;
    const accuracy = answered > 0 ? Number(((correct / answered) * 100).toFixed(2)) : 0;

    const categoryScores = {};
    const weakAreas      = [];
    Object.entries(categoryStats).forEach(([cat, stats]) => {
      if (stats.total > 0) {
        const pct = Math.round((stats.correct / stats.total) * 100);
        categoryScores[cat] = pct;
        if (pct < 70) weakAreas.push(cat);
      }
    });
    if (weakAreas.length === 0 && score < 75) weakAreas.push('Speed & Accuracy', 'Time Management');

    // Save to DB
    const attempt = await aptitudeRepository.create(req.user.id, {
      category, totalQuestions: total, correctAnswers: correct,
      wrongAnswers: wrong, unanswered, score, accuracy, timeTaken,
      weakAreas: weakAreas.length ? weakAreas : ['Pacing & Complex Problems'],
      categoryScores,
    });

    await aptitudeRepository.saveAnswers(attempt.id, detailedReview);

    recordActivity(req.user.id, 'aptitude', { score }).catch(() => {});

    res.json({
      success: true,
      totalQuestions: total, total,
      correctAnswers: correct, wrongAnswers: wrong, unanswered,
      score, accuracy, timeTaken, category, categoryScores,
      weakAreas: weakAreas.length ? weakAreas : ['Pacing & Complex Problems'],
      categoryBreakdown: [
        { label: 'Correct',    value: correct,     color: '#10b981' },
        { label: 'Wrong',      value: wrong,        color: '#ef4444' },
        { label: 'Unanswered', value: unanswered,   color: '#64748b' },
      ],
      review: detailedReview,
    });
  } catch (err) {
    next(err);
  }
};

export const getAptitudeHistory = async (req, res, next) => {
  try {
    const records  = await aptitudeRepository.findByUser(req.user.id);
    const attempts = records.map(r => ({
      id:             r.id,
      date:           new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      category:       r.category.charAt(0).toUpperCase() + r.category.slice(1),
      score:          r.score,
      accuracy:       `${r.accuracy}%`,
      duration:       r.time_taken,
      totalQuestions: r.total_questions,
      correctAnswers: r.correct_answers,
    }));
    res.json({ success: true, count: attempts.length, attempts });
  } catch (err) {
    next(err);
  }
};

export default { getAptitudeCategories, startAptitudeTest, submitAptitudeTest, getAptitudeHistory };
