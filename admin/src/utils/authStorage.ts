import { AppRole } from './routes';

export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_ROLE_KEY = 'auth_role';
const LEGACY_TOKEN_KEY = 'admin_token';
const LEGACY_ROLE_KEY = 'user_role';

function migrateLegacyAuthStorage() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const role = localStorage.getItem(AUTH_ROLE_KEY);
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
    const legacyRole = localStorage.getItem(LEGACY_ROLE_KEY);

    if (!token && legacyToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, legacyToken);
    }
    if (!role && legacyRole) {
        localStorage.setItem(AUTH_ROLE_KEY, legacyRole);
    }

    if (legacyToken || legacyRole) {
        localStorage.removeItem(LEGACY_TOKEN_KEY);
        localStorage.removeItem(LEGACY_ROLE_KEY);
    }
}

export function getAuthToken(): string | null {
    migrateLegacyAuthStorage();
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthRole(): AppRole | null {
    migrateLegacyAuthStorage();
    const role = localStorage.getItem(AUTH_ROLE_KEY);
    if (role === 'user' || role === 'provider' || role === 'admin') return role;
    return null;
}

export function setAuth(token: string, role: string) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_ROLE_KEY, role);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_ROLE_KEY);
}

export function clearAuth() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_ROLE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_ROLE_KEY);
}
