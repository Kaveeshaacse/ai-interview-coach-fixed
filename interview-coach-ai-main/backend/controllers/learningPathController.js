import { learningPathRepository } from '../repositories/learning-path.repository.js';
import { aptitudeRepository      } from '../repositories/aptitude.repository.js';
import { codingRepository         } from '../repositories/coding.repository.js';
import { PATH_CATALOG, generatePersonalizedPaths } from '../utils/learningPaths.js';
import { isValidUUID } from '../middleware/validate.middleware.js';

async function gatherPerformanceData(userId) {
  const perf = { codingScore: null, aptitudeScore: null, logicalScore: null, verbalScore: null, communicationScore: null, technicalScore: null, resumeScore: null, atsScore: null, weakAreas: [], primaryLanguage: 'Java' };
  try {
    const [codingAttempts, aptAttempts] = await Promise.all([
      codingRepository.findByUser(userId, 5),
      aptitudeRepository.findByUser(userId, 5),
    ]);
    if (codingAttempts.length) {
      const scores = codingAttempts.map(a => a.score || 0).filter(s => s > 0);
      if (scores.length) perf.codingScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const langs = {};
      codingAttempts.forEach(a => { if (a.language) langs[a.language] = (langs[a.language] || 0) + 1; });
      perf.primaryLanguage = Object.entries(langs).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Java';
    }
    if (aptAttempts.length) {
      const bycat = {};
      aptAttempts.forEach(a => { const c = (a.category || 'quantitative').toLowerCase(); if (!bycat[c]) bycat[c] = []; bycat[c].push(a.score || 0); });
      const avg = arr => arr.filter(s => s > 0).length ? Math.round(arr.filter(s => s > 0).reduce((a, b) => a + b, 0) / arr.filter(s => s > 0).length) : null;
      perf.aptitudeScore = avg(bycat['quantitative'] || []);
      perf.logicalScore  = avg(bycat['logical']      || []);
      perf.verbalScore   = avg(bycat['verbal']        || []);
      aptAttempts.forEach(a => { if (a.weak_areas?.length) perf.weakAreas.push(...a.weak_areas); });
      perf.weakAreas = [...new Set(perf.weakAreas)];
    }
  } catch (_) {}
  return perf;
}

export const getLearningPaths = async (req, res, next) => {
  try {
    const userId   = req.user.id;
    const perfData = await gatherPerformanceData(userId);
    const recommended = generatePersonalizedPaths(perfData);
    const pathKeys    = recommended.map(t => t.pathKey);

    // Single batch query — no N+1
    const existing = await learningPathRepository.findByUser(userId, pathKeys);
    const existingMap = Object.fromEntries(existing.map(p => [p.path_key, p]));

    const resultPaths = [];

    for (const template of recommended) {
      const dbPath = existingMap[template.pathKey];

      if (dbPath) {
        const topics = dbPath.topics || [];
        resultPaths.push({
          _id:            dbPath.id,
          pathKey:        dbPath.path_key,
          title:          dbPath.title,
          description:    dbPath.description,
          icon:           dbPath.icon,
          color:          dbPath.color,
          level:          dbPath.level,
          priority:       template.priority,
          reason:         template.reason,
          progress:       dbPath.progress,
          started:        dbPath.started,
          topics:         topics.map(t => ({ _id: t.id, topicId: t.topic_key, title: t.title, description: t.description, resources: t.resources, practiceQuestions: t.practice_questions, completed: t.completed, completedAt: t.completed_at })),
          totalTopics:    topics.length,
          completedTopics:topics.filter(t => t.completed).length,
          triggerScore:   template.triggerScore,
        });
      } else {
        // Create new path in DB
        let newPath;
        try {
          newPath = await learningPathRepository.create(userId, template, template.topics || []);
        } catch (_) {
          newPath = { id: `local-${template.pathKey}`, path_key: template.pathKey, progress: 0, started: false };
        }
        const topicsWithMeta = (template.topics || []).map(t => ({ _id: t.topicId, topicId: t.topicId, title: t.title, description: t.description, resources: t.resources, practiceQuestions: t.practiceQuestions, completed: false, completedAt: null }));
        resultPaths.push({
          _id:            newPath.id,
          pathKey:        template.pathKey,
          title:          template.title,
          description:    template.description,
          icon:           template.icon,
          color:          template.color,
          level:          template.level,
          priority:       template.priority,
          reason:         template.reason,
          progress:       0,
          started:        false,
          topics:         topicsWithMeta,
          totalTopics:    topicsWithMeta.length,
          completedTopics:0,
          triggerScore:   template.triggerScore,
        });
      }
    }

    res.json({ success: true, count: resultPaths.length, paths: resultPaths });
  } catch (err) {
    next(err);
  }
};

