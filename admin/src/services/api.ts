import axios from 'axios';
import { clearAuth, getAuthToken } from '../utils/authStorage';
import { ROUTES } from '../utils/routes';

// Reads from VITE_API_URL in .env (fallback to localhost for dev)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-logout on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuth();
            if (window.location.pathname !== ROUTES.login) {
                window.location.href = ROUTES.login;
            }
        }
        return Promise.reject(error);
    },
);

export const adminAPI = {
    // Auth — Login (existing account)
    sendLoginOtp: (phone: string, role: string = 'user') =>
        api.post('/auth/send-otp', { phone, role, mode: 'login' }),

    // Auth — Register (new account)
    sendRegisterOtp: (phone: string, role: string, name: string, email: string) =>
        api.post('/auth/send-otp', { phone, role, mode: 'register', name, email }),

    // Auth — Verify OTP (both login & register)
    verifyOtp: (phone: string, otp: string, role: string = 'user', mode: string = 'login') =>
        api.post('/auth/verify-otp', { phone, otp, role, mode }),

    // Auth — Profile
    getProfile: () => api.get('/auth/me'),

    // Dashboard
    getDashboardStats: () => api.get('/admin/dashboard-stats'),

    // Categories
    getCategories: () => api.get('/categories'),

    // Provider — Self (for logged-in provider)
    getProviderProfile: () => api.get('/providers/profile'),
    registerProvider: (formData: FormData) =>
        api.post('/providers/register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    toggleOnline: (isOnline: boolean) =>
        api.put('/providers/toggle-online', { isOnline }),
    updateProviderLocation: (latitude: number, longitude: number) =>
        api.put('/providers/update-location', { latitude, longitude }),
    getEarnings: () => api.get('/providers/earnings'),

    // Provider    // User Flow
    findNearbyProviders: (lat: number, long: number, categoryId?: string) =>
        api.get('/providers/nearby', { params: { lat, long, categoryId } }),
    createEmergency: (data: any) => api.post('/emergencies', data),

    // Emergency Actions
    getIncomingJobs: () => api.get('/emergencies/incoming'),
    getActiveJob: () => api.get('/emergencies/active'),
    acceptJob: (emergencyId: string, quotedPrice: number) =>
        api.post(`/emergencies/${emergencyId}/accept`, { quotedPrice }),
    markArrived: (emergencyId: string) =>
        api.put(`/emergencies/${emergencyId}/arrived`),
    markCompleted: (emergencyId: string) =>
        api.put(`/emergencies/${emergencyId}/completed`),

    // Admin — Providers
    getProviders: (page = 1) => api.get(`/admin/providers?page=${page}`),
    getPendingProviders: (page = 1) => api.get(`/admin/providers/pending?page=${page}`),
    approveProvider: (id: string) => api.put(`/admin/providers/${id}/approve`),
    rejectProvider: (id: string) => api.put(`/admin/providers/${id}/reject`),

    // Admin — Users
    getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),

    // Admin — Emergencies
    getEmergencies: (page = 1) => api.get(`/admin/emergencies?page=${page}`),

    // Admin — Disputes
    getDisputes: (page = 1) => api.get(`/admin/disputes?page=${page}`),
    resolveDispute: (id: string, status: string, adminNotes?: string) =>
        api.put(`/admin/disputes/${id}/resolve`, { status, adminNotes }),

    // Settings
    getSettings: () => api.get('/settings'),
    updateSettings: (data: any) => api.patch('/settings', data),
};

export default api;
