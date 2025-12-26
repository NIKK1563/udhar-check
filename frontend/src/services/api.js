import axios from 'axios';
import { isDemoMode, demoResponses } from './demoData';

const API_URL = process.env.REACT_APP_API_URL || 'https://jls5gvbf-5000.euw.devtunnels.ms/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Demo mode wrapper - returns demo data instead of making real API calls
const wrapWithDemo = (realCall, demoCall) => {
  return async (...args) => {
    if (isDemoMode()) {
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
      return typeof demoCall === 'function' ? demoCall(...args) : demoCall;
    }
    return realCall(...args);
  };
};

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
  register: async (data) => {
    try {
      return await api.post('/auth/register', data);
    } catch (error) {
      // If backend is not available, use demo registration
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log('Backend not available, using demo registration');
        await new Promise(resolve => setTimeout(resolve, 500));
        return demoResponses.register(data);
      }
      throw error;
    }
  },
  login: async (data) => {
    try {
      return await api.post('/auth/login', data);
    } catch (error) {
      // If backend is not available, show helpful message
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        const networkError = new Error('Backend is offline. Please use Demo Login buttons below to explore the platform.');
        networkError.response = { 
          data: { 
            message: 'Backend is offline. Please use Demo Login buttons below to explore the platform.' 
          } 
        };
        throw networkError;
      }
      throw error;
    }
  },
  getProfile: wrapWithDemo(
    () => api.get('/auth/profile'),
    demoResponses.getProfile
  ),
  updateProfile: wrapWithDemo(
    (data) => api.put('/auth/profile', data),
    () => demoResponses.success('Profile updated successfully')
  ),
  changePassword: wrapWithDemo(
    (data) => api.post('/auth/change-password', data),
    () => demoResponses.success('Password changed successfully')
  ),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  completeOnboarding: wrapWithDemo(
    (formData) => api.post('/auth/onboarding', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    () => demoResponses.success('Onboarding completed')
  ),
  uploadProfilePicture: wrapWithDemo(
    (formData) => api.post('/auth/profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    () => demoResponses.success('Profile picture uploaded')
  ),
  sendEmailVerification: wrapWithDemo(
    () => api.post('/auth/send-email-verification'),
    () => demoResponses.success('Verification email sent')
  ),
  verifyEmail: wrapWithDemo(
    (data) => api.post('/auth/verify-email', data),
    () => demoResponses.success('Email verified')
  ),
  sendPhoneVerification: wrapWithDemo(
    () => api.post('/auth/send-phone-verification'),
    () => demoResponses.success('OTP sent')
  ),
  verifyPhone: wrapWithDemo(
    (data) => api.post('/auth/verify-phone', data),
    () => demoResponses.success('Phone verified')
  )
};

// Loans API
export const loansAPI = {
  // Borrower
  createRequest: wrapWithDemo(
    (data) => api.post('/loans/request', data),
    (data) => demoResponses.createRequest(data)
  ),
  getMyRequests: wrapWithDemo(
    (params) => api.get('/loans/my-requests', { params }),
    () => demoResponses.getMyBorrowings()
  ),
  getMyBorrowings: wrapWithDemo(
    (params) => api.get('/loans/my-requests', { params }),
    () => demoResponses.getMyBorrowings()
  ),
  markFulfilled: wrapWithDemo(
    (id) => api.post(`/loans/${id}/fulfill`),
    () => demoResponses.success('Marked as fulfilled')
  ),
  cancelRequest: wrapWithDemo(
    (id) => api.post(`/loans/${id}/cancel`),
    () => demoResponses.success('Request cancelled')
  ),
  
  // Lender
  getPendingRequests: wrapWithDemo(
    (params) => api.get('/loans/pending', { params }),
    () => demoResponses.getPendingRequests()
  ),
  getMyLending: wrapWithDemo(
    (params) => api.get('/loans/my-lending', { params }),
    () => demoResponses.getMyLending()
  ),
  acceptRequest: wrapWithDemo(
    (id) => api.post(`/loans/${id}/accept`),
    () => demoResponses.success('Request accepted')
  ),
  recordRepayment: wrapWithDemo(
    (id, data) => api.post(`/loans/${id}/repayment`, data),
    () => demoResponses.success('Repayment recorded')
  ),
  
  // Common
  getDetails: wrapWithDemo(
    (id) => api.get(`/loans/${id}`),
    (id) => demoResponses.getLoanDetails(id)
  ),
  rateUser: wrapWithDemo(
    (id, data) => api.post(`/loans/${id}/rate`, data),
    () => demoResponses.success('Rating submitted')
  )
};

// Reports API
export const reportsAPI = {
  create: wrapWithDemo(
    (data) => api.post('/reports', data),
    () => demoResponses.success('Report submitted successfully')
  ),
  getMyReports: wrapWithDemo(
    (params) => api.get('/reports/my-reports', { params }),
    () => demoResponses.getMyReports()
  ),
  getAll: wrapWithDemo(
    (params) => api.get('/admin/reports', { params }),
    () => demoResponses.getReports()
  ),
  resolve: wrapWithDemo(
    (id, data) => api.put(`/admin/reports/${id}`, data),
    () => demoResponses.success('Report resolved')
  )
};

// Disputes API
export const disputesAPI = {
  create: wrapWithDemo(
    (formData) => api.post('/disputes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    () => demoResponses.success('Dispute created')
  ),
  getMyDisputes: wrapWithDemo(
    (params) => api.get('/disputes/my-disputes', { params }),
    () => demoResponses.getMyDisputes()
  ),
  addNote: wrapWithDemo(
    (id, formData) => api.post(`/disputes/${id}/note`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    () => demoResponses.success('Note added')
  ),
  getAll: wrapWithDemo(
    (params) => api.get('/admin/disputes', { params }),
    () => demoResponses.getDisputes()
  ),
  resolve: wrapWithDemo(
    (id, data) => api.put(`/admin/disputes/${id}`, data),
    () => demoResponses.success('Dispute resolved')
  )
};

// Notifications API
export const notificationsAPI = {
  getAll: wrapWithDemo(
    (params) => api.get('/notifications', { params }),
    () => demoResponses.getNotifications()
  ),
  getUnreadCount: wrapWithDemo(
    () => api.get('/notifications/unread-count'),
    () => demoResponses.getUnreadCount()
  ),
  markAsRead: wrapWithDemo(
    (id) => api.put(`/notifications/${id}/read`),
    () => demoResponses.success('Marked as read')
  ),
  markAllAsRead: wrapWithDemo(
    () => api.put('/notifications/read-all'),
    () => demoResponses.success('All marked as read')
  ),
  delete: wrapWithDemo(
    (id) => api.delete(`/notifications/${id}`),
    () => demoResponses.success('Notification deleted')
  )
};

// Admin API
export const adminAPI = {
  getDashboard: wrapWithDemo(
    () => api.get('/admin/dashboard'),
    () => demoResponses.getDashboardStats()
  ),
  getDashboardStats: wrapWithDemo(
    () => api.get('/admin/dashboard'),
    () => demoResponses.getDashboardStats()
  ),
  getUsers: wrapWithDemo(
    (params) => api.get('/admin/users', { params }),
    (params) => demoResponses.getUsers(params)
  ),
  getUserDetails: wrapWithDemo(
    (id) => api.get(`/admin/users/${id}`),
    (id) => demoResponses.getUserDetails(id)
  ),
  toggleBlockUser: wrapWithDemo(
    (id, data) => api.put(`/admin/users/${id}/block`, data),
    () => demoResponses.success('User status updated')
  ),
  banUser: wrapWithDemo(
    (id, data) => api.put(`/admin/users/${id}/block`, { block: data.banned, reason: data.reason }),
    () => demoResponses.success('User banned/unbanned')
  ),
  deleteUser: wrapWithDemo(
    (id) => api.delete(`/admin/users/${id}`),
    () => demoResponses.success('User deleted')
  ),
  approveUserVerification: wrapWithDemo(
    (id, data) => api.put(`/admin/users/${id}/verify`, data),
    () => demoResponses.success('Verification approved')
  ),
  rejectUserVerification: wrapWithDemo(
    (id, data) => api.put(`/admin/users/${id}/reject`, data),
    () => demoResponses.success('Verification rejected')
  ),
  partialRejectVerification: wrapWithDemo(
    (id, data) => api.put(`/admin/users/${id}/partial-reject`, data),
    () => demoResponses.success('Partial rejection applied')
  ),
  getReports: wrapWithDemo(
    (params) => api.get('/admin/reports', { params }),
    () => demoResponses.getReports()
  ),
  resolveReport: wrapWithDemo(
    (id, data) => api.put(`/admin/reports/${id}`, data),
    () => demoResponses.success('Report resolved')
  ),
  getDisputes: wrapWithDemo(
    (params) => api.get('/admin/disputes', { params }),
    () => demoResponses.getDisputes()
  ),
  resolveDispute: wrapWithDemo(
    (id, data) => api.put(`/admin/disputes/${id}`, data),
    () => demoResponses.success('Dispute resolved')
  ),
  getLoans: wrapWithDemo(
    (params) => api.get('/admin/loans', { params }),
    () => demoResponses.getLoans()
  ),
  getSettings: wrapWithDemo(
    () => api.get('/admin/settings'),
    () => demoResponses.getSettings()
  ),
  updateSetting: wrapWithDemo(
    (data) => api.put('/admin/settings', data),
    () => demoResponses.success('Setting updated')
  ),
  updateSettings: wrapWithDemo(
    (settings) => {
      const promises = Object.entries(settings).map(([key, value]) => 
        api.put('/admin/settings', { key, value: String(value) })
      );
      return Promise.all(promises);
    },
    () => demoResponses.success('Settings updated')
  ),
  getActivityLogs: wrapWithDemo(
    (params) => api.get('/admin/activity-logs', { params }),
    () => demoResponses.getActivityLogs()
  ),
  getPendingVerificationsCount: wrapWithDemo(
    () => api.get('/admin/verifications/pending-count'),
    () => demoResponses.getPendingVerificationsCount()
  ),
  getPendingReportsCount: wrapWithDemo(
    () => api.get('/admin/reports/pending-count'),
    () => demoResponses.getPendingReportsCount()
  ),
  getPendingDisputesCount: wrapWithDemo(
    () => api.get('/admin/disputes/pending-count'),
    () => demoResponses.getPendingDisputesCount()
  )
};

export default api;
