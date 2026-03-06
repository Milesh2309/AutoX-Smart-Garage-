import { apiGet, apiDelete, apiPatch, apiPost, apiPut } from './apiClient';

/* ─── Auth ─── */
export const authApi = {
  register: (payload) => apiPost('/auth/register', payload, { auth: false }),
  login: (payload) => apiPost('/auth/login', payload, { auth: false }),
  sendLoginOtp: (payload) => apiPost('/auth/login/send-otp', payload, { auth: false }),
  verifyLoginOtp: (payload) => apiPost('/auth/login/verify-otp', payload, { auth: false }),
  forgotPassword: (payload) => apiPost('/auth/forgot-password', payload, { auth: false }),
  me: () => apiGet('/auth/me'),
  updateProfile: (payload) => apiPut('/auth/me', payload),
};

/* ─── Bookings ─── */
export const bookingApi = {
  listAll: () => apiGet('/api/bookings', { auth: false }),
  listMine: () => apiGet('/api/bookings/me'),
  createPublic: (payload) => apiPost('/api/bookings', payload, { auth: false }),
  cancel: (id) => apiPut(`/api/bookings/${id}/cancel`),
  reschedule: (id, payload) => apiPost(`/api/bookings/${id}/reschedule`, payload),
  getStats: () => apiGet('/bookings/stats', { auth: false }),
  updateStatus: (id, payload) => apiPut(`/bookings/${id}/status`, payload, { auth: false }),
  delete: (id) => apiDelete(`/bookings/${id}`),
};

/* ─── Billing ─── */
export const billingApi = {
  create: (payload) => apiPost('/api/billing/create', payload),
  listByUser: (userId) => apiGet(`/api/billing/user/${userId}`),
  listMine: () => apiGet('/api/billing/me'),
  listAll: (queryString = '') => apiGet(`/api/billing/all${queryString ? `?${queryString}` : ''}`),
  refund: (payload) => apiPost('/api/billing/refund', payload),
  verify: (invoiceNumber) => apiPatch(`/api/billing/verify/${invoiceNumber}`),
};

/* ─── Notifications ─── */
export const notificationApi = {
  listMine: () => apiGet('/api/notifications'),
  send: (payload) => apiPost('/api/notifications/send', payload),
  markRead: (id) => apiPut(`/api/notifications/${id}/read`),
  markAllRead: () => apiPatch('/api/notifications/read-all', {}),
};

/* ─── Contact ─── */
export const contactApi = {
  submit: (payload) => apiPost('/api/contact', payload, { auth: false }),
  list: () => apiGet('/api/contact', { auth: false }),
};

/* ─── Breakdown ─── */
export const breakdownApi = {
  createCall: (payload) => apiPost('/api/breakdown-calls', payload, { auth: false }),
  list: () => apiGet('/api/breakdown-calls', { auth: false }),
  getById: (id) => apiGet(`/api/breakdown-calls/${id}`, { auth: false }),
  update: (id, payload) => apiPut(`/api/breakdown-calls/${id}`, payload, { auth: false }),
};

/* ─── Services ─── */
export const servicesApi = {
  list: () => apiGet('/api/services', { auth: false }),
  getById: (id) => apiGet(`/api/services/${id}`, { auth: false }),
  create: (payload) => apiPost('/services', payload, { auth: false }),
  update: (id, payload) => apiPut(`/services/${id}`, payload, { auth: false }),
  delete: (id) => apiDelete(`/services/${id}`, { auth: false }),
};

/* ─── Mechanics ─── */
export const mechanicsApi = {
  list: () => apiGet('/api/mechanics', { auth: false }),
  create: (payload) => apiPost('/api/mechanics', payload, { auth: false }),
  update: (id, payload) => apiPut(`/api/mechanics/${id}`, payload, { auth: false }),
};

/* ─── Assignments ─── */
export const assignmentsApi = {
  list: () => apiGet('/api/assignments', { auth: false }),
  getById: (id) => apiGet(`/api/assignments/${id}`, { auth: false }),
  create: (payload) => apiPost('/api/assignments', payload, { auth: false }),
  update: (id, payload) => apiPut(`/api/assignments/${id}`, payload, { auth: false }),
  delete: (id) => apiDelete(`/api/assignments/${id}`, { auth: false }),
};

/* ─── Modifications ─── */
export const modificationsApi = {
  list: () => apiGet('/api/modifications', { auth: false }),
  getById: (id) => apiGet(`/api/modifications/${id}`, { auth: false }),
  createQuote: (payload) => apiPost('/api/mod-quotes', payload, { auth: false }),
  listQuotes: () => apiGet('/api/mod-quotes', { auth: false }),
  updateQuote: (id, payload) => apiPut(`/api/mod-quotes/${id}`, payload, { auth: false }),
  createOrder: (payload) => apiPost('/api/mod-orders', payload, { auth: false }),
};

/* ─── Inventory ─── */
export const inventoryApi = {
  list: () => apiGet('/api/inventory', { auth: false }),
  create: (payload) => apiPost('/api/inventory', payload, { auth: false }),
  update: (id, payload) => apiPut(`/api/inventory/${id}`, payload, { auth: false }),
  delete: (id) => apiDelete(`/api/inventory/${id}`, { auth: false }),
  lowStock: () => apiGet('/api/inventory/low-stock', { auth: false }),
};

/* ─── Users ─── */
export const usersApi = {
  list: () => apiGet('/users', { auth: false }),
  getById: (id) => apiGet(`/users/${id}`, { auth: false }),
  create: (payload) => apiPost('/users', payload, { auth: false }),
  update: (id, payload) => apiPut(`/users/${id}`, payload, { auth: false }),
  delete: (id) => apiDelete(`/users/${id}`, { auth: false }),
};

/* ─── Vehicles ─── */
export const vehiclesApi = {
  listMine: () => apiGet('/api/vehicles/me'),
  create: (payload) => apiPost('/vehicles', payload),
  getById: (id) => apiGet(`/vehicles/${id}`),
  update: (id, payload) => apiPut(`/vehicles/${id}`, payload),
  delete: (id) => apiDelete(`/vehicles/${id}`),
};

/* ─── Analytics ─── */
export const analyticsApi = {
  dashboard: () => apiGet('/api/analytics/dashboard', { auth: false }),
  revenue: () => apiGet('/api/analytics/revenue', { auth: false }),
  bookings: () => apiGet('/api/analytics/bookings', { auth: false }),
  customerSatisfaction: () => apiGet('/api/analytics/customer-satisfaction', { auth: false }),
  generateReport: (payload) => apiPost('/api/reports/generate', payload, { auth: false }),
};

/* ─── Settings ─── */
export const settingsApi = {
  get: () => apiGet('/api/settings', { auth: false }),
  update: (payload) => apiPut('/api/settings', payload, { auth: false }),
  getCompanyInfo: () => apiGet('/api/company-info', { auth: false }),
};

/* ─── Packages ─── */
export const packagesApi = {
  getMyPackages: () => apiGet('/api/packages/me'),
  renew: (id) => apiPost(`/api/packages/${id}/renew`),
  subscribe: (payload) => apiPost('/api/packages/subscribe', payload),
};

/* ─── Upload ─── */
export const uploadApi = {
  profilePhoto: (payload) => apiPost('/api/uploads/profile-photo', payload),
};
