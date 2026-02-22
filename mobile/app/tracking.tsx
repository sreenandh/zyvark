import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useEmergencyStore } from '../services/store';

const STATUSES = [
    { key: 'accepted', label: 'Accepted', icon: '✅', description: 'Provider accepted your request' },
    { key: 'on_way', label: 'On the way', icon: '🚗', description: 'Provider is heading to you' },
    { key: 'arrived', label: 'Arrived', icon: '📍', description: 'Provider has arrived' },
    { key: 'in_progress', label: 'Working', icon: '🔧', description: 'Fixing the issue' },
    { key: 'completed', label: 'Completed', icon: '🎉', description: 'Work is done' },
];

export default function TrackingScreen() {
    const router = useRouter();
    const { activeEmergency } = useEmergencyStore();
    const [currentStatus, setCurrentStatus] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const dotAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        // Pulsing dot for current status
        Animated.loop(
            Animated.sequence([
                Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(dotAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
            ]),
        ).start();

        // Simulate status progression (in production, via WebSocket)
        const intervals = [5000, 8000, 12000, 15000];
        intervals.forEach((ms, idx) => {
            setTimeout(() => {
                setCurrentStatus((prev) => Math.min(prev + 1, STATUSES.length - 1));
            }, ms);
        });
    }, []);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: currentStatus / (STATUSES.length - 1),
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [currentStatus]);

    const provider = {
        name: 'Rajesh Kumar',
        phone: '9876543210',
        rating: 4.8,
        eta: currentStatus < 2 ? '5 min' : 'Arrived',
    };

    return (
        <View className="flex-1 bg-navy-dark px-6 pt-6">
            {/* Provider Card */}
            <View className="bg-surface rounded-2xl p-5 mb-6">
                <View className="flex-row items-center mb-4">
                    <View className="w-14 h-14 rounded-full bg-navy-dark items-center justify-center mr-4">
                        <Text className="text-2xl">👷</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-lg font-bold">{provider.name}</Text>
                        <Text className="text-muted text-sm">⭐ {provider.rating} · ETA: {provider.eta}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:${provider.phone}`)}
                        className="bg-success rounded-full w-12 h-12 items-center justify-center"
                    >
                        <Text className="text-xl">📞</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Status Timeline */}
            <Text className="text-white text-lg font-bold mb-4">Live Status</Text>
            <View className="bg-surface rounded-2xl p-5">
                {STATUSES.map((status, idx) => (
                    <View key={status.key} className="flex-row mb-1">
                        {/* Timeline dots and line */}
                        <View className="items-center mr-4" style={{ width: 24 }}>
                            {idx <= currentStatus ? (
                                <Animated.View
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        backgroundColor: idx === currentStatus ? '#E63946' : '#2A9D8F',
                                        opacity: idx === currentStatus ? dotAnim : 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text className="text-xs">{idx < currentStatus ? '✓' : '●'}</Text>
                                </Animated.View>
                            ) : (
                                <View className="w-6 h-6 rounded-full bg-navy-dark border-2 border-muted" />
                            )}
                            {idx < STATUSES.length - 1 && (
                                <View
                                    className={`w-0.5 h-10 ${idx < currentStatus ? 'bg-success' : 'bg-muted/30'}`}
                                />
                            )}
                        </View>
                        {/* Status content */}
                        <View className="flex-1 pb-5">
                            <Text className={`font-semibold ${idx <= currentStatus ? 'text-white' : 'text-muted'}`}>
                                {status.icon} {status.label}
                            </Text>
                            <Text className="text-muted text-xs mt-1">{status.description}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Action button after completion */}
            {currentStatus >= STATUSES.length - 1 && (
                <TouchableOpacity
                    onPress={() => router.push('/confirmation')}
                    className="bg-emergency rounded-2xl py-5 items-center mt-6"
                    activeOpacity={0.8}
                >
                    <Text className="text-white text-lg font-bold">Confirm Resolution ✓</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
