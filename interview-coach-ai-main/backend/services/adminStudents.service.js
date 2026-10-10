import { adminStudentsRepository } from '../repositories/adminStudents.repository.js';
import { adminAuditLogRepository } from '../repositories/adminAuditLog.repository.js';
import { adminNotificationsRepository } from '../repositories/adminNotifications.repository.js';

export async function listStudents({ search = '' } = {}) {
  const students = await adminStudentsRepository.listStudents();
  const q = search.trim().toLowerCase();
  if (!q) return students;
  return students.filter((s) =>
    s.name?.toLowerCase().includes(q) ||
    s.email?.toLowerCase().includes(q) ||
    s.college?.toLowerCase().includes(q)
  );
}

export async function getStudentDetail(userId) {
  const student = await adminStudentsRepository.getStudentDetail(userId);
  if (!student) {
    throw Object.assign(new Error('Student not found'), { statusCode: 404 });
  }
  return student;
}

export async function setStudentActive(userId, isActive, admin) {
  await adminStudentsRepository.setActive(userId, isActive);
  adminAuditLogRepository.log({
    adminId: admin.id,
    adminName: admin.name,
    action: isActive ? 'reactivate_student' : 'deactivate_student',
    target: userId,
  }).catch(() => {});
  if (!isActive) {
    adminNotificationsRepository.create({
      title: 'Student deactivated',
      message: `${admin.name} deactivated a student account`,
      type: 'warning',
    }).catch(() => {});
  }
}

function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export async function exportStudentsCsv() {
  const students = await adminStudentsRepository.listStudents();
  const header = ['Name', 'Email', 'College', 'Interviews', 'Average Score', 'Last Active', 'Status', 'Joined'];
  const lines = [header.join(',')];
  for (const s of students) {
    lines.push([
      s.name, s.email, s.college, s.interviews,
      s.averageScore ?? '', s.lastActiveAt || '', s.isActive ? 'Active' : 'Deactivated', s.joinedAt || '',
    ].map(csvEscape).join(','));
  }
  return lines.join('\n');
}

export default { listStudents, getStudentDetail, setStudentActive, exportStudentsCsv };
