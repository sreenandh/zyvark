import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../services/store';

export default function Index() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isAuthenticated) {
                router.replace('/home');
            } else {
                router.replace('/login');
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [isAuthenticated]);

    return (
        <View className="flex-1 bg-navy-dark justify-center items-center">
            <Image
                source={require('../assets/images/zyvark-logo.png')}
                style={{ width: 120, height: 120, marginBottom: 16 }}
                resizeMode="contain"
            />
            <Text className="text-white text-3xl font-bold">Zyvark</Text>
            <Text className="text-muted text-base mt-2">One-tap emergency help</Text>

            <View className="absolute bottom-8 items-center">
                <Text className="text-muted/50 text-xs">a auxstel product</Text>
            </View>
        </View>
    );
}
