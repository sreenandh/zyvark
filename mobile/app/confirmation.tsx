import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEmergencyStore } from '../services/store';
import { emergenciesAPI, reviewsAPI } from '../services/api';

export default function ConfirmationScreen() {
    const router = useRouter();
    const { activeEmergency, clearEmergency } = useEmergencyStore();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [resolved, setResolved] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            if (activeEmergency?.id) {
                await emergenciesAPI.confirm(activeEmergency.id);
                await reviewsAPI.create({
                    emergencyId: activeEmergency.id,
                    providerId: activeEmergency.providerId || '',
                    rating,
                    comment,
                });
            }
            clearEmergency();
            Alert.alert('Thank you! 🎉', 'Issue resolved. Payment released to provider.');
            router.replace('/home');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to confirm');
        } finally {
            setLoading(false);
        }
    };

    const handleDispute = async () => {
        setLoading(true);
        try {
            if (activeEmergency?.id) {
                const formData = new FormData();
                formData.append('reason', comment || 'Issue not resolved');
                await emergenciesAPI.dispute(activeEmergency.id, formData);
            }
            clearEmergency();
            Alert.alert('Dispute Raised', 'Our team will review and get back within 24 hours.');
            router.replace('/home');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to submit dispute');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-navy-dark px-6 pt-6">
            <Text className="text-white text-2xl font-bold mb-2">Was the issue resolved?</Text>
            <Text className="text-muted text-sm mb-8">Your feedback helps us improve</Text>

            {/* Resolution Choice */}
            <View className="flex-row gap-4 mb-8">
                <TouchableOpacity
                    onPress={() => setResolved(true)}
                    className={`flex-1 py-6 rounded-2xl items-center ${resolved === true ? 'bg-success' : 'bg-surface'}`}
                >
                    <Text className="text-3xl mb-2">✅</Text>
                    <Text className="text-white font-bold">Yes, Resolved</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setResolved(false)}
                    className={`flex-1 py-6 rounded-2xl items-center ${resolved === false ? 'bg-emergency' : 'bg-surface'}`}
                >
                    <Text className="text-3xl mb-2">❌</Text>
                    <Text className="text-white font-bold">Not Resolved</Text>
                </TouchableOpacity>
            </View>

            {/* Rating (for resolved) */}
            {resolved === true && (
                <View className="mb-6">
                    <Text className="text-white text-lg font-bold mb-3">Rate the provider</Text>
                    <View className="flex-row justify-center gap-3 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Text className="text-3xl">{star <= rating ? '⭐' : '☆'}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput
                        className="bg-surface text-white rounded-2xl px-4 py-4 text-base"
                        placeholder="Leave a comment (optional)"
                        placeholderTextColor="#8899AA"
                        multiline
                        numberOfLines={3}
                        value={comment}
                        onChangeText={setComment}
                    />
                </View>
            )}

            {/* Dispute reason */}
            {resolved === false && (
                <View className="mb-6">
                    <Text className="text-white text-lg font-bold mb-3">Tell us what happened</Text>
                    <TextInput
                        className="bg-surface text-white rounded-2xl px-4 py-4 text-base"
                        placeholder="Describe the issue..."
                        placeholderTextColor="#8899AA"
                        multiline
                        numberOfLines={4}
                        value={comment}
                        onChangeText={setComment}
                    />
                </View>
            )}

            {/* Action Button */}
            {resolved !== null && (
                <TouchableOpacity
                    onPress={resolved ? handleConfirm : handleDispute}
                    className={`rounded-2xl py-5 items-center ${loading ? 'opacity-50' : ''} ${resolved ? 'bg-success' : 'bg-emergency'}`}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text className="text-white text-lg font-bold">
                        {loading ? 'Submitting...' : resolved ? 'Confirm & Pay' : 'Raise Dispute'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
