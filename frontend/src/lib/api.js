import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const api = {
  // Auth
  login: (email, password) => axios.post(`${API}/auth/login`, { email, password }).then(r => r.data),
  logout: () => axios.post(`${API}/auth/logout`).then(r => r.data),
  getMe: () => axios.get(`${API}/auth/me`).then(r => r.data),

  // Dashboard
  getDashboard: () => axios.get(`${API}/dashboard`).then(r => r.data),

  // Modules
  getModules: (params) => axios.get(`${API}/modules`, { params }).then(r => r.data),
  getModule: (id) => axios.get(`${API}/modules/${id}`).then(r => r.data),
  ingestTranscript: (moduleId, file) => {
    const form = new FormData();
    form.append("file", file);
    return axios.post(`${API}/modules/${moduleId}/ingest`, form, {
      headers: { "Content-Type": "multipart/form-data" }, timeout: 120000,
    }).then(r => r.data);
  },
  getModuleContent: (moduleId) => axios.get(`${API}/modules/${moduleId}/content`).then(r => r.data),
  uploadModuleContent: (moduleId, file) => {
    const form = new FormData();
    form.append("file", file);
    return axios.post(`${API}/modules/${moduleId}/content`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(r => r.data);
  },

  // Assessment
  deliverAssessment: (moduleId, file) => {
    const form = new FormData();
    form.append("file", file);
    return axios.post(`${API}/modules/${moduleId}/assessment`, form, {
      headers: { "Content-Type": "multipart/form-data" }, timeout: 120000,
    }).then(r => r.data);
  },
  getAssessment: (moduleId) => axios.get(`${API}/modules/${moduleId}/assessment`).then(r => r.data),

  // Role Play
  reviewRolePlay: (moduleId, file) => {
    const form = new FormData();
    form.append("file", file);
    return axios.post(`${API}/modules/${moduleId}/roleplay`, form, {
      headers: { "Content-Type": "multipart/form-data" }, timeout: 120000,
    }).then(r => r.data);
  },
  getRolePlayReview: (moduleId) => axios.get(`${API}/modules/${moduleId}/roleplay`).then(r => r.data),

  // Instructors
  getInstructors: (params) => axios.get(`${API}/instructors`, { params }).then(r => r.data),
  // Students
  getStudents: (params) => axios.get(`${API}/students`, { params }).then(r => r.data),
  getStudentDetail: (studentId) => axios.get(`${API}/students/${studentId}`).then(r => r.data),
  // Calendar
  getCalendar: (params) => axios.get(`${API}/calendar`, { params }).then(r => r.data),
  getFilters: () => axios.get(`${API}/filters`).then(r => r.data),

  // Admin CRUD
  adminCreateModule: (data) => axios.post(`${API}/admin/modules`, data).then(r => r.data),
  adminUpdateModule: (id, data) => axios.put(`${API}/admin/modules/${id}`, data).then(r => r.data),
  adminDeleteModule: (id) => axios.delete(`${API}/admin/modules/${id}`).then(r => r.data),
  adminModuleVersions: (id) => axios.get(`${API}/admin/modules/${id}/versions`).then(r => r.data),
  adminRestoreModule: (id, idx) => axios.post(`${API}/admin/modules/${id}/restore/${idx}`).then(r => r.data),
  adminResetModule: (id) => axios.post(`${API}/admin/modules/${id}/reset`).then(r => r.data),
  adminResetModulesBulk: (ids) => axios.post(`${API}/admin/modules/reset-bulk`, { module_ids: ids }).then(r => r.data),

  // Profile
  getProfile: () => axios.get(`${API}/profile`).then(r => r.data),
  updateProfile: (data) => axios.put(`${API}/profile`, data).then(r => r.data),
  changePassword: (current_password, new_password) => axios.post(`${API}/profile/change-password`, { current_password, new_password }).then(r => r.data),

  // Seed instructors
  seedInstructors: () => axios.post(`${API}/admin/seed-instructors`).then(r => r.data),

  adminCreateStudent: (data) => axios.post(`${API}/admin/students`, data).then(r => r.data),
  adminUpdateStudent: (id, data) => axios.put(`${API}/admin/students/${id}`, data).then(r => r.data),
  adminDeleteStudent: (id) => axios.delete(`${API}/admin/students/${id}`).then(r => r.data),

  adminCreateInstructor: (data) => axios.post(`${API}/admin/instructors`, data).then(r => r.data),
  adminUpdateInstructor: (name, data) => axios.put(`${API}/admin/instructors/${encodeURIComponent(name)}`, data).then(r => r.data),
  adminDeleteInstructor: (name) => axios.delete(`${API}/admin/instructors/${encodeURIComponent(name)}`).then(r => r.data),

  adminGetUsers: () => axios.get(`${API}/admin/users`).then(r => r.data),
  adminCreateUser: (data) => axios.post(`${API}/admin/users`, data).then(r => r.data),
  adminResetPassword: (email, newPassword) => axios.post(`${API}/admin/users/reset-password`, { email, new_password: newPassword }).then(r => r.data),
};
