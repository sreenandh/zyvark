import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Reads from EXPO_PUBLIC_API_URL in .env (fallback to localhost for dev)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            SecureStore.deleteItemAsync('token');
        }
        return Promise.reject(error);
    },
);

// Auth
export const authAPI = {
    sendOtp: (phone: string, role = 'user') => api.post('/auth/send-otp', { phone, role }),
    verifyOtp: (phone: string, otp: string, role = 'user') => api.post('/auth/verify-otp', { phone, otp, role }),
    getMe: () => api.get('/auth/me'),
};

// Categories
export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    seed: () => api.post('/categories/seed'),
};

// Emergencies
export const emergenciesAPI = {
    create: (formData: FormData) => api.post('/emergencies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getStatus: (id: string) => api.get(`/emergencies/${id}/status`),
    confirm: (id: string) => api.post(`/emergencies/${id}/confirm`),
    dispute: (id: string, formData: FormData) => api.post(`/emergencies/${id}/dispute`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getHistory: (page = 1) => api.get(`/emergencies/history?page=${page}`),
};

// Providers
export const providersAPI = {
    register: (formData: FormData) => api.post('/providers/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    toggleOnline: (isOnline: boolean) => api.put('/providers/toggle-online', { isOnline }),
    updateLocation: (latitude: number, longitude: number) => api.put('/providers/update-location', { latitude, longitude }),
    getIncomingJobs: () => api.get('/emergencies/incoming'),
    acceptJob: (id: string, quotedPrice: number) => api.post(`/emergencies/${id}/accept`, { quotedPrice }),
    markArrived: (id: string) => api.put(`/emergencies/${id}/arrived`),
    markCompleted: (id: string) => api.put(`/emergencies/${id}/completed`),
    getEarnings: () => api.get('/providers/earnings'),
    getProfile: () => api.get('/providers/profile'),
};

// Reviews
export const reviewsAPI = {
    create: (data: { emergencyId: string; providerId: string; rating: number; comment?: string }) =>
        api.post('/reviews', data),
};

// Payments
export const paymentsAPI = {
    createOrder: (emergencyId: string, amount: number) =>
        api.post('/payments/create-order', { emergencyId, amount }),
    verify: (emergencyId: string, razorpayPaymentId: string, signature: string) =>
        api.post('/payments/verify', { emergencyId, razorpayPaymentId, signature }),
};

// Users
export const usersAPI = {
    updateProfile: (data: any) => api.put('/users/profile', data),
    addAddress: (data: any) => api.post('/users/addresses', data),
    getAddresses: () => api.get('/users/addresses'),
};

export default api;
