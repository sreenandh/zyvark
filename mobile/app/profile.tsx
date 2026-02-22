import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../services/store';
import { usersAPI } from '../services/api';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout, setAuth } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [saving, setSaving] = useState(false);

    const saveProfile = async () => {
        setSaving(true);
        try {
            const res = await usersAPI.updateProfile({ name });
            if (user) {
                await setAuth({ ...user, name }, (await import('expo-secure-store')).default ? '' : '');
            }
            Alert.alert('Saved', 'Profile updated');
        } catch (err) {
            Alert.alert('Error', 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive', onPress: async () => {
                    await logout();
                    router.replace('/login');
                }
            },
        ]);
    };

    return (
        <ScrollView className="flex-1 bg-navy-dark px-6 pt-6">
            {/* Avatar */}
            <View className="items-center mb-8">
                <View className="w-24 h-24 rounded-full bg-surface items-center justify-center mb-3">
                    <Text className="text-4xl">👤</Text>
                </View>
                <Text className="text-white text-xl font-bold">{user?.name || 'Set your name'}</Text>
                <Text className="text-muted text-sm">+91 {user?.phone}</Text>
            </View>

            {/* Name */}
            <View className="mb-6">
                <Text className="text-muted text-sm mb-2">Full Name</Text>
                <TextInput
                    className="bg-surface text-white rounded-2xl px-4 py-4 text-base"
                    placeholder="Enter your name"
                    placeholderTextColor="#8899AA"
                    value={name}
                    onChangeText={setName}
                />
            </View>

            <TouchableOpacity
                onPress={saveProfile}
                className={`bg-success rounded-2xl py-4 items-center mb-8 ${saving ? 'opacity-50' : ''}`}
                disabled={saving}
            >
                <Text className="text-white text-base font-bold">{saving ? 'Saving...' : 'Save Profile'}</Text>
            </TouchableOpacity>

            {/* Menu Items */}
            <View className="bg-surface rounded-2xl overflow-hidden mb-6">
                {[
                    { label: 'Emergency History', icon: '📋', onPress: () => router.push('/history') },
                    { label: 'Saved Addresses', icon: '📍', onPress: () => { } },
                    { label: 'Payment Methods', icon: '💳', onPress: () => { } },
                    { label: 'Help & Support', icon: '💬', onPress: () => { } },
                    { label: 'About Zyvark', icon: 'ℹ️', onPress: () => { } },
                ].map((item, idx) => (
                    <TouchableOpacity
                        key={idx}
                        onPress={item.onPress}
                        className="flex-row items-center px-5 py-4 border-b border-navy-dark/50"
                    >
                        <Text className="text-xl mr-4">{item.icon}</Text>
                        <Text className="text-white flex-1">{item.label}</Text>
                        <Text className="text-muted">→</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout */}
            <TouchableOpacity
                onPress={handleLogout}
                className="bg-emergency/20 rounded-2xl py-4 items-center mb-10"
            >
                <Text className="text-emergency font-bold">Logout</Text>
            </TouchableOpacity>

            <View className="items-center pb-8">
                <Text className="text-muted/50 text-xs">a auxstel product</Text>
            </View>
        </ScrollView>
    );
}
