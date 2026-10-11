import { adminQuestionsRepository } from '../repositories/adminQuestions.repository.js';
import { adminAuditLogRepository } from '../repositories/adminAuditLog.repository.js';
import { adminNotificationsRepository } from '../repositories/adminNotifications.repository.js';
import { studentNotificationsRepository } from '../repositories/studentNotifications.repository.js';
import { adminCodingNumericId } from './questionBankBridge.service.js';

const VALID_TYPES = ['aptitude', 'technical', 'coding', 'behavioural', 'communication'];
const TYPE_LABELS = { aptitude: 'Aptitude', technical: 'Technical', coding: 'Coding', behavioural: 'Behavioural', communication: 'Communication' };

// Where a student should land when they click a "new question added"
// notification. Coding problems have a stable per-row id (adminCodingNumericId)
// the Coding Practice page can select directly via a query param; Aptitude,
// Technical, Behavioural and Communication are test-flow pages (pick a
// category/role/prompt, then the backend serves questions for that session)
// rather than browsable single items, so those just open the right module
// instead of one exact question.
function notificationLinkFor(created) {
  if (created.type === 'coding') {
    return `/coding?problemId=${adminCodingNumericId(created)}`;
  }
  if (created.type === 'aptitude') return '/aptitude';
  if (created.type === 'technical') return '/technical';
  if (created.type === 'behavioural') return '/mock-interview';
  if (created.type === 'communication') return '/communication';
  return null;
}

function validateNewQuestion(q) {
  if (!q.type || !VALID_TYPES.includes(q.type)) {
    throw Object.assign(new Error(`type must be one of: ${VALID_TYPES.join(', ')}`), { statusCode: 400 });
  }
  if (!q.questionText || !q.questionText.trim()) {
    throw Object.assign(new Error('questionText is required'), { statusCode: 400 });
  }
  if (q.type === 'aptitude') {
    if (!Array.isArray(q.payload?.options) || q.payload.options.length < 2) {
      throw Object.assign(new Error('Aptitude questions need at least 2 options in payload.options'), { statusCode: 400 });
    }
    if (!q.payload?.correctAnswer) {
      throw Object.assign(new Error('Aptitude questions need payload.correctAnswer'), { statusCode: 400 });
    }
    if (!q.payload.options.includes(q.payload.correctAnswer)) {
      throw Object.assign(new Error('payload.correctAnswer must match one of payload.options exactly'), { statusCode: 400 });
    }
  }
  if (q.type === 'coding') {
    if (!Array.isArray(q.payload?.testCases) || q.payload.testCases.length < 1) {
      throw Object.assign(new Error('Coding questions need at least 1 test case in payload.testCases'), { statusCode: 400 });
    }
    for (const tc of q.payload.testCases) {
      if (!tc || !tc.input || !tc.expectedOutput) {
        throw Object.assign(new Error('Every test case needs both input and expectedOutput'), { statusCode: 400 });
      }
    }
  }
}

export async function listQuestions(filters) {
  return adminQuestionsRepository.list(filters);
}

export async function createQuestion(q, admin) {
  validateNewQuestion(q);
  const created = await adminQuestionsRepository.create(q, admin.id);
  adminAuditLogRepository.log({
    adminId: admin.id, adminName: admin.name, action: 'add_question', target: created.id,
    details: { type: created.type, title: created.title },
  }).catch(() => {});
  adminNotificationsRepository.create({
    title: 'New question added',
    message: `${admin.name} added a ${created.type} question${created.category ? ` (${created.category})` : ''}`,
    type: 'info',
  }).catch(() => {});
  if (created.is_active) {
    studentNotificationsRepository.create({
      title: 'New question added',
      message: `A new ${TYPE_LABELS[created.type] || created.type} question${created.category ? ` (${created.category})` : ''} was just added — give it a try!`,
      type: 'info',
      link: notificationLinkFor(created),
    }).catch(() => {});
  }
  return created;
}

export async function updateQuestion(id, fields, admin) {
  const existing = await adminQuestionsRepository.findById(id);
  if (!existing) throw Object.assign(new Error('Question not found'), { statusCode: 404 });
  const updated = await adminQuestionsRepository.update(id, fields);
  adminAuditLogRepository.log({
    adminId: admin.id, adminName: admin.name, action: 'edit_question', target: id,
  }).catch(() => {});
  return updated;
}

export async function setQuestionActive(id, isActive, admin) {
  const existing = await adminQuestionsRepository.findById(id);
  if (!existing) throw Object.assign(new Error('Question not found'), { statusCode: 404 });
  await adminQuestionsRepository.setActive(id, isActive);
  adminAuditLogRepository.log({
    adminId: admin.id, adminName: admin.name,
    action: isActive ? 'activate_question' : 'deactivate_question', target: id,
  }).catch(() => {});
}

export default { listQuestions, createQuestion, updateQuestion, setQuestionActive };
