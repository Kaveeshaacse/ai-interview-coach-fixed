import { adminSettingsRepository } from '../repositories/adminSettings.repository.js';

function validateEvaluation(v) {
  const passingScore = Number(v.passingScore);
  const attentionThreshold = Number(v.attentionThreshold);
  if (!Number.isFinite(passingScore) || passingScore < 0 || passingScore > 100) {
    throw Object.assign(new Error('passingScore must be a number between 0 and 100'), { statusCode: 400 });
  }
  if (!Number.isFinite(attentionThreshold) || attentionThreshold < 0 || attentionThreshold > 100) {
    throw Object.assign(new Error('attentionThreshold must be a number between 0 and 100'), { statusCode: 400 });
  }
  return { passingScore, attentionThreshold };
}

function validateInterview(v) {
  const defaultDurationMinutes = Number(v.defaultDurationMinutes);
  const questionsPerInterview = Number(v.questionsPerInterview);
  if (!Number.isFinite(defaultDurationMinutes) || defaultDurationMinutes < 1 || defaultDurationMinutes > 180) {
    throw Object.assign(new Error('defaultDurationMinutes must be a number between 1 and 180'), { statusCode: 400 });
  }
  if (!Number.isFinite(questionsPerInterview) || questionsPerInterview < 1 || questionsPerInterview > 50) {
    throw Object.assign(new Error('questionsPerInterview must be a number between 1 and 50'), { statusCode: 400 });
  }
  return { defaultDurationMinutes, questionsPerInterview };
}

export async function getEvaluationSettings() {
  return adminSettingsRepository.get('evaluation');
}

export async function updateEvaluationSettings(body, admin) {
  const value = validateEvaluation(body);
  return adminSettingsRepository.set('evaluation', value, admin.id);
}

export async function getInterviewSettings() {
  return adminSettingsRepository.get('interview');
}

export async function updateInterviewSettings(body, admin) {
  const value = validateInterview(body);
  return adminSettingsRepository.set('interview', value, admin.id);
}

export default { getEvaluationSettings, updateEvaluationSettings, getInterviewSettings, updateInterviewSettings };
