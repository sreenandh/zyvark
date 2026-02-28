import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Menu, X, ArrowRight, Shield, Clock, Award, Phone, Wrench, Tv, Key, Droplet, Zap, Truck, Snowflake, User, Briefcase, ChevronRight, ArrowLeft, Home, CarFront, Siren, Globe, Facebook, Instagram, Twitter, Linkedin, Mail } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { setAuth } from '../utils/authStorage';
import { ROUTES } from '../utils/routes';

export default function Landing() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [location, setLocation] = useState('');
    const [providerCount, setProviderCount] = useState(0);
    const [activeFeature, setActiveFeature] = useState(0);
    const [showLearnMore, setShowLearnMore] = useState(false);

    const features = [
        {
            icon: Clock,
            title: '24/7 Support',
            desc: 'Our dedicated support team is available 365 days a year to assist you with any emergencies or queries.',
            longDesc: 'Emergencies don\'t wait for business hours, and neither do we. Our 24/7 support center is staffed with trained professionals ready to handle distress calls, coordinate with providers, and ensure you get the help you need, day or night. whether it\'s a holiday or 3 AM.',
            image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            icon: Shield,
            title: 'Verified Providers',
            desc: 'Every responder undergoes rigorous background checks and continuous training to ensure your safety.',
            longDesc: 'Your safety is our top priority. That\'s why every single provider on the Zyvark platform undergoes a multi-step verification process, including government ID checks, criminal background screening, and skill assessments. We also monitor performance in real-time to maintain the highest standards of trust.',
            image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            icon: Award,
            title: 'Fastest Response',
            desc: 'Our advanced algorithm connects you to the nearest responder in seconds, minimizing wait times.',
            longDesc: 'Time is critical in an emergency. Our proprietary dispatch algorithm analyzes real-time traffic data, provider location, and equipment availability to match you with the closest qualified responder instantly. We aim to reduce response times by up to 40% compared to traditional services.',
            image: 'https://images.unsplash.com/photo-1594950785089-1065c27633d7?auto=format&fit=crop&q=80&w=2000'
        },
        {
            icon: User,
            title: 'User Friendly',
            desc: 'Designed for high-stress situations, our interface is intuitive and requires minimal taps to get help.',
            longDesc: 'When you are in a panic, you shouldn\'t have to navigate complex menus. Our "One-Tap SOS" interface is designed by UX experts specifically for high-stress environments. Visual cues, large buttons, and voice command options ensure that anyone, including children and the elderly, can summon help effortlessly.',
            image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % features.length);
        }, 5000); // 5 seconds per slide
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (location) {
            setProviderCount(0);
            const interval = setInterval(() => {
                setProviderCount(prev => {
                    const next = prev + 1;
                    if (next >= 14) clearInterval(interval);
                    return next;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [location]);
    const [pincode, setPincode] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<{ name: string, image: string, subCategories?: string[] } | null>(null);

    // Auth Modal State
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authType, setAuthType] = useState<'login' | 'register'>('login');
    const [authStep, setAuthStep] = useState<'input' | 'otp'>('input');
    const [role, setRole] = useState<'user' | 'provider'>('user');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Detective scroll for navbar style
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchAddress = async (lat: number, lon: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await response.json();
            if (data && data.address) {
                const area = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.road;
                const city = data.address.city || data.address.town || data.address.village || data.address.county;
                if (area || city) {
                    setLocation(`${area ? area : ''}${area && city ? ', ' : ''}${city || ''}`);
                } else {
                    setLocation(`GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                }
                toast.success('Location updated!', { id: 'gps' });
            } else {
                setLocation(`GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
                toast.success('Location updated (Address not found)', { id: 'gps' });
            }
        } catch (error) {
            console.error(error);
            setLocation(`GPS: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
            toast.success('Location updated!', { id: 'gps' });
        }
    };

    const handleGPS = () => {
        if ('geolocation' in navigator) {
            toast.loading('Fetching location...', { id: 'gps' });
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchAddress(latitude, longitude);
                    setShowLocationModal(false);
                },
                (error) => {
                    toast.error('Unable to retrieve location', { id: 'gps' });
                }
            );
        } else {
            toast.error('Geolocation not supported');
        }
    };

    const handlePincode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pincode.length === 6) {
            toast.loading('Verifying pincode...', { id: 'pincode' });
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincode}&country=India`);
                const data = await response.json();

                if (data && data.length > 0) {
                    const place = data[0];
                    const displayNameParts = place.display_name.split(',');
                    const beautifiedAddress = displayNameParts.slice(0, 2).join(', ');

                    setLocation(beautifiedAddress);
                    toast.success(`Location set: ${beautifiedAddress}`, { id: 'pincode' });
                } else {
                    setLocation(`Area Code: ${pincode}`);
                    toast.success(`Location set to ${pincode}`, { id: 'pincode' });
                }
            } catch (error) {
                setLocation(`Area Code: ${pincode}`);
                toast.success(`Location set to ${pincode}`, { id: 'pincode' });
            }
            setShowLocationModal(false);
        } else {
            toast.error('Enter valid 6-digit pincode');
        }
    };

    // --- Navigation Logic ---
    const scrollToSection = (id: string) => {
        setIsMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else if (id === 'home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // --- Auth Logic ---

    const openAuthModal = (type: 'login' | 'register') => {
        setAuthType(type);
        setAuthStep('input');
        setShowAuthModal(true);
        setIsMenuOpen(false);
        setPhone('');
        setOtp('');
        setName('');
        setEmail('');
    };

    const handleRoleSelect = (selectedRole: 'user' | 'provider') => {
        setRole(selectedRole);
    };

    const handlePhoneSubmit = async () => {
        if (phone.length < 10) {
            toast.error('Enter a valid 10-digit number');
            return;
        }
        setLoading(true);
        try {
            await adminAPI.sendLoginOtp(phone, role);
            setAuthStep('otp');
            toast.success(`OTP sent to ${phone}`);
        } catch (error: any) {
            if (error.response?.status === 404 || error.response?.data?.message?.includes('not found')) {
                setAuthType('register');
                setAuthStep('input');
                toast('Account not found. Please sign up!', { icon: '👋' });
            } else {
                toast.error(error.response?.data?.message || 'Something went wrong');
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
            setAuthStep('otp');
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
            const res = await adminAPI.verifyOtp(phone, otp, role, authType);
            const actualRole = res.data.user?.role || role;
            setAuth(res.data.accessToken, actualRole);

            toast.success('Welcome back!', { icon: '🎉' });
            setShowAuthModal(false);

            if (actualRole === 'admin') navigate(ROUTES.adminDashboard);
            else if (actualRole === 'provider') {
                if (authType === 'register' || res.data.isNewUser) navigate(ROUTES.providerOnboarding);
                else navigate(ROUTES.providerDashboard);
            } else {
                navigate(ROUTES.userBook);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const services = [
        {
            name: 'Appliance Repair',
            image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80',
            icon: Snowflake,
            subCategories: ['AC Repair', 'Refrigerator', 'TV Repair', 'Washing Machine'],
            desc: 'AC, Fridge, Washing Machine, and more.'
        },
        {
            name: 'Locksmith',
            image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80',
            icon: Key,
            desc: 'Locked out? Key duplication & lock repair.'
        },
        {
            name: 'Plumber',
            image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&q=80',
            icon: Droplet,
            desc: 'Leak repairs, pipe fitting, and drainage.'
        },
        {
            name: 'Electrician',
            image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80',
            icon: Zap,
            desc: 'Wiring, power failure, and installations.'
        },
        {
            name: 'Roadside Assist',
            // Attempting a busy street/traffic image to show both car and bike
            image: 'https://images.unsplash.com/photo-1548691905-57c36cc8d935?auto=format&fit=crop&q=80',
            icon: Truck,
            desc: 'Car breakdown, towing, or flat tyre support.'
        },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
            <Toaster position="top-center" />

            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-blue-900/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors md:hidden">
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md" />
                                <img src="/zyvark-logo.png" alt="Zyvark" className="w-11 h-11 rounded-2xl shadow-xl shadow-black/30 object-contain relative z-10 ring-2 ring-white/30" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-2xl font-outfit font-black text-white tracking-tight leading-none drop-shadow-md">Zyvark</h1>
                                <p className="text-[9px] font-bold text-blue-100 uppercase tracking-[0.25em] mt-0.5 opacity-90">Emergency Services</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => openAuthModal('login')} className="text-white font-bold text-sm hover:text-blue-200 transition-colors hidden sm:block">
                            Log In
                        </button>
                        <button onClick={() => openAuthModal('register')} className="bg-white text-blue-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl active:scale-95">
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <motion.div
                            key="menu"
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 bottom-0 left-0 z-50 w-[85%] max-w-sm bg-blue-900 text-white p-6 shadow-2xl md:hidden flex flex-col h-full"
                        >
                            <div className="flex-1 overflow-y-auto">
                                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-white/10 rounded-2xl blur-md" />
                                            <img src="/zyvark-logo.png" alt="Zyvark" className="w-12 h-12 rounded-2xl shadow-xl object-contain relative z-10 ring-2 ring-white/20" />
                                        </div>
                                        <div>
                                            <span className="font-outfit font-black text-2xl block leading-none text-white tracking-tight">Zyvark</span>
                                            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.25em]">Menu</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsMenuOpen(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"><X size={20} /></button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => scrollToSection('home')} className="px-4 py-3 hover:bg-white/10 rounded-xl text-left font-bold text-lg transition-all flex items-center justify-between group">
                                        Home <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </button>
                                    <button onClick={() => scrollToSection('services')} className="px-4 py-3 hover:bg-white/10 rounded-xl text-left font-bold text-lg transition-all flex items-center justify-between group">
                                        Services <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </button>
                                    <button onClick={() => scrollToSection('about')} className="px-4 py-3 hover:bg-white/10 rounded-xl text-left font-bold text-lg transition-all flex items-center justify-between group">
                                        About Us <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </button>
                                    <button onClick={() => scrollToSection('contact')} className="px-4 py-3 hover:bg-white/10 rounded-xl text-left font-bold text-lg transition-all flex items-center justify-between group">
                                        Contact <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto border-t border-white/10 pt-6 flex flex-col gap-3 shrink-0">
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all border border-white/10"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => openAuthModal('register')}
                                    className="w-full py-4 bg-white text-blue-900 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-lg active:scale-[0.98]"
                                >
                                    Sign Up Now
                                </button>
                                <p className="text-center text-[9px] text-blue-300/50 font-semibold mt-3 uppercase tracking-[0.15em]">
                                    a auxstel product
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 bg-blue-900 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                {/* Cinematic Background Animations (Zig-Zag / Tech Paths) */}
                <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="transparent" />
                                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>

                        {/* Path 1: Medical (Top Left -> Right) */}
                        <path
                            d="M -100,100 Q 400,50 600,300 T 1300,200"
                            stroke="url(#pathGradient)"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray="10 10"
                            className="drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]"
                        />

                        {/* Path 2: Repair (Bottom Right -> Left) */}
                        <path
                            d="M 1540,800 Q 1000,850 800,600 T 100,700"
                            stroke="url(#pathGradient)"
                            strokeWidth="2"
                            fill="none"
                            strokeDasharray="10 10"
                            className="drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]"
                        />
                    </svg>

                    {/* Style for Motion Path Animations */}
                    <style>{`
                        @keyframes movePath1 {
                            0% { offset-distance: 0%; opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { offset-distance: 100%; opacity: 0; }
                        }
                        @keyframes movePath2 {
                            0% { offset-distance: 0%; opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { offset-distance: 100%; opacity: 0; }
                        }
                        .animate-path-1 {
                            offset-path: path("M -100,100 Q 400,50 600,300 T 1300,200");
                            animation: movePath1 15s linear infinite;
                        }
                        .animate-path-2 {
                            offset-path: path("M 1540,800 Q 1000,850 800,600 T 100,700");
                            animation: movePath2 18s linear infinite;
                            animation-delay: 2s;
                        }
                    `}</style>

                    {/* Road 1 Vehicle: Ambulance */}
                    <div className="absolute top-0 left-0 animate-path-1" style={{ offsetRotate: 'auto' }}>
                        <div className="relative rotate-90 transform">
                            <Siren size={32} className="text-blue-100 drop-shadow-[0_0_10px_rgba(59,130,246,1)]" />
                            {/* Headlights */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-12 bg-gradient-to-t from-blue-400/30 to-transparent blur-md rounded-full" />
                        </div>
                    </div>
                    {/* Destination 1: House */}
                    <div className="absolute top-[22%] right-[10%] text-blue-200 opacity-80">
                        <Home size={36} className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-blue-500/30 blur-sm rounded-full" />
                    </div>


                    {/* Road 2 Vehicle: Tow Truck */}
                    <div className="absolute top-0 left-0 animate-path-2" style={{ offsetRotate: 'auto 180deg' }}>
                        <div className="relative rotate-90 transform">
                            <Truck size={36} className="text-purple-100 drop-shadow-[0_0_10px_rgba(168,85,247,1)]" />
                            {/* Headlights */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-12 bg-gradient-to-t from-purple-400/30 to-transparent blur-md rounded-full" />
                        </div>
                    </div>
                    {/* Destination 2: Broken Car */}
                    <div className="absolute bottom-[22%] left-[7%] text-purple-200 opacity-80">
                        <CarFront size={36} className="drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                        <div className="absolute -top-4 -right-2 animate-bounce">
                            <Wrench size={14} className="text-yellow-400 drop-shadow-md" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-purple-500/30 blur-sm rounded-full" />
                    </div>

                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

                        {/* Premium Road Animation (Top of Hero) */}
                        <div className="flex justify-center mb-10 overflow-visible relative h-32">
                            <div className="absolute bg-[#1e293b] w-full max-w-2xl h-16 rounded-full bottom-0 shadow-2xl shadow-black/40 border border-white/5 overflow-hidden">
                                {/* Asphalt Texture */}
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asphalt-dark.png')] opacity-50 mix-blend-overlay"></div>

                                {/* Moving Road Markings */}
                                <div className="absolute top-1/2 -translate-y-1/2 w-[200%] h-0.5 flex gap-10">
                                    {Array.from({ length: 20 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ x: 0 }}
                                            animate={{ x: -200 }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                            className="w-10 h-0.5 bg-yellow-400/50 rounded-full flex-shrink-0"
                                        />
                                    ))}
                                </div>

                                {/* Scenery Elements (Parallax Trees) */}
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: '-100%' }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                    className="absolute bottom-6 flex gap-48 text-green-800/20"
                                >
                                    <div className="w-8 h-12 bg-current rounded-t-full" />
                                    <div className="w-6 h-10 bg-current rounded-t-full" />
                                    <div className="w-10 h-14 bg-current rounded-t-full" />
                                </motion.div>

                                {/* Provider Scooter (Chasing Direction) */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-full h-full pointer-events-none">
                                    <motion.div
                                        initial={{ x: -50 }}
                                        animate={{ x: '120%' }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                                        className="absolute top-1/2 -translate-y-1/2"
                                    >
                                        <div className="relative">
                                            {/* Scooter Icon - No Circle, Just Shadow */}
                                            <motion.img
                                                src="https://cdn-icons-png.flaticon.com/512/7541/7541900.png"
                                                alt="Scooter"
                                                className="w-9 h-9 object-contain drop-shadow-xl relative z-10"
                                                animate={{ y: [-0.5, 0.5, -0.5], rotate: [0, 1, 0, -1, 0] }}
                                                transition={{ duration: 0.3, repeat: Infinity, ease: 'linear' }}
                                            />

                                            {/* Headlight Beam */}
                                            <div className="absolute left-8 top-1/2 -translate-y-1/2 w-40 h-16 bg-gradient-to-r from-yellow-100/30 to-transparent blur-md rounded-full -z-10" />

                                            {/* Status Tooltip (Compact) */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 5, scale: 0.8 }}
                                                animate={{ opacity: [0, 1, 1, 0], y: [-25, -30, -30, -35], scale: [0.8, 1, 1, 0.9] }}
                                                transition={{ duration: 4, times: [0, 0.1, 0.8, 1], repeat: Infinity, repeatDelay: 1 }}
                                                className="absolute -top-1 left-1/2 -translate-x-1/2 bg-white/90 text-black text-[8px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm border border-white/20 backdrop-blur-[2px]"
                                            >
                                                On the way
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Destination Marker (Far Right) */}
                                <div className="absolute right-12 top-1/2 -translate-y-1/2 z-10">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-red-500/30 rounded-full blur-md animate-ping" />
                                        <MapPin className="text-red-500 fill-current drop-shadow-lg" size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Zyvark Logo Floating Above Road */}
                            <div className="absolute top-0 z-30">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl scale-125 animate-pulse" />
                                    <img src="/zyvark-logo.png" alt="Zyvark" className="w-20 h-20 rounded-2xl shadow-2xl shadow-black/40 object-contain relative z-10 ring-4 ring-white/10 backdrop-blur-sm" />
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-outfit font-black text-white leading-tight mb-6 drop-shadow-2xl relative z-10">
                            Emergency Help,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-purple-200 drop-shadow-none">Just a Click Away.</span>
                        </h1>
                        <p className="text-blue-50 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
                            Hello & Welcome to <span className="font-outfit font-bold text-white text-2xl relative top-0.5">Zyvark</span>. Your trusted emergency partner connecting you with nearby rapid responders instantly.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
                        className="max-w-2xl mx-auto relative group z-20"
                    >
                        {/* Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-tilt" />

                        <button
                            onClick={() => setShowLocationModal(true)}
                            className="relative w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-3 md:p-4 flex items-center justify-between hover:bg-slate-800/60 transition-all cursor-pointer ring-1 ring-white/10 group-hover:ring-blue-500/50 shadow-2xl"
                        >
                            {/* Left Side: Icon & Text */}
                            <div className="flex items-center gap-4 md:gap-6 text-left w-full overflow-hidden">
                                <div className="relative flex-shrink-0">
                                    {/* Pulsing Icon Background */}
                                    <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse" />
                                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-navy-dark rounded-2xl flex items-center justify-center shadow-lg border border-white/20 relative z-10 group-hover:scale-105 transition-transform duration-300">
                                        <MapPin className="text-white w-7 h-7 md:w-8 md:h-8 drop-shadow-md" />
                                    </div>
                                    {/* Connectivity Dot */}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center z-20">
                                        <div className={`w-2.5 h-2.5 rounded-full ${location ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 animate-pulse'}`} />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] md:text-xs font-bold text-blue-300 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <span className="w-8 h-[1px] bg-blue-500/50 hidden md:block"></span>
                                        Current Location
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <p className={`text-lg md:text-2xl font-outfit font-bold truncate ${location ? 'text-white' : 'text-white/60'}`}>
                                            {location || 'Where do you need help?'}
                                        </p>
                                    </div>
                                    {!location && (
                                        <p className="text-[10px] text-blue-200/60 truncate hidden md:block">
                                            Tap to auto-detect or enter manually
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Action Button */}
                            <div className="hidden md:flex flex-col items-end gap-1 ml-4 pl-4 border-l border-white/10">
                                <div className="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl border border-white/10 transition-all flex items-center gap-2 group/btn">
                                    <span className="text-sm font-bold text-white whitespace-nowrap">
                                        {location ? 'Change' : 'Detect GPS'}
                                    </span>
                                    <Navigation size={16} className="text-blue-300 group-hover/btn:text-white group-hover/btn:rotate-45 transition-all" />
                                </div>
                            </div>

                            {/* Mobile Chevron */}
                            <div className="md:hidden pl-3 text-white/50">
                                <ChevronRight size={20} />
                            </div>
                        </button>
                    </motion.div>

                    {/* Live Provider Intel (Shows after location select) */}
                    <AnimatePresence>
                        {location && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: 20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: 20 }}
                                className="max-w-md mx-auto mt-6"
                            >
                                <div className="bg-gradient-to-br from-blue-900/80 to-navy-dark/90 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                                    {/* Radar Animation Background */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <div className="w-64 h-64 border border-blue-500/10 rounded-full animate-ping [animation-duration:3s]" />
                                        <div className="w-48 h-48 border border-blue-500/20 rounded-full animate-ping [animation-duration:2s] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                    </div>

                                    <div className="relative z-10 text-center">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
                                            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Live Activity</span>
                                        </div>

                                        <div className="mb-6">
                                            <span className="text-6xl font-outfit font-black text-white drop-shadow-xl tabular-nums tracking-tighter block mb-1">
                                                {providerCount}
                                            </span>
                                            <span className="text-sm font-bold text-blue-100">Rapid Responders Nearby</span>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => { setAuthType('login'); setShowAuthModal(true); }}
                                                className="flex-1 bg-white text-blue-900 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-white/10 active:scale-95 duration-200"
                                            >
                                                Login to Call Help
                                            </button>
                                            <button
                                                onClick={() => { setAuthType('register'); setShowAuthModal(true); }}
                                                className="px-6 py-3.5 rounded-xl font-bold text-white border border-white/20 hover:bg-white/10 transition-colors active:scale-95 duration-200"
                                            >
                                                Sign Up
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>


                </div>
            </div>

            {/* Categories Section (White Premium) */}
            <div id="services" className="relative bg-white py-32 overflow-hidden">
                {/* Background Distinguisher (Subtle Grid) */}
                <div className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
                </div>

                {/* Floating background blobs for depth */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-sm tracking-wider uppercase mb-6"
                            >
                                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                Our Services
                            </motion.div>
                            <h2 className="text-5xl md:text-6xl font-black text-slate-900 font-outfit leading-tight mb-6">
                                What do you need <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">help with?</span>
                            </h2>
                            <p className="text-slate-500 text-lg leading-relaxed max-w-lg font-medium">
                                From emergency repairs to roadside assistance, our verified experts are ready to help you instantly.
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ x: 5 }}
                            className="hidden md:flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg rounded-2xl text-slate-900 font-bold transition-all group"
                        >
                            View All Categories
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <ArrowRight size={14} />
                            </div>
                        </motion.button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((cat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setSelectedService(cat)}
                                className="group relative h-[420px] rounded-[32px] overflow-hidden cursor-pointer bg-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100"
                            >
                                {/* Image Area (Top Half) */}
                                <div className="h-[240px] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors z-10" />
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>

                                {/* Content Area (Bottom Half) */}
                                <div className="p-8 relative">
                                    {/* Floating Icon */}
                                    <div className="absolute -top-10 right-8 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 border border-slate-50">
                                        <cat.icon size={28} />
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-900 mb-2 font-outfit">{cat.name}</h3>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed mb-4 line-clamp-2">
                                        {cat.desc}
                                    </p>

                                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                                        Book Now <ArrowRight size={16} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why Zyvark Features (Cinematic Banner Style) */}
            <div id="about" className="relative w-full h-[550px] bg-gray-900 overflow-hidden group">
                {/* Background Image Carousel (Ken Burns Effect) */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFeature}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <motion.img
                            src={features[activeFeature].image}
                            alt={features[activeFeature].title}
                            initial={{ scale: 1 }}
                            animate={{ scale: 1.1 }}
                            transition={{ duration: 7, ease: "linear" }}
                            className="w-full h-full object-cover"
                        />
                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90" />
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent opacity-80" />
                    </motion.div>
                </AnimatePresence>

                {/* Content Overlay */}
                <div className="absolute inset-0 z-10 flex flex-col justify-center">
                    <div className="max-w-7xl mx-auto px-6 w-full">
                        <div className="max-w-3xl">
                            <motion.div
                                key={`content-${activeFeature}`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-1 bg-blue-500 rounded-full" />
                                    <span className="text-blue-400 font-bold tracking-[0.2em] uppercase text-sm">Why Zyvark?</span>
                                </div>

                                <h2 className="text-5xl md:text-7xl font-black text-white mb-8 font-outfit leading-[1.1] tracking-tight">
                                    {features[activeFeature].title}
                                </h2>

                                <p className="text-xl md:text-2xl text-gray-300 font-medium leading-relaxed max-w-2xl border-l-4 border-blue-500/30 pl-6 mb-12">
                                    {features[activeFeature].desc}
                                </p>

                                <button
                                    onClick={() => setShowLearnMore(true)}
                                    className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors flex items-center gap-3 group/btn"
                                >
                                    Learn More <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation Tabs */}
                <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/20 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-4">
                            {features.map((feature, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveFeature(i)}
                                    className={`relative py-6 md:py-8 text-left transition-colors group/tab ${activeFeature === i ? 'bg-white/5' : 'hover:bg-white/5'}`}
                                >
                                    {/* Progress Bar (Only for active) */}
                                    {activeFeature === i && (
                                        <motion.div
                                            layoutId="progressBar"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 5, ease: "linear" }}
                                            className="absolute top-0 left-0 h-[3px] bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                                        />
                                    )}

                                    <div className={`flex flex-col items-center md:flex-row md:items-center justify-center gap-3 md:gap-4 px-4 ${activeFeature === i ? 'opacity-100' : 'opacity-50 group-hover/tab:opacity-80'}`}>
                                        <feature.icon size={24} className={activeFeature === i ? 'text-blue-400' : 'text-white'} />
                                        <span className={`text-sm md:text-lg font-bold ${activeFeature === i ? 'text-white' : 'text-gray-300'} hidden md:inline`}>
                                            {feature.title}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Footer / Contact Section */}
            <div id="contact" className="relative bg-[#0B1120] text-white pt-32 pb-12 overflow-hidden">
                {/* Wave Transition (Top) */}
                <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
                    </svg>
                </div>

                {/* Background Pattern (Dotted Map) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* Glowing Orbs */}
                <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">

                        {/* Left Side: Brand & Socials */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
                                    <img src="/zyvark-logo.png" alt="Zyvark" className="w-8 h-8 object-contain" />
                                </div>
                                <span className="text-2xl font-black font-outfit tracking-tight">Zyvark.</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                                Ready to revolutionize <br /> <span className="text-blue-500">emergency response?</span>
                            </h2>
                            <p className="text-gray-400 font-medium text-lg mb-10 max-w-lg leading-relaxed">
                                Join our network of trust. Whether you need help or provide help, Zyvark is your reliable partner in critical moments.
                            </p>

                            <div className="flex gap-4">
                                {[
                                    { icon: Facebook, color: 'hover:bg-[#1877F2]' },
                                    { icon: Instagram, color: 'hover:bg-gradient-to-tr hover:from-[#FD1D1D] hover:to-[#833AB4]' },
                                    { icon: Twitter, color: 'hover:bg-[#1DA1F2]' },
                                    { icon: Linkedin, color: 'hover:bg-[#0A66C2]' },
                                ].map((social, i) => (
                                    <button
                                        key={i}
                                        className={`w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300 hover:text-white hover:scale-110 hover:border-transparent ${social.color}`}
                                    >
                                        <social.icon size={20} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Contact Actions (Glass Card) */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[60px] group-hover:bg-blue-500/30 transition-colors" />

                            <h3 className="text-2xl font-bold mb-8">Get in touch instantly</h3>

                            <div className="space-y-4">
                                <button className="w-full h-20 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-600/30 flex items-center justify-between px-8 group/btn">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            <Phone size={20} className="fill-current" />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-xs uppercase tracking-wider opacity-70">Emergency Hotline</span>
                                            <span className="text-xl">+1 (800) ZYVARK-HELP</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all" />
                                </button>

                                <button className="w-full h-20 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold text-lg transition-all flex items-center justify-between px-8 group/btn">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                            <Mail size={20} />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-xs uppercase tracking-wider opacity-70">General Inquiries</span>
                                            <span className="text-xl">support@zyvark.com</span>
                                        </div>
                                    </div>
                                    <ArrowRight className="opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500 font-medium">
                        <p>&copy; 2026 Zyvark Inc. All rights reserved.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                        </div>
                        <p className="font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                            Product by <span className="text-blue-500">Auxstel</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Service Modal */}
            <AnimatePresence>
                {selectedService && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setSelectedService(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
                        >
                            <div className="h-48 shrink-0 relative">
                                <img src={selectedService.image} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                                <button onClick={() => setSelectedService(null)} className="absolute top-6 right-6 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 backdrop-blur-md transition-colors"><X size={24} /></button>
                                <div className="absolute bottom-6 left-8">
                                    <h3 className="text-4xl font-black text-white tracking-tight leading-none">{selectedService.name}</h3>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8">
                                <p className="text-gray-600 font-medium text-lg mb-8 leading-relaxed">
                                    Need reliable {selectedService.name.toLowerCase()} assistance?
                                    Our verified experts are just a few taps away.
                                </p>

                                {/* Sub-category Selection for Appliances */}
                                {selectedService.subCategories ? (
                                    <div className="mb-8">
                                        <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs border-b border-gray-100 pb-4 mb-4">Select Appliance</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedService.subCategories.map((sub, idx) => (
                                                <button
                                                    key={idx}
                                                    className="p-4 rounded-2xl border-2 border-gray-100 hover:border-black hover:bg-gray-50 text-left transition-all group relative overflow-hidden"
                                                >
                                                    <span className="block font-bold text-gray-900 relative z-10">{sub}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 mb-8">
                                        <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs border-b border-gray-100 pb-2">How it works</h4>
                                        <div className="flex gap-5">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shrink-0">1</div>
                                            <div><h5 className="font-bold text-gray-900 text-lg">Request Help</h5><p className="text-gray-500 font-medium">Share your location.</p></div>
                                        </div>
                                        <div className="flex gap-5">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shrink-0">2</div>
                                            <div><h5 className="font-bold text-gray-900 text-lg">Match</h5><p className="text-gray-500 font-medium">Nearby provider accepts.</p></div>
                                        </div>
                                        <div className="flex gap-5">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shrink-0">3</div>
                                            <div><h5 className="font-bold text-gray-900 text-lg">Arrive</h5><p className="text-gray-500 font-medium">Help reaches you.</p></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-white shrink-0">
                                <button
                                    onClick={() => openAuthModal('login')}
                                    className="w-full h-16 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-black/20 active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    Login to Book Now <ArrowRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Location Modal */}
            <AnimatePresence>
                {showLocationModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowLocationModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden relative z-10"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-3xl font-black text-gray-900">Set Location</h3>
                                    <button onClick={() => setShowLocationModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"><X size={24} /></button>
                                </div>

                                <button
                                    onClick={handleGPS}
                                    className="w-full flex items-center gap-5 p-5 border-2 border-blue-50 bg-blue-50/30 rounded-3xl hover:border-blue-200 hover:bg-blue-50 transition-all mb-8 group text-left"
                                >
                                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                        <Navigation size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Use Current Location</h4>
                                        <p className="text-sm text-gray-500 font-bold mt-1">Using GPS</p>
                                    </div>
                                </button>

                                <div className="relative mb-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-100"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-3 text-gray-300 font-black tracking-widest">Or enter manually</span>
                                    </div>
                                </div>

                                <form onSubmit={handlePincode} className="flex gap-3">
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="Enter Pincode"
                                            className="w-full h-14 bg-gray-50 rounded-2xl pl-14 pr-4 font-bold outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all text-gray-900 placeholder:font-medium placeholder:text-gray-400 text-lg"
                                        />
                                    </div>
                                    <button type="submit" className="h-14 px-8 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors text-lg">Apply</button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* NEW: Integrated Auth Modal */}
            <AnimatePresence>
                {showAuthModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setShowAuthModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative z-20 p-8 md:p-12 text-center"
                        >
                            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 bg-gray-100 p-3 rounded-full hover:bg-gray-200 transition-colors z-30"><X size={20} /></button>

                            {/* Step 1: Combined Input (Role + Form) */}
                            {authStep === 'input' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <div className="flex justify-center mb-6">
                                        <img src="/zyvark-logo.png" alt="Zyvark" className="w-14 h-14 rounded-2xl shadow-xl shadow-black/10 object-contain ring-2 ring-gray-100" />
                                    </div>
                                    <div className="text-left mb-6">
                                        <h2 className="text-3xl font-black text-gray-900 mb-2">
                                            {authType === 'login' ? 'Welcome Back' : 'Join Zyvark'}
                                        </h2>
                                        <p className="text-gray-500 font-medium">
                                            {authType === 'login'
                                                ? `Login as ${role === 'user' ? 'Customer' : 'Partner'} to continue.`
                                                : `Create a ${role === 'user' ? 'Customer' : 'Partner'} account.`}
                                        </p>
                                    </div>

                                    {/* Role Switcher */}
                                    <div className="bg-gray-100 p-1.5 rounded-2xl flex mb-8">
                                        <button
                                            onClick={() => setRole('user')}
                                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${role === 'user' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Customer
                                        </button>
                                        <button
                                            onClick={() => setRole('provider')}
                                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${role === 'provider' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Partner
                                        </button>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {authType === 'register' && (
                                            <>
                                                <input
                                                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                                                    placeholder="Full Name" className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none border-2 border-transparent focus:border-black/10 focus:bg-white transition-all"
                                                />
                                                <input
                                                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Email Address" className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none border-2 border-transparent focus:border-black/10 focus:bg-white transition-all"
                                                />
                                            </>
                                        )}
                                        <div className="bg-gray-50 rounded-2xl px-5 py-4 flex items-center border-2 border-transparent focus-within:border-black/10 focus-within:bg-white transition-all">
                                            <span className="text-gray-900 font-bold text-xl mr-4 border-r border-gray-300 pr-4">+91</span>
                                            <input
                                                type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                                placeholder="98765 43210" className="bg-transparent font-bold text-xl w-full outline-none" maxLength={10} autoFocus
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={authType === 'login' ? handlePhoneSubmit : handleRegisterSubmit}
                                        disabled={loading}
                                        className="w-full h-14 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/20 active:scale-[0.98]"
                                    >
                                        {loading ? 'Processing...' : (authType === 'login' ? <>Get OTP <ChevronRight size={20} /></> : 'Create Account')}
                                    </button>

                                    <div className="mt-8 text-center">
                                        <p className="text-gray-500 font-medium text-sm">
                                            {authType === 'login' ? "New to Zyvark? " : "Already have an account? "}
                                            <button
                                                onClick={() => setAuthType(authType === 'login' ? 'register' : 'login')}
                                                className="text-black font-black hover:underline"
                                            >
                                                {authType === 'login' ? 'Sign Up' : 'Log In'}
                                            </button>
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: OTP */}
                            {authStep === 'otp' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-black text-gray-900 mb-2">Verify OTP</h2>
                                        <p className="text-gray-500 font-medium">Sent to +91 {phone}</p>
                                    </div>
                                    <input
                                        type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="••••••" maxLength={6} className="w-full h-20 bg-gray-50 rounded-2xl text-center text-4xl font-black tracking-[0.5em] mb-8 outline-none focus:ring-2 focus:ring-black transition-all" autoFocus
                                    />
                                    <button onClick={handleVerifyOtp} disabled={loading} className="w-full h-14 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all mb-4">
                                        {loading ? 'Verifying...' : 'Verify & Login'}
                                    </button>
                                    <button onClick={() => setAuthStep('input')} className="text-sm font-bold text-gray-400 hover:text-black">Incorrect Number?</button>
                                </motion.div>
                            )}

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Feature Detail Modal */}
            <AnimatePresence>
                {showLearnMore && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            onClick={() => setShowLearnMore(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-gray-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden relative z-10 border border-white/10"
                        >
                            <div className="h-64 shrink-0 relative">
                                <img src={features[activeFeature].image} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                                <button onClick={() => setShowLearnMore(false)} className="absolute top-6 right-6 bg-black/40 text-white p-2 rounded-full hover:bg-white/20 backdrop-blur-md transition-colors border border-white/10"><X size={24} /></button>

                                <div className="absolute bottom-6 left-8 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-blue-600/90 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
                                        {React.createElement(features[activeFeature].icon, { size: 32, className: "text-white" })}
                                    </div>
                                    <h3 className="text-4xl font-black text-white tracking-tight leading-none drop-shadow-lg">{features[activeFeature].title}</h3>
                                </div>
                            </div>

                            <div className="p-10">
                                <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-4">Detailed Information</h4>
                                <p className="text-gray-300 font-medium text-lg leading-relaxed mb-8">
                                    {features[activeFeature].longDesc}
                                </p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setShowLearnMore(false); openAuthModal('register'); }}
                                        className="flex-1 bg-white text-gray-900 h-14 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg active:scale-[0.98]"
                                    >
                                        Get Started Now
                                    </button>
                                    <button
                                        onClick={() => setShowLearnMore(false)}
                                        className="h-14 px-8 border border-white/10 text-white rounded-xl font-bold hover:bg-white/5 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
