import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { CheckCircle, Upload, Briefcase, DollarSign, ChevronRight, User, FileText, ArrowLeft, Loader2, Power } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
    id: string;
    name: string;
    icon: string;
    description: string;
}

type Step = 'personal' | 'documents' | 'skills' | 'rate' | 'done';
const STEPS: Step[] = ['personal', 'documents', 'skills', 'rate', 'done'];

const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_ID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export default function ProviderOnboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('personal');
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [idProof, setIdProof] = useState<File | null>(null);
    const [idProofName, setIdProofName] = useState('');
    const [idType, setIdType] = useState<'aadhaar' | 'pan'>('aadhaar');
    const [idNumber, setIdNumber] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [serviceRadius, setServiceRadius] = useState(10);
    const [minRate, setMinRate] = useState('');
    const [maxRate, setMaxRate] = useState('');
    const [experience, setExperience] = useState('');

    useEffect(() => {
        loadCategories();
        loadProfile();
    }, []);

    const loadCategories = async () => {
        setCategoriesLoading(true);
        try {
            const res = await adminAPI.getCategories();
            const cats = Array.isArray(res.data) ? res.data : [];
            setCategories(cats);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setCategoriesLoading(false);
        }
    };

    const loadProfile = async () => {
        try {
            const res = await adminAPI.getProviderProfile();
            if (res.data?.name) setName(res.data.name);
            if (res.data?.status === 'approved') {
                navigate('/provider-dashboard');
            }
        } catch { }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
                toast.error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
                e.target.value = '';
                return;
            }
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleIdProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!ALLOWED_ID_TYPES.includes(file.type)) {
                toast.error('Invalid file type. Only JPEG, PNG, WebP images and PDF files are allowed.');
                e.target.value = '';
                return;
            }
            setIdProof(file);
            setIdProofName(file.name);
        }
    };

    const validateIdNumber = (value: string): boolean => {
        if (idType === 'aadhaar') {
            return /^\d{12}$/.test(value);
        } else {
            return /^[A-Z]{5}\d{4}[A-Z]$/.test(value.toUpperCase());
        }
    };

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const canProceed = () => {
        switch (step) {
            case 'personal': return name.trim().length >= 2 && experience.length > 0;
            case 'documents': return !!photo && !!idProof && idNumber.trim().length > 0 && validateIdNumber(idNumber);
            case 'skills': return selectedCategories.length > 0;
            case 'rate': return !!minRate && !!maxRate && parseInt(minRate) > 0 && parseInt(maxRate) >= parseInt(minRate);
            default: return true;
        }
    };

    const nextStep = () => {
        const idx = STEPS.indexOf(step);
        if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
    };

    const prevStep = () => {
        const idx = STEPS.indexOf(step);
        if (idx > 0) setStep(STEPS[idx - 1]);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('categoryIds', JSON.stringify(selectedCategories));
            formData.append('serviceRadius', serviceRadius.toString());
            formData.append('idType', idType);
            formData.append('idNumber', idNumber.trim().toUpperCase());
            formData.append('minRate', minRate);
            formData.append('maxRate', maxRate);
            if (photo) formData.append('photo', photo);
            if (idProof) formData.append('idProof', idProof);

            await adminAPI.registerProvider(formData);
            setStep('done');
            toast.success('Registration successful!');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user_role');
        navigate('/');
    };

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const stepIndex = STEPS.indexOf(step);
    const progress = step === 'done' ? 100 : ((stepIndex + 1) / STEPS.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans text-gray-900 relative">
            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowLogoutConfirm(false)}>
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Power size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Back to Home?</h3>
                        <p className="text-gray-500 mb-8 font-medium">This will log you out of the provider portal.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Cancel</button>
                            <button onClick={handleLogout} className="flex-1 py-4 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition shadow-lg shadow-red-500/30">Logout</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Back to Home Button (Logs out) */}
            <button
                onClick={() => setShowLogoutConfirm(true)}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-gray-600 font-bold text-sm transition-all shadow-sm hover:shadow-md z-50 group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Home
            </button>

            <div className="w-full max-w-2xl relative z-10">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-black/20 mx-auto mb-6 transform -rotate-3">
                        🛠️
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Become a Partner</h1>
                    <p className="text-gray-500 font-medium">Join our network of expert providers</p>
                </div>

                {/* Progress Bar */}
                {step !== 'done' && (
                    <div className="mb-8">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-black rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span>Start</span>
                            <span>Finish</span>
                        </div>
                    </div>
                )}

                {/* Main Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-8 md:p-10 relative overflow-hidden border border-white/50">

                    {/* Step 1: Personal Info */}
                    {step === 'personal' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><User size={24} /></div>
                                <h2 className="text-xl font-bold text-gray-900">About You</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full h-14 px-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white outline-none font-bold text-gray-900 transition-all placeholder:font-normal"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Years of Experience</label>
                                    <input
                                        type="number"
                                        value={experience}
                                        onChange={e => setExperience(e.target.value)}
                                        placeholder="e.g. 5"
                                        min="0"
                                        className="w-full h-14 px-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white outline-none font-bold text-gray-900 transition-all placeholder:font-normal"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Documents */}
                    {step === 'documents' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><FileText size={24} /></div>
                                <h2 className="text-xl font-bold text-gray-900">Verification</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Photo Upload */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Profile Photo</label>
                                    <label className="cursor-pointer block aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-black hover:bg-gray-100 transition flex flex-col items-center justify-center group overflow-hidden relative">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                                    <User className="text-gray-400" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-400 group-hover:text-black">Upload Photo</span>
                                                <span className="text-[10px] text-gray-300 mt-1">JPEG, PNG, WebP</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
                                    </label>
                                </div>

                                {/* ID Proof Upload */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Government ID Photo</label>
                                    <label className="cursor-pointer block aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-black hover:bg-gray-100 transition flex flex-col items-center justify-center group">
                                        {idProofName ? (
                                            <div className="text-center p-4">
                                                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                                <p className="text-xs font-bold text-gray-900 break-all">{idProofName}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                                    <Upload className="text-gray-400" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-400 group-hover:text-black">Upload ID</span>
                                                <span className="text-[10px] text-gray-300 mt-1">JPEG, PNG, WebP, PDF</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleIdProofChange} className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {/* ID Type Selection */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">ID Type</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setIdType('aadhaar'); setIdNumber(''); }}
                                        className={`flex-1 py-3.5 rounded-xl border-2 font-bold text-sm transition-all ${idType === 'aadhaar'
                                            ? 'border-black bg-black text-white shadow-lg'
                                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        🆔 Aadhaar Card
                                    </button>
                                    <button
                                        onClick={() => { setIdType('pan'); setIdNumber(''); }}
                                        className={`flex-1 py-3.5 rounded-xl border-2 font-bold text-sm transition-all ${idType === 'pan'
                                            ? 'border-black bg-black text-white shadow-lg'
                                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        💳 PAN Card
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        {idType === 'aadhaar' ? 'Aadhaar Number (12 digits)' : 'PAN Number (e.g. ABCDE1234F)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={idNumber}
                                        onChange={e => setIdNumber(e.target.value)}
                                        placeholder={idType === 'aadhaar' ? '1234 5678 9012' : 'ABCDE1234F'}
                                        maxLength={idType === 'aadhaar' ? 12 : 10}
                                        className="w-full h-14 px-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white outline-none font-bold text-gray-900 transition-all placeholder:font-normal tracking-wider"
                                    />
                                    {idNumber.length > 0 && !validateIdNumber(idNumber) && (
                                        <p className="text-red-500 text-xs mt-2 font-medium">
                                            {idType === 'aadhaar'
                                                ? 'Aadhaar must be exactly 12 digits'
                                                : 'PAN must be 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Skills */}
                    {step === 'skills' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Briefcase size={24} /></div>
                                <h2 className="text-xl font-bold text-gray-900">Your Expertise</h2>
                            </div>

                            {categoriesLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-gray-400" size={32} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {categories.map(cat => {
                                        const isSelected = selectedCategories.includes(cat.id);
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => toggleCategory(cat.id)}
                                                className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${isSelected
                                                    ? 'border-black bg-black text-white shadow-lg'
                                                    : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="text-2xl">{cat.icon}</span>
                                                <span className="font-bold text-sm">{cat.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                                    <span>Service Radius</span>
                                    <span className="text-black">{serviceRadius} km</span>
                                </label>
                                <input
                                    type="range"
                                    min="2"
                                    max="50"
                                    value={serviceRadius}
                                    onChange={e => setServiceRadius(parseInt(e.target.value))}
                                    className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Rate (Min-Max Range) */}
                    {step === 'rate' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign size={24} /></div>
                                <h2 className="text-xl font-bold text-gray-900">Set Your Pricing Range</h2>
                            </div>

                            <p className="text-gray-500 text-sm -mt-4">
                                Set a minimum and maximum price range for your services. Customers will see this range when matched with you.
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Minimum (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">₹</span>
                                        <input
                                            type="number"
                                            value={minRate}
                                            onChange={e => setMinRate(e.target.value)}
                                            placeholder="300"
                                            className="w-full h-16 pl-10 pr-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white outline-none font-black text-2xl text-gray-900 transition-all placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Maximum (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">₹</span>
                                        <input
                                            type="number"
                                            value={maxRate}
                                            onChange={e => setMaxRate(e.target.value)}
                                            placeholder="800"
                                            className="w-full h-16 pl-10 pr-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white outline-none font-black text-2xl text-gray-900 transition-all placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {minRate && maxRate && parseInt(maxRate) >= parseInt(minRate) && parseInt(minRate) > 0 && (
                                <div className="bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-500">Your price range</span>
                                        <span className="font-bold text-gray-900">₹{parseInt(minRate).toLocaleString()} – ₹{parseInt(maxRate).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-500">Platform fee (10%)</span>
                                        <span className="font-bold text-orange-500">Applied on final price</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <p className="text-xs text-gray-500 leading-5">
                                            💡 Customers will see: <span className="font-bold text-gray-900">"₹{parseInt(minRate).toLocaleString()} – ₹{parseInt(maxRate).toLocaleString()}"</span>. The final price is decided after the job and 10% platform fee is applied on top.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {minRate && maxRate && parseInt(maxRate) < parseInt(minRate) && (
                                <p className="text-red-500 text-xs font-medium">Maximum rate must be greater than or equal to minimum rate.</p>
                            )}
                        </div>
                    )}

                    {/* Step 5: Done */}
                    {step === 'done' && (
                        <div className="text-center py-12 animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4">You're All Set!</h2>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
                                Your profile is under review. We'll verify your details and activate your account within 24 hours.
                            </p>

                            <button
                                onClick={() => navigate('/provider-dashboard')}
                                className="w-full h-14 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-black/20"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {step !== 'done' && (
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                            {stepIndex > 0 ? (
                                <button
                                    onClick={prevStep}
                                    className="px-6 py-3 rounded-xl hover:bg-gray-50 text-gray-500 font-bold text-sm transition flex items-center gap-2"
                                >
                                    <ArrowLeft size={16} /> Back
                                </button>
                            ) : <div />}

                            <button
                                onClick={step === 'rate' ? handleSubmit : nextStep}
                                disabled={!canProceed() || loading}
                                className="px-8 py-3 rounded-xl bg-black text-white font-bold text-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg shadow-black/10"
                            >
                                {loading && step === 'rate' ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        {step === 'rate' ? 'Submit' : 'Next'} <ChevronRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
