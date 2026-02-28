import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { setAuth } from '../utils/authStorage';
import { ROUTES } from '../utils/routes';

type AuthMode = 'login' | 'register';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [step, setStep] = useState<'phone' | 'register-details' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'user' | 'provider'>(location.state?.role || 'user');
    const [authMode, setAuthMode] = useState<AuthMode>(location.state?.mode || 'login');
    const [loading, setLoading] = useState(false);

    // Handlers
    const handlePhoneSubmit = async () => {
        if (phone.length < 10) {
            toast.error('Please enter a valid 10-digit number');
            return;
        }
        setLoading(true);
        try {
            await adminAPI.sendLoginOtp(phone, role);
            setAuthMode('login');
            setStep('otp');
            toast.success(`OTP sent to ${phone}`);
        } catch (error: any) {
            if (error.response?.status === 404 || error.response?.data?.message?.toLowerCase().includes('not found') || error.response?.data?.message?.includes('No account found')) {
                // Auto-switch to register if not found, but keep phone pre-filled
                setAuthMode('register');
                setStep('register-details');
                toast('Looks like you\'re new here! Create an account.', { icon: '👋' });
            } else {
                console.error('Login Error:', error);
                if (error.response) {
                    console.error('Data:', error.response.data);
                    console.error('Status:', error.response.status);
                    console.error('Headers:', error.response.headers);
                } else if (error.request) {
                    console.error('Request:', error.request);
                } else {
                    console.error('Error Message:', error.message);
                }
                toast.error(error.response?.data?.message || error.message || 'Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async () => {
        if (!name || !email || phone.length < 10) {
            toast.error('Please fill in all details');
            return;
        }
        setLoading(true);
        try {
            await adminAPI.sendRegisterOtp(phone, role, name, email);
            setStep('otp');
            toast.success('OTP sent successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            toast.error('Enter 6-digit OTP');
            return;
        }
        setLoading(true);
        try {
            const res = await adminAPI.verifyOtp(phone, otp, role, authMode);
            const actualRole = res.data.user?.role || role;
            setAuth(res.data.accessToken, actualRole);

            toast.success('Welcome back!', { icon: '🎉' });

            if (actualRole === 'admin') {
                navigate(ROUTES.adminDashboard);
            } else if (actualRole === 'provider') {
                if (authMode === 'register' || res.data.isNewUser) {
                    navigate(ROUTES.providerOnboarding);
                } else {
                    navigate(ROUTES.providerDashboard);
                }
            } else {
                navigate(ROUTES.userBook);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans overflow-hidden text-gray-900 p-6">

            {/* Back to Home Button */}
            <button
                onClick={() => navigate(ROUTES.home)}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white backdrop-blur-md rounded-full text-gray-600 font-bold text-sm transition-all shadow-sm hover:shadow-md z-50 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
            </button>

            {/* Centered Card */}
            <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 relative z-10">

                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-black/5 rounded-2xl blur-xl scale-150" />
                            <img src="/zyvark-logo.png" alt="Zyvark" className="w-16 h-16 rounded-2xl shadow-xl shadow-black/15 mx-auto object-contain relative z-10 ring-2 ring-gray-100" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-outfit font-black text-gray-900 mb-2 tracking-tight">
                        {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-500 font-medium">
                        {authMode === 'login' ? 'Enter your phone to continue' : 'Join thousands of users today'}
                    </p>
                </div>

                {/* Role Toggles */}
                <div className="flex justify-center mb-8">
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setRole('user')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${role === 'user' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            User
                        </button>
                        <button
                            onClick={() => setRole('provider')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${role === 'provider' ? 'bg-white text-black shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Provider
                        </button>
                    </div>
                </div>

                {/* Animated Form Container */}
                <AnimatePresence mode='wait' initial={false}>

                    {/* STEP 1: LOGIN PHONE */}
                    {step === 'phone' && authMode === 'login' && (
                        <motion.div
                            key="login-phone"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="space-y-6">
                                <div className="bg-gray-50 border border-transparent focus-within:border-black focus-within:bg-white rounded-2xl px-4 py-3 transition-all">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile Number</label>
                                    <div className="flex items-center">
                                        <span className="text-gray-900 font-bold text-lg mr-3 border-r border-gray-300 pr-3">+91</span>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            placeholder="98765 43210"
                                            className="bg-transparent border-none outline-none text-gray-900 text-lg font-bold w-full placeholder:text-gray-300 placeholder:font-medium"
                                            maxLength={10}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handlePhoneSubmit}
                                    disabled={loading || phone.length < 10}
                                    className="w-full h-14 bg-black text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-all active:scale-[0.98] shadow-xl shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <span className="animate-spin text-xl">◌</span> : <>Continue <ChevronRight size={20} /></>}
                                </button>

                                <div className="text-center mt-4">
                                    <p className="text-gray-500 font-medium text-sm">
                                        New here?{' '}
                                        <button
                                            onClick={() => { setAuthMode('register'); setStep('register-details'); }}
                                            className="text-black font-bold hover:underline"
                                        >
                                            Create Account
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP: REGISTER DETAILS (NOW INCLUDES PHONE) */}
                    {step === 'register-details' && (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="space-y-4 mb-8">
                                <div className="bg-gray-50 border border-transparent focus-within:border-black focus-within:bg-white rounded-2xl px-4 py-3 transition-all">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile Number</label>
                                    <div className="flex items-center">
                                        <span className="text-gray-900 font-bold text-lg mr-3 border-r border-gray-300 pr-3">+91</span>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                            placeholder="98765 43210"
                                            className="bg-transparent border-none outline-none text-gray-900 text-lg font-bold w-full placeholder:text-gray-300"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 border border-transparent focus-within:border-black focus-within:bg-white rounded-2xl px-4 py-3 transition-all">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="bg-transparent border-none outline-none text-gray-900 font-bold w-full"
                                    />
                                </div>

                                <div className="bg-gray-50 border border-transparent focus-within:border-black focus-within:bg-white rounded-2xl px-4 py-3 transition-all">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className="bg-transparent border-none outline-none text-gray-900 font-bold w-full"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleRegisterSubmit}
                                disabled={loading}
                                className="w-full h-14 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all active:scale-[0.98] shadow-xl shadow-black/20 disabled:opacity-50"
                            >
                                {loading ? <span className="animate-spin text-xl">◌</span> : 'Sign Up'}
                            </button>

                            <div className="text-center mt-6">
                                <p className="text-gray-500 font-medium text-sm">
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => { setAuthMode('login'); setStep('phone'); }}
                                        className="text-black font-bold hover:underline"
                                    >
                                        Log In
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: OTP */}
                    {step === 'otp' && (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        >
                            <button onClick={() => setAuthMode('login')} className="text-gray-500 hover:text-black font-bold text-xs uppercase tracking-widest flex items-center gap-1 mb-6">
                                <ArrowLeft size={14} /> Change Number
                            </button>

                            <div className="mb-6 text-center">
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Verify OTP</h3>
                                <p className="text-gray-500 font-medium">Code sent to +91 {phone}</p>
                            </div>

                            <div className="mb-8">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="• • • • • •"
                                    maxLength={6}
                                    className="w-full h-20 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-black outline-none text-gray-900 text-center text-4xl tracking-[0.5em] font-bold transition-all placeholder:text-gray-300"
                                    autoFocus
                                />
                            </div>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.length < 6}
                                className="w-full h-14 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all active:scale-[0.98] shadow-xl shadow-black/20 disabled:opacity-50"
                            >
                                {loading ? <span className="animate-spin text-xl">◌</span> : 'Verify & Login'}
                            </button>

                            <div className="text-center mt-6">
                                <button
                                    onClick={authMode === 'login' ? handlePhoneSubmit : handleRegisterSubmit}
                                    className="text-sm font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-wider"
                                >
                                    Resend Code
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>

                <div className="mt-10 text-center space-y-2">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        By continuing, you agree to Terms & Privacy
                    </p>
                    <p className="text-gray-300 text-[9px] font-semibold uppercase tracking-[0.15em]">
                        a auxstel product
                    </p>
                </div>
            </div>
        </div>
    );
}
