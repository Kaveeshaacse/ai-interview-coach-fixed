import * as resumeService from '../services/resume.service.js';

// ─────────────────────────────────────────────────────────────────────────────
// Resume Controller — HTTP only. All logic in resume.service.js.
// ─────────────────────────────────────────────────────────────────────────────

export const uploadResume = async (req, res, next) => {
  try {
    const options = {
      targetRole:      req.body?.jobRole || req.body?.targetRole || 'Software Engineer',
      jobDescription:  req.body?.jobDescription || '',
    };
    const result = await resumeService.uploadAndAnalyze(req.user.id, req.file, options);
    res.status(201).json({ success: true, message: 'Resume analyzed successfully', ...result });
  } catch (err) {
    next(err);
  }
};

export const analyzeResumeDoc = async (req, res, next) => {
  try {
    const text      = req.body?.text || req.body?.extractedText || '';
    const role      = req.body?.jobRole || req.body?.targetRole || 'Software Engineer';
    const jd        = req.body?.jobDescription || '';
    if (!text || text.trim().length < 15) {
      return res.status(400).json({ success: false, message: 'No readable text provided for analysis.', errorCode: 'EMPTY_TEXT' });
    }
    // For text-only analysis, run the engine without file upload
    const { fullResumeAnalysis, isLikelyResume } = await import('../services/atsAnalyzerEngine.js');
    const resumeCheck = isLikelyResume(text);
    if (!resumeCheck.isResume) {
      return res.status(400).json({
        success: false,
        message: "This doesn't look like a resume. Please provide text with sections like Experience, Education, Skills, or Projects.",
        errorCode: 'NOT_A_RESUME',
      });
    }
    const analysis = fullResumeAnalysis(text, role, jd);
    res.json({ success: true, ...analysis });
  } catch (err) {
    next(err);
  }
};

export const matchJobDescription = async (req, res, next) => {
  try {
    const { jobDescription, targetRole } = req.body;
    const result = await resumeService.matchJobDescription(
      req.user.id,
      req.params.resumeId,
      jobDescription,
      targetRole
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getResumeAnalysis = async (req, res, next) => {
  try {
    const result = await resumeService.getResumeAnalysis(req.user.id, req.params.resumeId);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getAllResumes = async (req, res, next) => {
  try {
    const resumes = await resumeService.getUserResumes(req.user.id);
    res.json({ success: true, count: resumes.length, resumes });
  } catch (err) {
    next(err);
  }
};

export default { uploadResume, analyzeResumeDoc, matchJobDescription, getResumeAnalysis, getAllResumes };
