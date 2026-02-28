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
import { ROUTES } from './utils/routes';
import './index.css';

const queryClient = new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route
                        path={ROUTES.home}
                        element={
                            <RedirectIfLoggedIn>
                                <Landing />
                            </RedirectIfLoggedIn>
                        }
                    />
                    <Route
                        path={ROUTES.login}
                        element={
                            <RedirectIfLoggedIn>
                                <Login />
                            </RedirectIfLoggedIn>
                        }
                    />

                    <Route
                        path={ROUTES.providerOnboarding}
                        element={
                            <ProtectedRoute allowedRoles={['provider']}>
                                <ProviderOnboarding />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path={ROUTES.providerDashboard}
                        element={
                            <ProtectedRoute allowedRoles={['provider']}>
                                <ProviderDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path={ROUTES.userBook}
                        element={
                            <ProtectedRoute allowedRoles={['user']}>
                                <UserHome />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="providers" element={<Providers />} />
                        <Route path="users" element={<Users />} />
                        <Route path="emergencies" element={<Emergencies />} />
                        <Route path="disputes" element={<Disputes />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    <Route path="/book" element={<Navigate to={ROUTES.userBook} replace />} />
                    <Route path="/provider-onboarding" element={<Navigate to={ROUTES.providerOnboarding} replace />} />
                    <Route path="/provider-dashboard" element={<Navigate to={ROUTES.providerDashboard} replace />} />
                    <Route path="/dashboard" element={<Navigate to={ROUTES.adminDashboard} replace />} />
                    <Route path="/providers" element={<Navigate to={ROUTES.adminProviders} replace />} />
                    <Route path="/users" element={<Navigate to={ROUTES.adminUsers} replace />} />
                    <Route path="/emergencies" element={<Navigate to={ROUTES.adminEmergencies} replace />} />
                    <Route path="/disputes" element={<Navigate to={ROUTES.adminDisputes} replace />} />
                    <Route path="/settings" element={<Navigate to={ROUTES.adminSettings} replace />} />

                    <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
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
