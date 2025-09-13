import api from '../utils/api';

// Admin API Services
export const adminService = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getStats: (timeRange = '7d') => api.get(`/admin/stats?timeRange=${timeRange}`),
  getActivities: (limit = 20) => api.get(`/admin/activities?limit=${limit}`),
  getSystemHealth: () => api.get('/admin/system-health'),
  getRevenue: (timeRange = '7d') => api.get(`/admin/revenue?timeRange=${timeRange}`),
  
  // Users
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  activateUser: (userId) => api.post(`/admin/users/${userId}/activate`),
  deactivateUser: (userId) => api.post(`/admin/users/${userId}/deactivate`),
  
  // Practitioners
  getPractitioners: (params = {}) => api.get('/admin/practitioners', { params }),
  getPendingPractitioners: () => api.get('/admin/practitioners/pending'),
  getPractitioner: (id) => api.get(`/admin/practitioners/${id}`),
  verifyPractitioner: (id, data) => api.post(`/admin/practitioners/${id}/verify`, data),
  updatePractitioner: (id, data) => api.put(`/admin/practitioners/${id}`, data),
  deletePractitioner: (id) => api.delete(`/admin/practitioners/${id}`),
  
  // Patients
  getPatients: (params = {}) => api.get('/admin/patients', { params }),
  updatePatient: (id, data) => api.put(`/admin/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/admin/patients/${id}`),
  
  // Appointments
  getAppointments: (params = {}) => api.get('/admin/appointments', { params }),
  getAppointment: (id) => api.get(`/admin/appointments/${id}`),
  updateAppointmentStatus: (id, data) => api.put(`/admin/appointments/${id}/status`, data),
  
  // Notifications
  getNotifications: (params = {}) => api.get('/admin/notifications', { params }),
  markNotificationRead: (id) => api.put(`/admin/notifications/${id}/read`),
  getNotificationSettings: () => api.get('/admin/notification-settings'),
  updateNotificationSettings: (data) => api.put('/admin/notification-settings', data),
  broadcastNotification: (data) => api.post('/admin/notifications/broadcast', data),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),
  
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  
  // Analytics & Reports
  getAnalytics: (params = {}) => api.get('/admin/analytics', { params }),
  getReports: (params = {}) => api.get('/admin/reports', { params }),
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
  
  // Export
  exportData: (type, params = {}) => api.get(`/admin/export/${type}`, { params })
};

