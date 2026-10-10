import * as adminStudentsService from '../services/adminStudents.service.js';

export const listStudents = async (req, res, next) => {
  try {
    const students = await adminStudentsService.listStudents({ search: req.query.search || '' });
    res.json({ success: true, students });
  } catch (err) {
    next(err);
  }
};

export const getStudentDetail = async (req, res, next) => {
  try {
    const student = await adminStudentsService.getStudentDetail(req.params.id);
    res.json({ success: true, student });
  } catch (err) {
    next(err);
  }
};

export const deactivateStudent = async (req, res, next) => {
  try {
    await adminStudentsService.setStudentActive(req.params.id, false, req.admin);
    res.json({ success: true, message: 'Student account deactivated' });
  } catch (err) {
    next(err);
  }
};

export const reactivateStudent = async (req, res, next) => {
  try {
    await adminStudentsService.setStudentActive(req.params.id, true, req.admin);
    res.json({ success: true, message: 'Student account reactivated' });
  } catch (err) {
    next(err);
  }
};

export const exportStudentsCsv = async (req, res, next) => {
  try {
    const csv = await adminStudentsService.exportStudentsCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

export default { listStudents, getStudentDetail, deactivateStudent, reactivateStudent, exportStudentsCsv };
