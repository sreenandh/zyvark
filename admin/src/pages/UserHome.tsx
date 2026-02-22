import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MapPin, Navigation, Clock, Star, Shield, ArrowLeft, Search, LogOut, ChevronRight, CheckCircle, Zap, Droplets, Snowflake, Wind } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import SOSLoader from '../components/SOSLoader';
import { ProviderSkeleton } from '../components/SkeletonLoader';

interface Category {
    id: string;
    name: string;
    icon: string;
    smartQuestions?: {
        question: string;
        type: 'yes_no' | 'single_choice';
        options?: string[];
    }[];
}

interface Provider {
    id: string;
    name: string;
    phone: string;
    distance?: number;
    hourlyRate?: number;
    photoUrl?: string;
    rating?: number;
    jobsCompleted?: number;
}

// --- Hyper-Premium 3D Tilt Card ---

function TiltCard({ children, onClick, className }: { children: React.ReactNode, onClick: () => void, className?: string }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = e.clientX - rect.left;
        const mouseYVal = e.clientY - rect.top;
        const xPct = mouseXVal / width - 0.5;
        const yPct = mouseYVal / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`relative transition-all duration-200 ease-out ${className}`}
        >
            <div style={{ transform: "translateZ(50px)" }} className="absolute inset-0 pointer-events-none" />
            {children}
        </motion.div>
    );
}


// --- Category Environments ---

const ACEnvironment = () => (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-50 to-white">
        {/* Frost Particles */}
        {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
                key={i}
                className="absolute bg-blue-200/40 rounded-full blur-[1px]"
                style={{
                    width: Math.random() * 6 + 2,
                    height: Math.random() * 6 + 2,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                }}
                animate={{
                    y: [0, -20, 0],
                    x: [0, Math.random() * 10 - 5, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2
                }}
            />
        ))}
        {/* Cold Mist */}
        <motion.div
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-blue-100/30 to-transparent blur-xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
        />
        {/* Frost Border Effect */}
        <div className="absolute inset-0 border border-white/60 rounded-[2rem] bg-white/10 backdrop-blur-[1px]" />
    </div>
);

const PlumbingEnvironment = () => (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-50 to-blue-50">
        {/* Water Ripples */}
        <div className="absolute bottom-[-20px] left-[-20px] right-[-20px] h-20 opacity-30">
            <svg viewBox="0 0 100 20" className="w-full h-full fill-blue-400">
                <motion.path
                    d="M0 10 Q 25 20 50 10 T 100 10 V 20 H 0 Z"
                    animate={{ d: ["M0 10 Q 25 20 50 10 T 100 10 V 20 H 0 Z", "M0 10 Q 25 0 50 10 T 100 10 V 20 H 0 Z", "M0 10 Q 25 20 50 10 T 100 10 V 20 H 0 Z"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
            </svg>
        </div>
        {/* Bubbles */}
        {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
                key={i}
                className="absolute bg-blue-300/30 rounded-full border border-blue-200/50"
                style={{
                    width: Math.random() * 8 + 4,
                    height: Math.random() * 8 + 4,
                    left: `${Math.random() * 80 + 10}%`,
                    bottom: '-10px',
                }}
                animate={{
                    y: -150,
                    opacity: [0, 1, 0],
                    x: Math.random() * 20 - 10
                }}
                transition={{
                    duration: 4 + Math.random() * 3,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: Math.random() * 5
                }}
            />
        ))}
    </div>
);

const ElectricEnvironment = () => (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Background Spark/Glow */}
        <motion.div
            className="absolute inset-0 bg-yellow-500/5"
            animate={{ opacity: [0.05, 0.2, 0.05] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
        />
        {/* Lightning Bolts */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <motion.path
                d="M40 10 L 60 50 L 30 60 L 70 110"
                stroke="yellow"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            />
            <motion.path
                d="M20 30 L 40 40 L 10 50 L 30 70"
                stroke="white"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1.5, delay: 0.5 }}
            />
        </svg>
        {/* Floating Sparks */}
        {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                animate={{ scale: [0, 1.5, 0], opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: Math.random() * 2 }}
            />
        ))}
    </div>
);

