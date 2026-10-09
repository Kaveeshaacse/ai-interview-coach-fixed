import * as resumeService from '../services/resume.service.js';
import { resumeRepository } from '../repositories/resume.repository.js';
import { calculateATS     } from '../services/aiService.js';
import { isLikelyResume   } from '../services/atsAnalyzerEngine.js';

// ─────────────────────────────────────────────────────────────────────────────
// ATS Controller — HTTP only.
// ─────────────────────────────────────────────────────────────────────────────

export const analyzeATS = async (req, res, next) => {
  try {
    const { jobRole = 'Software Engineer', resumeText, resumeId } = req.body;
    let text = resumeText || '';

    if (!text && resumeId) {
      const resume = await resumeRepository.findById(resumeId);
      if (!resume || resume.user_id !== req.user.id) {
        return res.status(404).json({ success: false, message: 'Resume not found', errorCode: 'RESUME_NOT_FOUND' });
      }
      text = resume.extracted_text || '';
    }

    if (!text) {
      // Use latest resume for this user
      const latest = await resumeRepository.findLatestByUser(req.user.id);
      if (latest) {
        const full = await resumeRepository.findById(latest.id);
        text = full?.extracted_text || '';
      }
    }

    if (!text) {
      return res.status(400).json({ success: false, message: 'No resume text available. Please upload a resume first.', errorCode: 'NO_RESUME_TEXT' });
    }

    const resumeCheck = isLikelyResume(text);
    if (!resumeCheck.isResume) {
      return res.status(400).json({
        success: false,
        message: "This doesn't look like a resume. Please upload a resume with sections like Experience, Education, Skills, or Projects.",
        errorCode: 'NOT_A_RESUME',
      });
    }

    const atsResult = await calculateATS(text, jobRole);
    res.json({ success: true, jobRole, ...atsResult });
  } catch (err) {
    next(err);
  }
};

export const getATSScore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await resumeRepository.findById(id);
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found', errorCode: 'RESUME_NOT_FOUND' });
    }
    // Ownership check
    if (resume.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this resume', errorCode: 'FORBIDDEN' });
    }
    const ats = await resumeRepository.getLatestAtsScore(id);
    if (!ats) {
      return res.status(404).json({ success: false, message: 'ATS analysis not found', errorCode: 'ATS_NOT_FOUND' });
    }
    res.json({ success: true, role: resume.target_role, atsScore: ats.overall_score, ...ats });
  } catch (err) {
    next(err);
  }
};

export const getATSHistory = async (req, res, next) => {
  try {
    const records = await resumeService.getAtsHistory(req.user.id);
    const attempts = records.map(r => ({
      id:       r.id,
      date:     new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      role:     r.target_role || 'Software Engineer',
      atsScore: r.ats_score,
      score:    r.ats_score,
      fileName: r.file_name,
    }));
    res.json({ success: true, count: attempts.length, attempts });
  } catch (err) {
    next(err);
  }
};

export default { analyzeATS, getATSScore, getATSHistory };
