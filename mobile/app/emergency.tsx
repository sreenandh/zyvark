import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, TextInput, Alert,
    Animated, Easing, ActivityIndicator, ToastAndroid, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useEmergencyStore } from '../services/store';
import { emergenciesAPI, categoriesAPI } from '../services/api';

const STEPS = ['category', 'location', 'questions', 'searching', 'matched'];
const SEARCH_TIMEOUT_MS = 15000; // 15 seconds search window

const showToast = (message: string) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
        Alert.alert('Info', message);
    }
};

export default function EmergencyScreen() {
    const router = useRouter();
    const { selectedCategory, setSelectedCategory, setActiveEmergency, location, setLocation } = useEmergencyStore();
    const [step, setStep] = useState(selectedCategory ? 'location' : 'category');
    const [categories, setCategories] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});
    const [photos, setPhotos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [matchedProvider, setMatchedProvider] = useState<any>(null);
    const [searchElapsed, setSearchElapsed] = useState(0);
    const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
    const [manualAddress, setManualAddress] = useState('');
    const radarAnim = useRef(new Animated.Value(0)).current;
    const searchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        loadCategories();
        getLocation();
        return () => {
            if (searchTimerRef.current) clearInterval(searchTimerRef.current);
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, []);

    const loadCategories = async () => {
        try {
            const res = await categoriesAPI.getAll();
            if (res.data?.length) setCategories(res.data);
        } catch (err) {
            setCategories([
                {
                    id: '1', name: 'Electricity', icon: '⚡', smartQuestions: [
                        { question: 'Is there sparking or burning smell?', type: 'yes_no' },
                        { question: 'One room or entire house?', type: 'single_choice', options: ['One Room', 'Entire House'] },
                    ]
                },
                {
                    id: '2', name: 'Water / Plumbing', icon: '💧', smartQuestions: [
                        { question: 'Is there active water leaking?', type: 'yes_no' },
                        { question: 'What type?', type: 'single_choice', options: ['Pipe Leak', 'Blocked Drain', 'No Water', 'Tap Issue'] },
                    ]
                },
                {
                    id: '3', name: 'Vehicle', icon: '🚗', smartQuestions: [
                        { question: 'Vehicle type?', type: 'single_choice', options: ['Two Wheeler', 'Car', 'SUV'] },
                        { question: 'What\'s the issue?', type: 'single_choice', options: ['Flat Tyre', 'Battery Dead', 'Won\'t Start'] },
                    ]
                },
                {
                    id: '4', name: 'Appliance', icon: '❄️', smartQuestions: [
                        { question: 'Which appliance?', type: 'single_choice', options: ['AC', 'Fridge', 'Washing Machine', 'Geyser'] },
                        { question: 'Under warranty?', type: 'yes_no' },
                    ]
                },
            ]);
        }
    };

    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
    };

    const pickPhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsMultipleSelection: true,
            selectionLimit: 3,
        });
        if (!result.canceled) {
            setPhotos([...photos, ...result.assets]);
        }
    };

    const cancelSearch = () => {
        if (searchTimerRef.current) clearInterval(searchTimerRef.current);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        setSearchElapsed(0);
        setStep('questions');
    };

    const startSearching = () => {
        setStep('searching');
        setSearchElapsed(0);

        // Radar animation
        Animated.loop(
            Animated.timing(radarAnim, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ).start();

        // Elapsed time counter
        searchTimerRef.current = setInterval(() => {
            setSearchElapsed(prev => prev + 1);
        }, 1000);

        submitEmergency();
    };

    const submitEmergency = async () => {
        setLoading(true);
        try {
            // Merge "Other" custom text into answers
            const finalAnswers = { ...answers };
            Object.keys(otherTexts).forEach(key => {
                if (finalAnswers[key] === 'Other' && otherTexts[key]) {
                    finalAnswers[key] = `Other: ${otherTexts[key]}`;
                }
            });

            const formData = new FormData();
            formData.append('categoryId', selectedCategory?.id);
            formData.append('latitude', String(location?.latitude || 0));
            formData.append('longitude', String(location?.longitude || 0));
            formData.append('questionnaireAnswers', JSON.stringify(finalAnswers));

            if (locationMode === 'manual' && manualAddress.trim()) {
                formData.append('addressText', manualAddress.trim());
            }

            photos.forEach((photo, idx) => {
                formData.append('photos', {
                    uri: photo.uri,
                    type: 'image/jpeg',
                    name: `photo_${idx}.jpg`,
                } as any);
            });

            const res = await emergenciesAPI.create(formData);
            setActiveEmergency(res.data.emergency);

            // Check if providers were found
            if (res.data.nearbyProviders === 0) {
                if (searchTimerRef.current) clearInterval(searchTimerRef.current);
                showToast('No providers found in your area');
                setStep('questions');
                return;
            }

            // Simulate provider match after search timeout (in production, this comes via WebSocket)
            searchTimeoutRef.current = setTimeout(() => {
                if (searchTimerRef.current) clearInterval(searchTimerRef.current);
                setMatchedProvider({
                    name: 'Rajesh Kumar',
                    rating: 4.8,
                    distance: '2.3 km',
                    eta: '8 min',
                    minPrice: 300,
                    maxPrice: 800,
                });
                setStep('matched');
            }, SEARCH_TIMEOUT_MS);
        } catch (err: any) {
            if (searchTimerRef.current) clearInterval(searchTimerRef.current);
            Alert.alert('Error', err.response?.data?.message || 'Failed to submit emergency');
            setStep('questions');
        } finally {
            setLoading(false);
        }
    };

    // STEP 1: Category Selection
    if (step === 'category') {
        return (
            <View className="flex-1 bg-navy-dark px-6 pt-6">
                <Text className="text-white text-2xl font-bold mb-2">What's the emergency?</Text>
                <Text className="text-muted text-sm mb-6">Select the type of problem</Text>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        onPress={() => { setSelectedCategory(cat); setStep('location'); }}
                        className="bg-surface rounded-2xl p-5 mb-3 flex-row items-center"
                        activeOpacity={0.7}
                    >
                        <Text className="text-3xl mr-4">{cat.icon}</Text>
                        <View className="flex-1">
                            <Text className="text-white text-lg font-semibold">{cat.name}</Text>
                            <Text className="text-muted text-xs mt-1">{cat.description || 'Tap to select'}</Text>
                        </View>
                        <Text className="text-muted text-xl">→</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    }

    // STEP 2: Location Confirmation
    if (step === 'location') {
        return (
            <View className="flex-1 bg-navy-dark px-6 pt-6">
                <Text className="text-white text-2xl font-bold mb-2">Confirm your location</Text>
                <Text className="text-muted text-sm mb-6">We'll send help to this location</Text>

                {/* Location Mode Toggle */}
                <View className="flex-row bg-surface rounded-xl p-1 mb-6">
                    <TouchableOpacity
                        onPress={() => setLocationMode('auto')}
                        className={`flex-1 py-3 rounded-lg items-center ${locationMode === 'auto' ? 'bg-emergency' : ''}`}
                    >
                        <Text className={`font-semibold ${locationMode === 'auto' ? 'text-white' : 'text-muted'}`}>
                            📍 Current Location
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setLocationMode('manual')}
                        className={`flex-1 py-3 rounded-lg items-center ${locationMode === 'manual' ? 'bg-emergency' : ''}`}
                    >
                        <Text className={`font-semibold ${locationMode === 'manual' ? 'text-white' : 'text-muted'}`}>
                            ✏️ Enter Manually
                        </Text>
                    </TouchableOpacity>
                </View>

                {locationMode === 'auto' ? (
                    <View className="bg-surface rounded-2xl p-6 mb-6 items-center">
                        <Text className="text-4xl mb-3">📍</Text>
                        {location ? (
                            <>
                                <Text className="text-white text-lg font-semibold">Location detected</Text>
                                <Text className="text-muted text-xs mt-1">
                                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                </Text>
                            </>
                        ) : (
                            <>
                                <ActivityIndicator color="#E63946" className="mb-2" />
                                <Text className="text-muted text-sm">Getting your location...</Text>
                            </>
                        )}
                    </View>
                ) : (
                    <View className="bg-surface rounded-2xl p-6 mb-6">
                        <Text className="text-white text-base font-semibold mb-3">Enter your address</Text>
                        <TextInput
                            className="bg-navy-dark text-white rounded-xl px-4 py-4 text-base"
                            placeholder="e.g. 42, MG Road, Bangalore"
                            placeholderTextColor="#8899AA"
                            value={manualAddress}
                            onChangeText={setManualAddress}
                            multiline
                            numberOfLines={3}
                        />
                        <Text className="text-muted text-xs mt-2">
                            Please provide a detailed address including landmarks
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    onPress={() => setStep('questions')}
                    disabled={locationMode === 'auto' ? !location : !manualAddress.trim()}
                    className={`rounded-2xl py-5 items-center ${(locationMode === 'auto' ? location : manualAddress.trim()) ? 'bg-emergency' : 'bg-surface'}`}
                    activeOpacity={0.8}
                >
                    <Text className="text-white text-lg font-bold">
                        Confirm & Continue
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // STEP 3: Smart Questions
    if (step === 'questions') {
        const questions = selectedCategory?.smartQuestions || [];
        return (
            <ScrollView className="flex-1 bg-navy-dark px-6 pt-6">
                <Text className="text-white text-2xl font-bold mb-2">Quick questions</Text>
                <Text className="text-muted text-sm mb-6">Help us understand the issue better</Text>

                {questions.map((q: any, idx: number) => (
                    <View key={idx} className="mb-5">
                        <Text className="text-white text-base font-semibold mb-3">{q.question}</Text>
                        {q.type === 'yes_no' ? (
                            <View className="flex-row gap-3">
                                {['Yes', 'No'].map((opt) => (
                                    <TouchableOpacity
                                        key={opt}
                                        onPress={() => setAnswers({ ...answers, [idx]: opt })}
                                        className={`flex-1 py-4 rounded-xl items-center ${answers[idx] === opt ? 'bg-emergency' : 'bg-surface'}`}
                                    >
                                        <Text className="text-white font-semibold">{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View>
                                <View className="flex-row flex-wrap gap-2">
                                    {q.options?.map((opt: string) => (
                                        <TouchableOpacity
                                            key={opt}
                                            onPress={() => setAnswers({ ...answers, [idx]: opt })}
                                            className={`px-4 py-3 rounded-xl ${answers[idx] === opt ? 'bg-emergency' : 'bg-surface'}`}
                                        >
                                            <Text className="text-white text-sm">{opt}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    {/* Other option */}
                                    <TouchableOpacity
                                        onPress={() => setAnswers({ ...answers, [idx]: 'Other' })}
                                        className={`px-4 py-3 rounded-xl ${answers[idx] === 'Other' ? 'bg-emergency' : 'bg-surface'}`}
                                    >
                                        <Text className="text-white text-sm">Other</Text>
                                    </TouchableOpacity>
                                </View>
                                {/* Show text input when "Other" is selected */}
                                {answers[idx] === 'Other' && (
                                    <TextInput
                                        className="bg-surface text-white rounded-xl px-4 py-3 mt-3 text-sm"
                                        placeholder="Please specify..."
                                        placeholderTextColor="#8899AA"
                                        value={otherTexts[idx] || ''}
                                        onChangeText={(text) => setOtherTexts({ ...otherTexts, [idx]: text })}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                ))}

                {/* Photo Upload */}
                <View className="mb-6">
                    <Text className="text-white text-base font-semibold mb-3">Add photos (optional)</Text>
                    <TouchableOpacity onPress={pickPhoto} className="bg-surface rounded-xl py-4 items-center">
                        <Text className="text-emergency text-base">📷 {photos.length > 0 ? `${photos.length} photo(s) added` : 'Add Photo'}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={startSearching}
                    className="bg-emergency rounded-2xl py-5 items-center mb-10"
                    activeOpacity={0.8}
                >
                    <Text className="text-white text-lg font-bold">🚨 Find Help Now</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    // STEP 4: Searching Animation (with elapsed timer + cancel button)
    if (step === 'searching') {
        return (
            <View className="flex-1 bg-navy-dark items-center justify-center px-6">
                <View className="items-center">
                    <View className="w-48 h-48 items-center justify-center">
                        <Animated.View
                            style={{
                                position: 'absolute',
                                width: 180,
                                height: 180,
                                borderRadius: 90,
                                borderWidth: 2,
                                borderColor: '#E63946',
                                opacity: radarAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                                transform: [{ scale: radarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2] }) }],
                            }}
                        />
                        <View className="w-20 h-20 rounded-full bg-emergency items-center justify-center">
                            <Text className="text-3xl">🔍</Text>
                        </View>
                    </View>
                    <Text className="text-white text-xl font-bold mt-6">Finding help near you...</Text>
                    <Text className="text-muted text-sm mt-2">Broadcasting to verified providers</Text>
                    <Text className="text-white/60 text-sm mt-3">Searching for {searchElapsed}s</Text>
                    <ActivityIndicator color="#E63946" className="mt-4" />

                    <TouchableOpacity
                        onPress={cancelSearch}
                        className="mt-8 bg-surface rounded-xl px-8 py-3"
                        activeOpacity={0.7}
                    >
                        <Text className="text-muted font-semibold">Cancel Search</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // STEP 5: Provider Matched (with price range + trust text)
    if (step === 'matched' && matchedProvider) {
        return (
            <View className="flex-1 bg-navy-dark px-6 justify-center">
                <View className="bg-surface rounded-3xl p-6 items-center">
                    <View className="bg-success/20 rounded-full p-4 mb-4">
                        <Text className="text-4xl">✅</Text>
                    </View>
                    <Text className="text-white text-xl font-bold mb-1">Help is on the way!</Text>
                    <Text className="text-muted text-sm mb-6">Provider matched</Text>

                    <View className="bg-navy-dark rounded-2xl p-5 w-full mb-4">
                        <View className="flex-row items-center mb-3">
                            <View className="w-14 h-14 rounded-full bg-surface items-center justify-center mr-4">
                                <Text className="text-2xl">👷</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-white text-lg font-bold">{matchedProvider.name}</Text>
                                <Text className="text-muted text-sm">⭐ {matchedProvider.rating} rating</Text>
                            </View>
                        </View>
                        <View className="flex-row justify-between">
                            <View className="items-center flex-1">
                                <Text className="text-muted text-xs">Distance</Text>
                                <Text className="text-white font-bold">{matchedProvider.distance}</Text>
                            </View>
                            <View className="items-center flex-1">
                                <Text className="text-muted text-xs">ETA</Text>
                                <Text className="text-white font-bold">{matchedProvider.eta}</Text>
                            </View>
                            <View className="items-center flex-1">
                                <Text className="text-muted text-xs">Est. Price</Text>
                                <Text className="text-success font-bold">₹{matchedProvider.minPrice}–{matchedProvider.maxPrice}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Trust-building pricing text */}
                    <View className="bg-navy-dark/50 rounded-xl p-4 w-full mb-4">
                        <Text className="text-muted text-xs leading-5 text-center">
                            💡 The final price is decided after the work is completed. It typically ranges from ₹{matchedProvider.minPrice} to ₹{matchedProvider.maxPrice}. Don't worry about paying upfront — our verified provider will assess the situation and confirm the cost. You only pay after you're satisfied.
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/tracking')}
                        className="bg-emergency rounded-2xl py-4 w-full items-center mb-3"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white text-lg font-bold">Accept & Track</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="py-3">
                        <Text className="text-muted text-sm">Find Another Provider</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return null;
}
