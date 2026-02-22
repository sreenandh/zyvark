import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../services/store';
import { authAPI } from '../services/api';

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const handleSendOtp = async () => {
        if (phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }
        setLoading(true);
        try {
            const res = await authAPI.sendOtp(phone);
            // In dev mode, auto-fill OTP
            // if (res.data.otp) setOtp(res.data.otp);
            setStep('otp');
            Alert.alert('OTP Sent', `OTP sent to +91 ${phone}`);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter the 6-digit OTP');
            return;
        }
        setLoading(true);
        try {
            const res = await authAPI.verifyOtp(phone, otp);
            await setAuth(res.data.user, res.data.accessToken);
            router.replace('/home');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-navy-dark"
        >
            <View className="flex-1 justify-center px-8">
                {/* Header */}
                <View className="items-center mb-12">
                    <Image
                        source={require('../assets/images/zyvark-logo.png')}
                        style={{ width: 80, height: 80, marginBottom: 16 }}
                        resizeMode="contain"
                    />
                    <Text className="text-white text-4xl font-bold">Zyvark</Text>
                    <Text className="text-muted text-base mt-2">Emergency help in one tap</Text>
                </View>

                {step === 'phone' ? (
                    <View>
                        <Text className="text-white text-lg mb-3 font-semibold">Enter your phone number</Text>
                        <View className="flex-row items-center bg-surface rounded-2xl px-4 py-1 mb-6">
                            <Text className="text-white text-lg mr-2">+91</Text>
                            <TextInput
                                className="flex-1 text-white text-lg py-4"
                                placeholder="9876543210"
                                placeholderTextColor="#8899AA"
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>
                        <TouchableOpacity
                            className={`rounded-2xl py-5 items-center ${loading ? 'bg-emergency/50' : 'bg-emergency'}`}
                            onPress={handleSendOtp}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text className="text-white text-lg font-bold">
                                {loading ? 'Sending OTP...' : 'Get OTP'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <Text className="text-white text-lg mb-1 font-semibold">Enter OTP</Text>
                        <Text className="text-muted text-sm mb-4">Sent to +91 {phone}</Text>
                        <TextInput
                            className="bg-surface text-white text-center text-2xl tracking-[12px] rounded-2xl px-4 py-5 mb-6"
                            placeholder="000000"
                            placeholderTextColor="#8899AA"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                        />
                        <TouchableOpacity
                            className={`rounded-2xl py-5 items-center ${loading ? 'bg-emergency/50' : 'bg-emergency'}`}
                            onPress={handleVerifyOtp}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text className="text-white text-lg font-bold">
                                {loading ? 'Verifying...' : 'Verify & Continue'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="mt-4 items-center" onPress={() => setStep('phone')}>
                            <Text className="text-muted text-sm">Change phone number</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View className="items-center mt-10">
                    <Text className="text-muted/50 text-xs">a auxstel product</Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
