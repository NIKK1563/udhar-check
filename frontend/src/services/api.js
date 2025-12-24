import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  completeOnboarding: (formData) => api.post('/auth/onboarding', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Loans API
export const loansAPI = {
  // Borrower
  createRequest: (data) => api.post('/loans/request', data),
  getMyRequests: (params) => api.get('/loans/my-requests', { params }),
  getMyBorrowings: (params) => api.get('/loans/my-requests', { params }),
  markFulfilled: (id) => api.post(`/loans/${id}/fulfill`),
  cancelRequest: (id) => api.post(`/loans/${id}/cancel`),
  
  // Lender
  getPendingRequests: (params) => api.get('/loans/pending', { params }),
  getMyLending: (params) => api.get('/loans/my-lending', { params }),
  acceptRequest: (id) => api.post(`/loans/${id}/accept`),
  recordRepayment: (id, data) => api.post(`/loans/${id}/repayment`, data),
  
  // Common
  getDetails: (id) => api.get(`/loans/${id}`),
  rateUser: (id, data) => api.post(`/loans/${id}/rate`, data)
};

// Reports API
export const reportsAPI = {
  create: (formData) => api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyReports: (params) => api.get('/reports/my-reports', { params })
};

// Disputes API
export const disputesAPI = {
  create: (formData) => api.post('/disputes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyDisputes: (params) => api.get('/disputes/my-disputes', { params }),
  addNote: (id, formData) => api.post(`/disputes/${id}/note`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  toggleBlockUser: (id, data) => api.put(`/admin/users/${id}/block`, data),
  approveUserVerification: (id, data) => api.put(`/admin/users/${id}/verify`, data),
  rejectUserVerification: (id, data) => api.put(`/admin/users/${id}/reject`, data),
  partialRejectVerification: (id, data) => api.put(`/admin/users/${id}/partial-reject`, data),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}`, data),
  getDisputes: (params) => api.get('/admin/disputes', { params }),
  resolveDispute: (id, data) => api.put(`/admin/disputes/${id}`, data),
  getLoans: (params) => api.get('/admin/loans', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (data) => api.put('/admin/settings', data),
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params })
};

export default api;
