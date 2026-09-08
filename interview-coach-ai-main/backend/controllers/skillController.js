import { skillRepository  } from '../repositories/skill.repository.js';
import { userRepository   } from '../repositories/user.repository.js';
import { getDashboardData } from '../services/dashboard.service.js';
import { generateSkillRecommendations } from '../services/aiService.js';

export const getRecommendations = async (req, res, next) => {
  try {
    // Get real metrics from DB — safe fallback if dashboard fails
    let metrics = {};
    try {
      const dash = await getDashboardData(req.user.id);
      metrics = {
        codingScore:        dash.codingScore,
        aptitudeScore:      dash.aptitudeScore,
        interviewScore:     dash.interviewScore,
        communicationScore: dash.communicationScore,
        resumeScore:        dash.resumeScore,
        atsScore:           dash.atsScore,
        overallScore:       dash.overallScore,
      };
    } catch (_) {
      // metrics stays empty — AI will use defaults
    }

    // Check for fresh assessment (within 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let assessment  = await skillRepository.findLatestByUser(req.user.id, yesterday);

    const data = await generateSkillRecommendations(metrics);

    if (assessment) {
      await skillRepository.updateAssessment(assessment.id, { ...data, scoreSnapshot: metrics });
    } else {
      assessment = await skillRepository.createAssessment(req.user.id, { ...data, scoreSnapshot: metrics });
    }

    res.json({ success: true, metrics, ...data });
  } catch (err) {
    next(err);
  }
};

export const getCurrentSkills = async (req, res, next) => {
  try {
    const skills = await userRepository.getUserSkills(req.user.id);
    const defaultSkills = [
      { name: 'JavaScript',      level: 75, category: 'Language' },
      { name: 'Python',          level: 65, category: 'Language' },
      { name: 'Java',            level: 60, category: 'Language' },
      { name: 'React',           level: 70, category: 'Framework' },
      { name: 'Node.js',         level: 65, category: 'Backend' },
      { name: 'SQL',             level: 55, category: 'Database' },
      { name: 'Data Structures', level: 68, category: 'CS Fundamentals' },
      { name: 'Git',             level: 80, category: 'Tool' },
    ];
    res.json({ success: true, currentSkills: skills.length ? skills : defaultSkills });
  } catch (err) {
    next(err);
  }
};

export const updateCurrentSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: 'Skills must be an array', errorCode: 'VALIDATION_ERROR' });
    }
    await userRepository.replaceUserSkills(req.user.id, skills);
    res.json({ success: true, message: 'Skills updated successfully', currentSkills: skills });
  } catch (err) {
    next(err);
  }
};

export const getSkillHistory = async (req, res, next) => {
  try {
    const records = await skillRepository.findByUser(req.user.id);
    res.json({
      success: true,
      count:   records.length,
      assessments: records.map(a => ({
        id:            a.id,
        date:          new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        scoreSnapshot: a.score_snapshot,
        skillGapCount: Array.isArray(a.skill_gaps) ? a.skill_gaps.length : 0,
      })),
    });
  } catch (err) {
    next(err);
  }
};

export default { getRecommendations, getCurrentSkills, updateCurrentSkills, getSkillHistory };
