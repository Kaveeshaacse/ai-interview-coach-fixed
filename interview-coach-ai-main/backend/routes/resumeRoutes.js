import express from 'express';
import { uploadResume, analyzeResumeDoc, matchJobDescription, getResumeAnalysis, getAllResumes } from '../controllers/resumeController.js';
import { analyzeATS } from '../controllers/atsController.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadResume as uploadMiddleware } from '../middleware/uploadMiddleware.js';
import { validateResumeUpload, validateResumeId, validateJobDescription } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post('/upload',                   protect, uploadMiddleware.single('resume'), validateResumeUpload, uploadResume);
router.post('/analyze',                  protect, analyzeResumeDoc);
router.post('/analyze/:resumeId',        protect, validateResumeId, analyzeResumeDoc);
router.post('/ats',                      protect, analyzeATS);
router.post('/match-job/:resumeId',      protect, validateResumeId, validateJobDescription, matchJobDescription);
router.get('/analysis/:resumeId',        protect, validateResumeId, getResumeAnalysis);
router.get('/',                          protect, getAllResumes);

export default router;
