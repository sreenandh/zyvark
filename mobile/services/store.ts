import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
    id: string;
    phone: string;
    name: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,

    setAuth: async (user, token) => {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },

    loadAuth: async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            const userStr = await SecureStore.getItemAsync('user');
            if (token && userStr) {
                const user = JSON.parse(userStr);
                set({ user, token, isAuthenticated: true, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },
}));

interface EmergencyState {
    activeEmergency: any | null;
    selectedCategory: any | null;
    location: { latitude: number; longitude: number } | null;
    setActiveEmergency: (emergency: any) => void;
    setSelectedCategory: (category: any) => void;
    setLocation: (location: { latitude: number; longitude: number }) => void;
    clearEmergency: () => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
    activeEmergency: null,
    selectedCategory: null,
    location: null,

    setActiveEmergency: (emergency) => set({ activeEmergency: emergency }),
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setLocation: (location) => set({ location }),
    clearEmergency: () => set({ activeEmergency: null, selectedCategory: null }),
}));
