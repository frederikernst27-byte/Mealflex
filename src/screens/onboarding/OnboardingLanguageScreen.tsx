import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressBar } from '../../components/ProgressBar';
import { useOnboarding } from '../../context/OnboardingContext';

export default function OnboardingLanguageScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { data, updateData } = useOnboarding();

    const handleSelect = (language: string) => {
        updateData({ language });
        navigation.navigate('OnboardingFinish');
    };

    const languages = [
        { id: 'DE', label: 'Deutsch' },
        { id: 'EN', label: 'English' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProgressBar currentStep={5} totalSteps={6} />
            <View style={styles.container}>
                <Text style={styles.title}>Sprache / Language</Text>
                <Text style={styles.subtitle}>In welcher Sprache sollen deine Rezepte angezeigt werden?</Text>

                <View style={styles.optionsContainer}>
                    {languages.map((item) => {
                        const isSelected = data.language === item.id;
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

                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Zurück</Text>
                </TouchableOpacity>
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
    optionCardSelected: { borderColor: '#4A8CFF', backgroundColor: '#EEF3FF' },
    optionText: { fontSize: 18, fontWeight: '700', color: '#333' },
    optionTextSelected: { color: '#4A8CFF' },
    backButton: { marginTop: 'auto', padding: 20, alignItems: 'center' },
    backButtonText: { color: '#999', fontSize: 16, fontWeight: '600' },
});