// Patient API Services
export const patientService = {
  // Dashboard
  getDashboard: (range = '7d') => api.get(`/patient/dashboard?range=${range}`),
  
  // Profile
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (data) => api.put('/patient/profile', data),
  
  // Appointments
  getAppointments: (params = {}) => api.get('/patient/appointments', { params }),
  bookAppointment: (data) => api.post('/patient/appointments', data),
  cancelAppointment: (id) => api.put(`/patient/appointments/${id}/cancel`),
  rescheduleAppointment: (id, data) => api.put(`/patient/appointments/${id}/reschedule`, data),
  
  // Practitioners
  searchPractitioners: (params = {}) => api.get('/patient/practitioners', { params }),
  getPractitioner: (id) => api.get(`/patient/practitioners/${id}`),
  
  // Therapy Plans
  getTherapyPlans: (params = {}) => api.get('/patient/therapy-plans', { params }),
  getTherapyPlan: (id) => api.get(`/patient/therapy-plans/${id}`),
  getTherapyPlanProgress: (id) => api.get(`/patient/therapy-plans/${id}/progress`),
  
  // Medical Records
  getMedicalRecords: (params = {}) => api.get('/patient/medical-records', { params }),
  downloadMedicalRecord: (id) => api.get(`/patient/medical-records/${id}/download`, { responseType: 'blob' }),
  getVitals: () => api.get('/patient/vitals'),
  addVitals: (data) => api.post('/patient/vitals', data),
  
  // Health Tracking
  getHealthTracking: (params = {}) => api.get('/patient/health-tracking', { params }),
  addHealthData: (data) => api.post('/patient/health-tracking', data),
  getHealthGoals: () => api.get('/patient/health-goals'),
  updateHealthGoals: (data) => api.put('/patient/health-goals', data),
  
  // Documents
  getDocuments: (params = {}) => api.get('/patient/documents', { params }),
  uploadDocument: (data) => api.post('/patient/documents', data),
  downloadDocument: (id) => api.get(`/patient/documents/${id}/download`, { responseType: 'blob' }),
  getDocumentFolders: () => api.get('/patient/document-folders'),
  
  // Communication
  getConversations: (params = {}) => api.get('/patient/conversations', { params }),
  getMessages: (conversationId) => api.get(`/patient/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, data) => api.post(`/patient/conversations/${conversationId}/messages`, data),
  
  // Payments & Billing
  getPayments: (params = {}) => api.get('/patient/payments', { params }),
  getInvoices: (params = {}) => api.get('/patient/invoices', { params }),
  downloadInvoice: (id) => api.get(`/patient/invoices/${id}/download`, { responseType: 'blob' }),
  getPaymentMethods: () => api.get('/patient/payment-methods'),
  addPaymentMethod: (data) => api.post('/patient/payment-methods', data),
  getPaymentStats: () => api.get('/patient/payment-stats'),
  
  // Reviews & Feedback
  getReviews: (params = {}) => api.get('/patient/reviews', { params }),
  addReview: (data) => api.post('/patient/reviews', data),
  getReviewStats: () => api.get('/patient/review-stats'),
  
  // Notifications
  getNotifications: (params = {}) => api.get('/patient/notifications', { params }),
  markNotificationRead: (id) => api.put(`/patient/notifications/${id}/read`),
  getNotificationSettings: () => api.get('/patient/notification-settings'),
  updateNotificationSettings: (data) => api.put('/patient/notification-settings', data)
};

// Practitioner API Services
export const practitionerService = {
  // Dashboard
  getDashboard: (range = '7d') => api.get(`/practitioner/dashboard?range=${range}`),
  
  // Profile
  getProfile: () => api.get('/practitioner/profile'),
  updateProfile: (data) => api.put('/practitioner/profile', data),
  
  // Appointments
  getAppointments: (params = {}) => api.get('/practitioner/appointments', { params }),
  updateAppointment: (id, data) => api.put(`/practitioner/appointments/${id}`, data),
  confirmAppointment: (id) => api.put(`/practitioner/appointments/${id}/confirm`),
  completeAppointment: (id, data) => api.put(`/practitioner/appointments/${id}/complete`, data),
  
  // Schedule & Availability
  getAvailability: () => api.get('/practitioner/availability'),
  updateAvailability: (data) => api.put('/practitioner/availability', data),
  getSchedule: (params = {}) => api.get('/practitioner/schedule', { params }),
  
  // Patients
  getPatients: (params = {}) => api.get('/practitioner/patients', { params }),
  getPatient: (id) => api.get(`/practitioner/patients/${id}`),
  
  // Therapy Plans
  getTherapyPlans: (params = {}) => api.get('/practitioner/therapy-plans', { params }),
  createTherapyPlan: (data) => api.post('/practitioner/therapy-plans', data),
  updateTherapyPlan: (id, data) => api.put(`/practitioner/therapy-plans/${id}`, data),
  
  // Medical Records
  getMedicalRecords: (patientId, params = {}) => api.get(`/practitioner/patients/${patientId}/medical-records`, { params }),
  addMedicalRecord: (patientId, data) => api.post(`/practitioner/patients/${patientId}/medical-records`, data),
  
  // Communication
  getConversations: (params = {}) => api.get('/practitioner/conversations', { params }),
  getMessages: (conversationId) => api.get(`/practitioner/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, data) => api.post(`/practitioner/conversations/${conversationId}/messages`, data),
  
  // Revenue & Earnings
  getRevenue: (params = {}) => api.get('/practitioner/revenue', { params }),
  getEarnings: (params = {}) => api.get('/practitioner/earnings', { params }),
  
  // Reviews & Feedback
  getReviews: (params = {}) => api.get('/practitioner/reviews', { params }),
  respondToReview: (id, data) => api.post(`/practitioner/reviews/${id}/respond`, data),
  
  // Analytics & Reports
  getAnalytics: (params = {}) => api.get('/practitioner/analytics', { params }),
  getReports: (params = {}) => api.get('/practitioner/reports', { params }),
  
  // Notifications
  getNotifications: (params = {}) => api.get('/practitioner/notifications', { params }),
  markNotificationRead: (id) => api.put(`/practitioner/notifications/${id}/read`),
  getNotificationSettings: () => api.get('/practitioner/notification-settings'),
  updateNotificationSettings: (data) => api.put('/practitioner/notification-settings', data)
};

// Auth API Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh-token'),
  demoLogin: (role) => api.post(`/auth/demo-login/${role}`)
};

// Notification API Services
export const notificationService = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data)
};

// Upload API Services
export const uploadService = {
  uploadFile: (file, type = 'document') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadAvatar: (file) => uploadService.uploadFile(file, 'avatar'),
  uploadDocument: (file) => uploadService.uploadFile(file, 'document'),
  uploadMedicalRecord: (file) => uploadService.uploadFile(file, 'medical')
};

export default {
  admin: adminService,
  patient: patientService,
  practitioner: practitionerService,
  auth: authService,
  notification: notificationService,
  upload: uploadService
};
