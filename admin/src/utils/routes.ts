export const ROUTES = {
    home: '/',
    login: '/login',
    userBook: '/user/book',
    providerOnboarding: '/provider/onboarding',
    providerDashboard: '/provider/dashboard',
    adminDashboard: '/admin/dashboard',
    adminProviders: '/admin/providers',
    adminUsers: '/admin/users',
    adminEmergencies: '/admin/emergencies',
    adminDisputes: '/admin/disputes',
    adminSettings: '/admin/settings',
} as const;

export type AppRole = 'user' | 'provider' | 'admin';

export function roleHomePath(role?: string | null): string {
    if (role === 'user') return ROUTES.userBook;
    if (role === 'provider') return ROUTES.providerDashboard;
    return ROUTES.adminDashboard;
}
