import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, Animated, Easing, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuthStore, useEmergencyStore } from '../services/store';
import { categoriesAPI } from '../services/api';

const CATEGORIES = [
    { id: 'electricity', name: 'Electricity', icon: '⚡', color: '#FFD93D' },
    { id: 'water', name: 'Water', icon: '💧', color: '#6ECFF6' },
    { id: 'vehicle', name: 'Vehicle', icon: '🚗', color: '#FF6B6B' },
    { id: 'appliance', name: 'Appliance', icon: '❄️', color: '#A8E6CF' },
];

export default function HomeScreen() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { setSelectedCategory, setLocation } = useEmergencyStore();
    const [categories, setCategories] = useState(CATEGORIES);
    const [recentEmergencies, setRecentEmergencies] = useState([]);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        // Pulsing animation for emergency button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.08, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]),
        ).start();

        // Glow animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 0.8, duration: 1500, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, useNativeDriver: true }),
            ]),
        ).start();

        // Fetch categories from API
        loadCategories();
        requestLocation();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await categoriesAPI.getAll();
            if (res.data?.length > 0) {
                setCategories(res.data.map((c: any, i: number) => ({
                    ...c,
                    color: CATEGORIES[i]?.color || '#E63946',
                })));
            }
        } catch (err) {
            // Use fallback categories
        }
    };

    const requestLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({});
            setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
    };

    const handleEmergency = (category?: any) => {
        if (category) {
            setSelectedCategory(category);
        }
        router.push('/emergency');
    };

    return (
        <View className="flex-1 bg-navy-dark">
            {/* Header */}
            <View className="px-6 pt-16 pb-4 flex-row justify-between items-center">
                <View>
                    <Text className="text-muted text-sm">Hello,</Text>
                    <Text className="text-white text-xl font-bold">{user?.name || 'Welcome'} 👋</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/profile')}
                    className="bg-surface w-10 h-10 rounded-full items-center justify-center"
                >
                    <Text className="text-white text-lg">👤</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Emergency Button */}
                <View className="items-center mt-8 mb-10">
                    <Animated.View
                        style={{
                            transform: [{ scale: pulseAnim }],
                            position: 'absolute',
                            width: 200,
                            height: 200,
                            borderRadius: 100,
                            backgroundColor: '#E63946',
                            opacity: glowAnim,
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => handleEmergency()}
                        activeOpacity={0.85}
                        className="w-44 h-44 rounded-full bg-emergency items-center justify-center"
                        style={{
                            shadowColor: '#E63946',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.6,
                            shadowRadius: 30,
                            elevation: 20,
                        }}
                    >
                        <Text className="text-4xl mb-1">🚨</Text>
                        <Text className="text-white text-xl font-bold">EMERGENCY</Text>
                        <Text className="text-white/70 text-xs mt-1">Tap for help</Text>
                    </TouchableOpacity>
                </View>

                {/* Category Cards */}
                <View className="px-6">
                    <Text className="text-white text-lg font-bold mb-4">What's the emergency?</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {categories.map((cat, idx) => (
                            <TouchableOpacity
                                key={cat.id || idx}
                                onPress={() => handleEmergency(cat)}
                                activeOpacity={0.7}
                                className="bg-surface rounded-2xl p-5 mb-4 items-center"
                                style={{ width: '48%' }}
                            >
                                <View
                                    className="w-14 h-14 rounded-full items-center justify-center mb-3"
                                    style={{ backgroundColor: `${cat.color}22` }}
                                >
                                    <Text className="text-3xl">{cat.icon}</Text>
                                </View>
                                <Text className="text-white font-semibold text-center">{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Emergencies */}
                <View className="px-6 mt-4 mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-lg font-bold">Recent</Text>
                        <TouchableOpacity onPress={() => router.push('/history')}>
                            <Text className="text-emergency text-sm">View All</Text>
                        </TouchableOpacity>
                    </View>
                    {recentEmergencies.length === 0 ? (
                        <View className="bg-surface rounded-2xl p-6 items-center">
                            <Text className="text-3xl mb-2">🛡️</Text>
                            <Text className="text-muted text-sm">No emergencies yet</Text>
                            <Text className="text-muted text-xs mt-1">We hope you never need us!</Text>
                        </View>
                    ) : null}
                </View>

                {/* Bottom spacing */}
                <View className="h-6" />
            </ScrollView>
        </View>
    );
}
