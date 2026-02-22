import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RedirectIfLoggedIn from './components/RedirectIfLoggedIn';
import Dashboard from './pages/Dashboard';
import Providers from './pages/Providers';
import Users from './pages/Users';
import Emergencies from './pages/Emergencies';
import Disputes from './pages/Disputes';
import Login from './pages/Login';
import Landing from './pages/Landing';
import ProviderOnboarding from './pages/ProviderOnboarding';
import ProviderDashboard from './pages/ProviderDashboard';
import UserHome from './pages/UserHome';
import Settings from './pages/Settings';
import './index.css';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Public: Landing Page (default) - Redirects to dashboard if logged in */}
                    <Route path="/" element={
                        <RedirectIfLoggedIn>
                            <Landing />
                        </RedirectIfLoggedIn>
                    } />

                    {/* Public: Login — redirects away if already logged in */}
                    <Route path="/login" element={
                        <RedirectIfLoggedIn>
                            <Login />
                        </RedirectIfLoggedIn>
                    } />

                    {/* Provider pages (full-screen, no admin sidebar) */}
                    <Route path="/provider-onboarding" element={
                        <ProtectedRoute allowedRoles={['provider']}>
                            <ProviderOnboarding />
                        </ProtectedRoute>
                    } />
                    <Route path="/provider-dashboard" element={
                        <ProtectedRoute allowedRoles={['provider']}>
                            <ProviderDashboard />
                        </ProtectedRoute>
                    } />

                    {/* User booking page */}
                    <Route path="/book" element={
                        <ProtectedRoute allowedRoles={['user']}>
                            <UserHome />
                        </ProtectedRoute>
                    } />

                    {/* Admin pages (with sidebar layout) */}
                    <Route element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/providers" element={<Providers />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/emergencies" element={<Emergencies />} />
                        <Route path="/disputes" element={<Disputes />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* Redirect /admin to /dashboard for backward compatibility */}
                    <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

                    {/* Catch-all: redirect to Landing instead of login */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#FFFFFF',
                        color: '#111827',
                        borderRadius: '16px',
                        border: '1px solid #F3F4F6',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                        fontWeight: 600,
                    },
                }}
            />
        </QueryClientProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
