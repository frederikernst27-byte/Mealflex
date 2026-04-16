import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressBar } from '../../components/ProgressBar';
import { useOnboarding } from '../../context/OnboardingContext';

export default function OnboardingGoalScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { data, updateData } = useOnboarding();

    const handleSelect = (goal: string) => {
        updateData({ goal });
        navigation.navigate('OnboardingStyle');
    };

    const goals = [
        { id: 'cut', label: 'Abnehmen (Cut)' },
        { id: 'muscle', label: 'Muskelaufbau' },
        { id: 'healthy', label: 'Gesund Essen (Healthy)' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProgressBar currentStep={1} totalSteps={6} />
            <View style={styles.container}>
                <Text style={styles.title}>Was ist dein Ziel?</Text>
                <Text style={styles.subtitle}>Wähle dein primäres Ernährungsziel, damit wir deinen Plan anpassen können.</Text>

                <View style={styles.optionsContainer}>
                    {goals.map((item) => {
                        const isSelected = data.goal === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                                onPress={() => handleSelect(item.id)}
                            >
                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF' },
    container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
    title: { fontSize: 32, fontWeight: '800', color: '#4A8CFF', marginBottom: 12 },
    subtitle: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 40 },
    optionsContainer: { gap: 16 },
    optionCard: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#F0F0F0',
        backgroundColor: '#FAFAFA',
        alignItems: 'center',
    },
    optionCardSelected: {
        borderColor: '#4A8CFF',
        backgroundColor: '#EEF3FF',
    },
    optionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    optionTextSelected: {
        color: '#4A8CFF',
    },
});
