import { communicationRepository } from '../repositories/communication.repository.js';
import { analyzeCommunication     } from '../services/aiService.js';
import { recordActivity           } from '../services/activity.service.js';
import { getMergedCommunicationQuestions } from '../services/questionBankBridge.service.js';

export const getCommunicationQuestions = async (req, res, next) => {
  try {
    const questions = await getMergedCommunicationQuestions();
    res.json({ success: true, questions });
  } catch (err) {
    next(err);
  }
};

export const evaluateCommunication = async (req, res, next) => {
  try {
    const { question = '', answer = '', text = '' } = req.body;
    const evaluatedAnswer = String(answer || text).trim();
    const evaluatedQuestion = String(question).trim();
    if (!evaluatedAnswer) {
      return res.status(400).json({ success: false, message: 'Please provide your answer before evaluating.', errorCode: 'EMPTY_TEXT' });
    }
    if (!evaluatedQuestion) {
      return res.status(400).json({ success: false, message: 'Please select an interview question before evaluating.', errorCode: 'EMPTY_QUESTION' });
    }

    const analysis  = await analyzeCommunication(evaluatedQuestion, evaluatedAnswer);
    const wordCount = evaluatedAnswer.split(/\s+/).filter(Boolean).length;

    const saved = await communicationRepository.create(req.user.id, {
      inputText:       evaluatedAnswer,
      question:        evaluatedQuestion,
      wordCount,
      grammarScore:    analysis.grammarScore,
      clarityScore:    analysis.clarityScore,
      vocabularyScore: analysis.vocabularyScore,
      confidenceScore: analysis.confidenceScore,
      relevanceScore:  analysis.relevanceScore,
      overallScore:    analysis.overallScore,
      mistakes:        analysis.mistakes || [],
      improvedAnswer:  analysis.improvedAnswer || '',
    });

    recordActivity(req.user.id, 'communication', { score: analysis.overallScore }).catch(() => {});

    res.json({ success: true, id: saved.id, wordCount, evaluatedQuestion, evaluatedAnswer, ...analysis });
  } catch (err) {
    next(err);
  }
};

export const getCommunicationHistory = async (req, res, next) => {
  try {
    const records  = await communicationRepository.findByUser(req.user.id);
    const attempts = records.map(r => ({
      id:         r.id,
      question:   r.question || '',
      answer:     r.input_text || '',
      date:       new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      text:       (r.input_text || '').slice(0, 40) + '...',
      wordCount:  r.word_count,
      grammar:    r.grammar_score,
      clarity:    r.clarity_score,
      vocabulary: r.vocabulary_score,
      confidence: r.confidence_score,
      overall:    r.overall_score,
      score:      r.overall_score,
    }));
    res.json({ success: true, count: attempts.length, attempts });
  } catch (err) {
    next(err);
  }
};

export default { evaluateCommunication, getCommunicationHistory, getCommunicationQuestions };
