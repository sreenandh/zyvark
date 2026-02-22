import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../services/store';
import '../global.css';

export default function RootLayout() {
    const { isLoading, loadAuth, isAuthenticated } = useAuthStore();

    useEffect(() => {
        loadAuth();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1923' }}>
                <ActivityIndicator size="large" color="#E63946" />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#0F1923' },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: { fontWeight: 'bold' },
                    contentStyle: { backgroundColor: '#0F1923' },
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="home" options={{ headerShown: false }} />
                <Stack.Screen name="emergency" options={{ title: 'Emergency', headerBackTitle: 'Back' }} />
                <Stack.Screen name="tracking" options={{ title: 'Tracking Provider' }} />
                <Stack.Screen name="confirmation" options={{ title: 'Confirm Resolution' }} />
                <Stack.Screen name="history" options={{ title: 'Emergency History' }} />
                <Stack.Screen name="profile" options={{ title: 'Profile & Settings' }} />
            </Stack>
        </>
    );
}
