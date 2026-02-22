import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Percent, Save, RotateCcw, Info, DollarSign, Bell, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

interface AppSettings {
    platformFeePercent: number;
    providerSearchRadiusKm: number;
    searchTimeoutSeconds: number;
    maxPhotosPerEmergency: number;
    autoApproveProviders: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
    platformFeePercent: 10,
    providerSearchRadiusKm: 15,
    searchTimeoutSeconds: 15,
    maxPhotosPerEmergency: 3,
    autoApproveProviders: false,
};

const STORAGE_KEY = 'zyvark_app_settings';

export default function Settings() {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [hasChanges, setHasChanges] = useState(false);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getSettings();
            if (res.data) {
                // Ensure defaults are preserved if API returns partial data
                setSettings({ ...DEFAULT_SETTINGS, ...res.data });
            }
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const saveSettings = async () => {
        const toastId = toast.loading('Saving changes...');
        try {
            await adminAPI.updateSettings(settings);
            setHasChanges(false);
            toast.success('Settings saved to database ✓', { id: toastId });
        } catch (error) {
            toast.error('Failed to save settings', { id: toastId });
        }
    };

    const resetDefaults = () => {
        if (confirm('Are you sure? This will reset local changes (not database).')) {
            setSettings(DEFAULT_SETTINGS);
            setHasChanges(true);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
                    <p className="text-gray-500 font-medium">Configure platform parameters & app behavior</p>
                </div>
                <div className="flex gap-3 self-start">
                    <button
                        onClick={resetDefaults}
                        className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition flex items-center gap-2"
                    >
                        <RotateCcw size={16} /> Reset Defaults
                    </button>
                    <button
                        onClick={saveSettings}
                        disabled={!hasChanges}
                        className="px-6 py-2.5 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-lg shadow-black/10"
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>

            <div className="grid gap-6">

                {/* Pricing & Fees */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign size={24} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Pricing & Fees</h2>
                            <p className="text-sm text-gray-500">Control platform revenue and pricing</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Platform Fee */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <Percent size={18} className="text-gray-500" />
                                    <div>
                                        <label className="text-sm font-bold text-gray-900">Platform Fee</label>
                                        <p className="text-xs text-gray-400">Percentage charged on each completed job</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-black text-gray-900">{settings.platformFeePercent}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="30"
                                step="1"
                                value={settings.platformFeePercent}
                                onChange={e => updateSetting('platformFeePercent', parseInt(e.target.value))}
                                className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase">
                                <span>0%</span>
                                <span>15%</span>
                                <span>30%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Matching */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Bell size={24} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Search & Matching</h2>
                            <p className="text-sm text-gray-500">Configure provider discovery settings</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Search Radius */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-bold text-gray-900">Search Radius</label>
                                <span className="text-lg font-black text-gray-900">{settings.providerSearchRadiusKm} km</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="50"
                                step="5"
                                value={settings.providerSearchRadiusKm}
                                onChange={e => updateSetting('providerSearchRadiusKm', parseInt(e.target.value))}
                                className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Search Timeout */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-bold text-gray-900">Search Timeout</label>
                                <span className="text-lg font-black text-gray-900">{settings.searchTimeoutSeconds}s</span>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="60"
                                step="5"
                                value={settings.searchTimeoutSeconds}
                                onChange={e => updateSetting('searchTimeoutSeconds', parseInt(e.target.value))}
                                className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Operational */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Shield size={24} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Operational</h2>
                            <p className="text-sm text-gray-500">General platform behavior</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Max Photos */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-bold text-gray-900">Max Photos per Emergency</label>
                                <span className="text-lg font-black text-gray-900">{settings.maxPhotosPerEmergency}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={settings.maxPhotosPerEmergency}
                                onChange={e => updateSetting('maxPhotosPerEmergency', parseInt(e.target.value))}
                                className="w-full accent-black h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Auto Approve Toggle */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-bold text-gray-900">Auto-Approve Providers</label>
                                    <p className="text-xs text-gray-400 mt-1">Skip manual verification step</p>
                                </div>
                                <button
                                    onClick={() => updateSetting('autoApproveProviders', !settings.autoApproveProviders)}
                                    className={`w-14 h-8 rounded-full transition-all duration-300 relative ${settings.autoApproveProviders ? 'bg-green-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-1 transition-all duration-300 ${settings.autoApproveProviders ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Note */}
                <div className="bg-yellow-50 rounded-2xl p-5 flex items-start gap-3 border border-yellow-100">
                    <Info size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-yellow-800">Settings are stored locally</p>
                        <p className="text-xs text-yellow-600 mt-1">These settings are currently saved in your browser. For production, connect to a backend API for persistent configuration.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
