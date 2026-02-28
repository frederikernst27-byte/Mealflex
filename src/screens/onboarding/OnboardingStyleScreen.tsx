import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressBar } from '../../components/ProgressBar';
import { useOnboarding } from '../../context/OnboardingContext';

export default function OnboardingStyleScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { data, updateData } = useOnboarding();

    const handleSelect = (styleId: string) => {
        updateData({ cookingStyle: styleId });
        navigation.navigate('OnboardingAllergies');
    };

    const stylesList = [
        { id: 'mealprep', label: 'Meal Prep', desc: 'Vorkochen für mehrere Tage - Effizienz pur.', emoji: '🍱' },
        { id: 'daily', label: 'Täglich Kochen', desc: 'Jeden Tag frisch und abwechslungsreich.', emoji: '🧑‍🍳' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProgressBar currentStep={2} totalSteps={6} />
            <View style={styles.container}>
                <Text style={styles.title}>Dein Kochstil?</Text>
                <Text style={styles.subtitle}>Bist du Team Meal Prep oder kochst du lieber täglich frisch?</Text>

                <View style={styles.optionsContainer}>
                    {stylesList.map((item) => {
                        const isSelected = data.cookingStyle === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                                onPress={() => handleSelect(item.id)}
                            >
                                <Text style={styles.emoji}>{item.emoji}</Text>
                                <View style={styles.textContainer}>
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {item.label}
                                    </Text>
                                    <Text style={styles.descText}>{item.desc}</Text>
                                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionCardSelected: { borderColor: '#FA4A0C', backgroundColor: '#FFF5F0' },
    emoji: { fontSize: 32, marginRight: 16 },
    textContainer: { flex: 1 },
    optionText: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4 },
    optionTextSelected: { color: '#FA4A0C' },
    descText: { fontSize: 14, color: '#777', lineHeight: 20 },
    backButton: { marginTop: 'auto', padding: 20, alignItems: 'center' },
    backButtonText: { color: '#999', fontSize: 16, fontWeight: '600' },
});