const CarEnvironment = () => (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-gradient-to-br from-gray-100 to-white">
        {/* Motion Blur Road Lines */}
        <div className="absolute inset-0 flex flex-col justify-center gap-8 -skew-x-12 opacity-10">
            <motion.div className="h-2 bg-black w-full" animate={{ x: [-100, 100] }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            <motion.div className="h-2 bg-black w-full" animate={{ x: [-100, 100] }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear", delay: 0.2 }} />
            <motion.div className="h-2 bg-black w-full" animate={{ x: [-100, 100] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.5 }} />
        </div>
        {/* Speed Wind */}
        <motion.div
            className="absolute top-1/2 left-0 w-20 h-32 bg-gradient-to-r from-gray-200/50 to-transparent blur-md"
            animate={{ opacity: [0.3, 0.6, 0.3], scaleX: [1, 1.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
        />
    </div>
);

const DefaultEnvironment = () => (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-white">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gray-50 rounded-full blur-2xl opacity-50" />
    </div>
);


const CategoryContent = ({ name, icon }: { name: string, icon: string }) => {
    const lowerName = name.toLowerCase();
    const isElectric = lowerName.includes('electric') || lowerName.includes('voltage');

    // Determine content based on category
    let IconComponent = null;
    let textColor = isElectric ? 'text-white' : 'text-gray-900';
    let iconBg = isElectric ? 'bg-white/10 text-yellow-400 backdrop-blur-md border border-white/20' : 'bg-white text-gray-900 border border-gray-100 shadow-sm';

    if (lowerName.includes('ac')) IconComponent = Snowflake;
    else if (lowerName.includes('plumb')) IconComponent = Droplets;
    else if (lowerName.includes('electric')) IconComponent = Zap;
    else if (lowerName.includes('vehicle') || lowerName.includes('car')) IconComponent = Wind; // Using Wind to represent speed
    else IconComponent = ChevronRight; // Fallback

    return (
        <div className="relative z-10 h-full flex flex-col justify-between p-6 pointer-events-none">
            <div className="flex justify-between items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${iconBg} transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
                    {icon}
                </div>
                {/* 3D Floating Element */}
                <motion.div
                    className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
                    style={{ transform: "translateZ(30px)" }}
                >
                    <IconComponent size={20} className={isElectric ? "text-yellow-600" : "text-blue-500"} />
                </motion.div>
            </div>

            <div>
                <h3 className={`font-outfit font-black text-2xl leading-none mb-1 ${textColor}`} style={{ transform: "translateZ(20px)" }}>
                    {name}
                </h3>
                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest opacity-60 ${textColor}`}>
                    Select <ChevronRight size={10} />
                </div>
            </div>
        </div>
    );
};


export default function UserHome() {
    const navigate = useNavigate();
    const [step, setStep] = useState<'category' | 'questions' | 'location' | 'providers' | 'success' | 'logout_confirm'>('category');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await adminAPI.getCategories();
            setCategories(res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCategorySelect = (cat: Category) => {
        setSelectedCategory(cat);
        setAnswers({});
        if (cat.smartQuestions && cat.smartQuestions.length > 0) {
            setStep('questions');
        } else {
            setStep('location');
        }
    };

    const handleAnswerChange = (question: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [question]: answer }));
    };

    const handleGetLocation = () => {
        setLocating(true);
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported');
            setLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Artificial delay for "satellite" effect
                await new Promise(resolve => setTimeout(resolve, 1500));

                setLocation({
                    lat: latitude,
                    lng: longitude,
                    address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                });
                setLocating(false);
                findProviders(latitude, longitude);
            },
            () => {
                toast.error('Unable to retrieve location');
                setLocating(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const findProviders = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Minimum loading time for Effect
            const res = await adminAPI.findNearbyProviders(lat, lng, selectedCategory?.id);
            setProviders(res.data || []);
            setStep('providers');
        } catch (error) {
            toast.error('Failed to find providers');
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!selectedCategory || !location) return;
        setLoading(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([q, a]) => ({
                question: q,
                answer: a
            }));

            await adminAPI.createEmergency({
                categoryId: selectedCategory.id,
                latitude: location.lat,
                longitude: location.lng,
                addressText: location.address,
                questionnaireAnswers: JSON.stringify(formattedAnswers)
            });

            // Success Animation
            setStep('success');
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B']
            });

            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);

        } catch (error) {
            toast.error('Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    const springTransition = {
        type: "spring",
        stiffness: 300,
        damping: 30
    };

    const pageVariants = {
        initial: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
        in: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        out: { opacity: 0, scale: 1.05, filter: 'blur(10px)' }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans overflow-hidden relative selection:bg-black selection:text-white">

            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-pink-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-md mx-auto min-h-screen flex flex-col relative z-10 bg-white/80 backdrop-blur-xl shadow-2xl shadow-gray-200/50 border-x border-white/50">

                {/* Premium Glass Header */}
                <header className="px-6 py-5 flex items-center justify-between sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100/50 transition-all">
                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer" onClick={() => navigate('/')}>
                            <img src="/zyvark-logo.png" alt="Zyvark" className="w-10 h-10 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div>
                            <h1 className="font-outfit font-black text-gray-900 leading-none text-xl tracking-tight">Zyvark</h1>
                            <p className="text-[9px] uppercase font-bold text-gray-400 tracking-[0.2em] mt-0.5">Rapid Response</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setStep('logout_confirm')}
                        className="p-2.5 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-red-500 active:scale-90 group"
                        title="Logout"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </header>

                {/* Logout Confirmation Modal */}
                <AnimatePresence>
                    {step === 'logout_confirm' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                            onClick={() => setStep(selectedCategory ? 'questions' : 'category')} // Close on backdrop click
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <LogOut size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2 font-outfit">Log Out?</h3>
                                <p className="text-gray-500 mb-8 font-medium">Are you sure you want to end your session?</p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(selectedCategory ? 'questions' : 'category')}
                                        className="flex-1 py-4 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => { localStorage.clear(); navigate('/'); }}
                                        className="flex-1 py-4 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-500/30"
                                    >
                                        Yes, Logout
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 p-6 relative overflow-y-auto pb-32 scrollbar-none">
                    <AnimatePresence mode='wait'>
                        {/* Step 1: Category Selection */}
                        {step === 'category' && (
                            <motion.div
                                key="category"
                                initial="initial" animate="in" exit="out" variants={pageVariants} transition={springTransition}
                            >
                                <div className="mb-8 mt-2">
                                    <h2 className="text-4xl font-outfit font-black text-gray-900 tracking-tight leading-[0.9] mb-3">
                                        Help is here.
                                    </h2>
                                    <p className="text-gray-500 font-medium text-lg">What help do you need today?</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 perspective-1000">
                                    {categories.map((cat, idx) => {
                                        const lowerName = cat.name.toLowerCase();
                                        let Environment = DefaultEnvironment;
                                        if (lowerName.includes('ac')) Environment = ACEnvironment;
                                        else if (lowerName.includes('plumb')) Environment = PlumbingEnvironment;
                                        else if (lowerName.includes('electric')) Environment = ElectricEnvironment;
                                        else if (lowerName.includes('vehicle') || lowerName.includes('car')) Environment = CarEnvironment;

                                        return (
                                            <TiltCard
                                                key={cat.id}
                                                onClick={() => handleCategorySelect(cat)}
                                                className="group h-56 rounded-[2rem] shadow-xl hover:shadow-2xl cursor-pointer"
                                            >
                                                <Environment />
                                                <CategoryContent name={cat.name} icon={cat.icon} />
                                            </TiltCard>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Questions */}
                        {step === 'questions' && selectedCategory && (
                            <motion.div
                                key="questions"
                                initial="initial" animate="in" exit="out" variants={pageVariants} transition={springTransition}
                                className="flex flex-col h-full"
                            >
                                <button onClick={() => setStep('category')} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-black transition w-fit font-bold text-xs bg-gray-100 px-4 py-2.5 rounded-full hover:bg-gray-200">
                                    <ArrowLeft size={14} /> BACK
                                </button>

                                <div className="mb-8">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm border border-blue-100">
                                        {selectedCategory.icon}
                                    </div>
                                    <h1 className="text-3xl font-outfit font-black text-gray-900 mb-2">Details Needed</h1>
                                    <p className="text-gray-500 font-medium">Help the {selectedCategory.name.toLowerCase()} prepare for the job.</p>
                                </div>

                                <div className="space-y-8 flex-1">
                                    {selectedCategory.smartQuestions?.map((q, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="space-y-4"
                                        >
                                            <label className="text-lg font-bold text-gray-900 block font-outfit">{q.question}</label>
                                            <div className="flex flex-wrap gap-3">
                                                {(q.options || ['Yes', 'No']).map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => handleAnswerChange(q.question, opt)}
                                                        className={`px-6 py-3.5 rounded-2xl text-sm font-bold transition border-2 shadow-sm transform active:scale-95 ${answers[q.question] === opt
                                                            ? 'bg-black text-white border-black shadow-lg shadow-black/20'
                                                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:text-gray-900'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="space-y-4 pt-4 border-t border-gray-100"
                                    >
                                        <label className="text-lg font-bold text-gray-900 block font-outfit">
                                            {selectedCategory.name === 'Others' ? 'What needs to be done?' : 'Additional Details (Optional)'}
                                        </label>
                                        <textarea
                                            value={answers['details'] || ''}
                                            onChange={(e) => handleAnswerChange('details', e.target.value)}
                                            placeholder={selectedCategory.name === 'Others' ? "Please describe the issue..." : "e.g. Gate code is 1234, beware of dog..."}
                                            className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-black focus:ring-0 transition-all outline-none resize-none h-32 text-gray-700 font-medium bg-gray-50 focus:bg-white"
                                        />
                                    </motion.div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setStep('location')}
                                    className="w-full mt-10 py-5 rounded-[24px] bg-black text-white font-bold text-lg shadow-xl shadow-black/20 flex items-center justify-center gap-3 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative z-10 flex items-center gap-2">Continue <ChevronRight size={20} /></span>
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Step 3: Location */}
                        {step === 'location' && (
                            <motion.div
                                key="location"
                                initial="initial" animate="in" exit="out" variants={pageVariants} transition={springTransition}
                                className="flex flex-col items-center justify-center py-12"
                            >
                                <button onClick={() => setStep(selectedCategory?.smartQuestions && selectedCategory.smartQuestions.length > 0 ? 'questions' : 'category')} className="absolute top-0 left-0 flex items-center gap-2 text-gray-400 hover:text-black transition font-bold text-xs uppercase tracking-widest">
                                    <ArrowLeft size={14} /> Back
                                </button>

                                {!locating ? (
                                    <>
                                        <div className="w-48 h-48 bg-gradient-to-b from-blue-50 to-blue-100/50 rounded-full flex items-center justify-center mb-10 relative group cursor-pointer" onClick={handleGetLocation}>
                                            <div className="absolute inset-0 border-[4px] border-blue-100 rounded-full animate-ping opacity-30" />
                                            <div className="absolute inset-6 border-[2px] border-blue-200 rounded-full animate-ping delay-100 opacity-30" />
                                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-blue-200/50 group-hover:scale-110 transition-transform duration-300 relative z-10">
                                                <MapPin size={40} className="text-blue-600 fill-blue-600/20" />
                                            </div>
                                        </div>

                                        <h2 className="text-3xl font-outfit font-black text-gray-900 mb-4 text-center">Locate Me</h2>
                                        <p className="text-center text-gray-500 text-lg max-w-xs mb-12 leading-relaxed">
                                            We need your location to find the nearest <span className="font-bold text-gray-900">{selectedCategory?.name}</span> expert.
                                        </p>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleGetLocation}
                                            className="w-full max-w-xs py-5 rounded-[24px] bg-black text-white font-bold text-lg shadow-2xl shadow-black/20 flex items-center justify-center gap-3 hover:bg-gray-900 transition-all border-4 border-white/20 ring-1 ring-black/5"
                                        >
                                            <Navigation size={22} className="fill-current" />
                                            Detect Location
                                        </motion.button>
                                    </>
                                ) : (
                                    <SOSLoader message="Triangulating position..." />
                                )}
                            </motion.div>
                        )}

                        {/* Step 4: Finding Providers (Loading) */}
                        {step === 'providers' && loading && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
                            >
                                <div className="w-full max-w-sm space-y-6">
                                    <div className="text-center space-y-2 mb-8">
                                        <h3 className="font-black text-xl text-gray-900 tracking-tight">SCANNING AREA</h3>
                                        <p className="text-xs font-bold text-blue-500 uppercase tracking-[0.2em] animate-pulse">Locating Experts...</p>
                                    </div>
                                    <ProviderSkeleton />
                                    <ProviderSkeleton />
                                    <ProviderSkeleton />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Provider List */}
                        {step === 'providers' && !loading && (
                            <motion.div
                                key="providers"
                                initial="initial" animate="in" exit="out" variants={pageVariants} transition={springTransition}
                            >
                                <div className="flex items-center gap-4 mb-8">
                                    <button onClick={() => setStep('location')} className="w-10 h-10 bg-white border border-gray-100 hover:border-black rounded-full transition flex items-center justify-center text-gray-900 shadow-sm">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div>
                                        <h2 className="text-2xl font-outfit font-black text-gray-900">Nearby Experts</h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Live Results</p>
                                        </div>
                                    </div>
                                </div>

                                {providers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                            <Search size={32} className="text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">No Providers Found</h3>
                                        <p className="text-gray-500 text-sm text-center max-w-[200px] mt-2 mb-8 leading-relaxed">
                                            We couldn't connect with any providers in your area right now.
                                        </p>
                                        <button onClick={() => setStep('category')} className="px-8 py-3 bg-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition">
                                            Try Another Category
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pb-32">
                                        {providers.map((p, idx) => (
                                            <motion.div
                                                key={p.id}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1, ...springTransition }}
                                                className="bg-white p-5 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:border-blue-500 hover:shadow-[0_10px_30px_rgb(59,130,246,0.1)] transition-all group cursor-pointer relative overflow-hidden"
                                            >
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden relative shadow-inner">
                                                        {p.photoUrl ? (
                                                            <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-2xl">👨‍🔧</div>
                                                        )}
                                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-bold text-gray-900 text-lg truncate leading-tight">{p.name || 'Service Partner'}</h3>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <Shield size={12} className="text-blue-500 fill-blue-500/20" />
                                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Verified Pro</span>
                                                                </div>
                                                            </div>
                                                            <span className="flex items-center gap-1 text-[10px] font-black bg-black text-white px-2 py-1 rounded-lg shadow-sm">
                                                                4.9 <Star size={8} fill="currentColor" />
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-3 mt-4">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                                                                <MapPin size={12} className="text-red-500" />
                                                                {p.distance?.toFixed(1) || 0.5} km
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                                                                <Zap size={12} className="text-amber-500 fill-amber-500" />
                                                                Fast
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Step 6: Success */}
                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center h-[70vh] text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                                    className="w-32 h-32 bg-gradient-to-tr from-green-400 to-green-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30 relative"
                                >
                                    <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping opacity-20"></div>
                                    <CheckCircle size={64} className="text-white drop-shadow-md" />
                                </motion.div>
                                <h2 className="text-4xl font-outfit font-black text-gray-900 mb-4 tracking-tight">Request Sent!</h2>
                                <p className="text-gray-500 text-lg max-w-[260px] leading-relaxed">
                                    Hold tight! connecting you with the nearest expert.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Floating "Request Rescue" Bar */}
                <AnimatePresence>
                    {step === 'providers' && providers.length > 0 && !loading && (
                        <motion.div
                            initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
                            transition={springTransition}
                            className="fixed bottom-0 left-0 right-0 p-6 z-50 bg-gradient-to-t from-white via-white/95 to-transparent pt-10"
                        >
                            <div className="max-w-md mx-auto">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleBook}
                                    className="w-full py-5 rounded-[24px] bg-black text-white font-black text-xl shadow-2xl shadow-black/30 flex items-center justify-center gap-3 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <span className="relative z-10 flex items-center gap-2 uppercase tracking-wide">
                                        🚨 Request help
                                    </span>
                                </motion.button>
                                <p className="text-center text-[9px] text-gray-400 mt-4 font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2">
                                    <Shield size={10} /> Secure Booking • Zyvark Guarantee
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
