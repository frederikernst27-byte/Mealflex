import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressBar } from '../../components/ProgressBar';
import { useOnboarding } from '../../context/OnboardingContext';

export default function OnboardingTimeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { data, updateData } = useOnboarding();

    const handleSelect = (maxTime: number) => {
        updateData({ maxTime });
        navigation.navigate('OnboardingLanguage');
    };

    const times = [
        { id: 15, label: 'Bis zu 15 Min.', desc: 'Sehr schnell' },
        { id: 30, label: 'Bis zu 30 Min.', desc: 'Normal' },
        { id: 45, label: 'Bis zu 45 Min.', desc: 'Aufwändiger' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProgressBar currentStep={4} totalSteps={6} />
            <View style={styles.container}>
                <Text style={styles.title}>Dein Zeitbudget?</Text>
                <Text style={styles.subtitle}>Wie viel Zeit möchtest du pro Mahlzeit maximal in der Küche verbringen?</Text>

                <View style={styles.optionsContainer}>
                    {times.map((item) => {
                        const isSelected = data.maxTime === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                                onPress={() => handleSelect(item.id)}
                            >
                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                    {item.label}
                                </Text>
                                <Text style={styles.descText}>{item.desc}</Text>
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
    title: { fontSize: 32, fontWeight: '800', color: '#FA4A0C', marginBottom: 12 },
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
    optionCardSelected: { borderColor: '#FA4A0C', backgroundColor: '#FFF5F0' },
    optionText: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4 },
    optionTextSelected: { color: '#FA4A0C' },
    descText: { fontSize: 14, color: '#777', lineHeight: 20 },
    backButton: { marginTop: 'auto', padding: 20, alignItems: 'center' },
    backButtonText: { color: '#999', fontSize: 16, fontWeight: '600' },
});