export const getLearningPathById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let { id }   = req.params;
    const cleanKey = id.startsWith('local-') ? id.replace('local-', '') : id;

    let path = null;
    if (isValidUUID(cleanKey)) {
      path = await learningPathRepository.findById(cleanKey);
    }
    if (!path) {
      path = await learningPathRepository.findByPathKey(userId, cleanKey);
    }
    if (!path) {
      const template = PATH_CATALOG[cleanKey];
      if (!template) return res.status(404).json({ success: false, message: 'Learning path not found', errorCode: 'PATH_NOT_FOUND' });
      const topics  = template.topics.map(t => ({ _id: t.topicId, topicId: t.topicId, title: t.title, description: t.description, resources: t.resources, practiceQuestions: t.practiceQuestions, completed: false }));
      return res.json({ success: true, path: { _id: `local-${cleanKey}`, pathKey: cleanKey, title: template.title, description: template.description, icon: template.icon, color: template.color, level: template.level, priority: template.priority, progress: 0, started: false, topics, totalTopics: topics.length, completedTopics: 0 } });
    }

    const topics = (path.topics || []).map(t => ({ _id: t.id, topicId: t.topic_key, title: t.title, description: t.description, resources: t.resources, practiceQuestions: t.practice_questions, completed: t.completed, completedAt: t.completed_at }));
    res.json({ success: true, path: { _id: path.id, pathKey: path.path_key, title: path.title, description: path.description, icon: path.icon, color: path.color, level: path.level, priority: path.priority, reason: path.reason, progress: path.progress, started: path.started, topics, totalTopics: topics.length, completedTopics: topics.filter(t => t.completed).length } });
  } catch (err) {
    next(err);
  }
};

export const updateTopicProgress = async (req, res, next) => {
  try {
    const userId   = req.user.id;
    const pathId   = req.params.id || req.body.pathId;
    const topicRef = req.params.topicId || req.params.topicIndex;
    const { completed } = req.body;

    if (completed === undefined) {
      return res.status(400).json({ success: false, message: 'Field "completed" (boolean) is required', errorCode: 'VALIDATION_ERROR' });
    }

    let path = null;
    const cleanId = pathId?.startsWith('local-') ? pathId.replace('local-', '') : pathId;
    if (cleanId && isValidUUID(cleanId)) {
      path = await learningPathRepository.findById(cleanId);
    } else if (cleanId) {
      path = await learningPathRepository.findByPathKey(userId, cleanId);
    }

    if (!path) {
      return res.status(404).json({ success: false, message: 'Learning path not found', errorCode: 'PATH_NOT_FOUND' });
    }

    let result;
    if (!isNaN(Number(topicRef))) {
      result = await learningPathRepository.updateTopicByIndex(path.id, Number(topicRef), Boolean(completed));
    } else if (isValidUUID(topicRef)) {
      result = await learningPathRepository.updateTopicCompletion(path.id, topicRef, Boolean(completed));
    } else {
      // Find topic by topic_key
      const topic = (path.topics || []).find(t => t.topic_key === topicRef);
      if (!topic) return res.status(404).json({ success: false, message: 'Topic not found', errorCode: 'TOPIC_NOT_FOUND' });
      result = await learningPathRepository.updateTopicCompletion(path.id, topic.id, Boolean(completed));
    }

    res.json({ success: true, progress: result });
  } catch (err) {
    next(err);
  }
};

export const startLearningPath = async (req, res, next) => {
  try {
    const userId   = req.user.id;
    const cleanKey = req.params.id?.startsWith('local-') ? req.params.id.replace('local-', '') : req.params.id;

    let path = isValidUUID(cleanKey)
      ? await learningPathRepository.findById(cleanKey)
      : await learningPathRepository.findByPathKey(userId, cleanKey);

    if (path) {
      await learningPathRepository.markStarted(path.id);
      return res.json({ success: true, message: 'Learning path started', pathId: path.id });
    }
    res.json({ success: true, message: 'Learning path started', pathId: `local-${cleanKey}` });
  } catch (err) {
    next(err);
  }
};

export default { getLearningPaths, getLearningPathById, updateTopicProgress, startLearningPath };
