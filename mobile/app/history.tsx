import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { emergenciesAPI } from '../services/api';

const STATUS_COLORS: Record<string, string> = {
    pending: '#FFD93D',
    accepted: '#6ECFF6',
    arrived: '#6ECFF6',
    in_progress: '#6ECFF6',
    completed: '#2A9D8F',
    confirmed: '#2A9D8F',
    disputed: '#E63946',
    cancelled: '#8899AA',
};

export default function HistoryScreen() {
    const [emergencies, setEmergencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await emergenciesAPI.getHistory(page);
            setEmergencies(res.data.emergencies || []);
        } catch (err) {
            // show fallback
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <View className="flex-1 bg-navy-dark items-center justify-center">
                <ActivityIndicator size="large" color="#E63946" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-navy-dark">
            <FlatList
                data={emergencies}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 24 }}
                ListEmptyComponent={
                    <View className="items-center mt-20">
                        <Text className="text-4xl mb-4">🕰️</Text>
                        <Text className="text-white text-xl font-bold">No history yet</Text>
                        <Text className="text-muted text-sm mt-2">Your emergency history will appear here</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View className="bg-surface rounded-2xl p-5 mb-3">
                        <View className="flex-row justify-between items-start mb-2">
                            <View className="flex-row items-center">
                                <Text className="text-2xl mr-3">{item.category?.icon || '🚨'}</Text>
                                <View>
                                    <Text className="text-white font-bold text-base">
                                        {item.category?.name || 'Emergency'}
                                    </Text>
                                    <Text className="text-muted text-xs">{formatDate(item.createdAt)}</Text>
                                </View>
                            </View>
                            <View
                                className="px-3 py-1 rounded-full"
                                style={{ backgroundColor: `${STATUS_COLORS[item.status] || '#8899AA'}22` }}
                            >
                                <Text
                                    className="text-xs font-bold capitalize"
                                    style={{ color: STATUS_COLORS[item.status] || '#8899AA' }}
                                >
                                    {item.status}
                                </Text>
                            </View>
                        </View>
                        {item.quotedPrice && (
                            <Text className="text-success text-sm font-bold mt-1">₹{item.quotedPrice}</Text>
                        )}
                    </View>
                )}
            />
        </View>
    );
}
