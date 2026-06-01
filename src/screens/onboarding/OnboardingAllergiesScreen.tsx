import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressBar } from '../../components/ProgressBar';
import { useOnboarding } from '../../context/OnboardingContext';

export default function OnboardingAllergiesScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { data, updateData } = useOnboarding();
    const [inputValue, setInputValue] = useState('');

    const commonAllergies = ['Nüsse', 'Gluten', 'Laktose', 'Soja', 'Schalentiere', 'Fisch'];

    const toggleAllergy = (allergy: string) => {
        if (data.allergies.includes(allergy)) {
            updateData({ allergies: data.allergies.filter((a) => a !== allergy) });
        } else {
            updateData({ allergies: [...data.allergies, allergy] });
        }
    };

    const overrideCustom = () => {
        if (inputValue.trim() !== '') {
            const newAllergy = inputValue.trim();
            if (!data.allergies.includes(newAllergy)) {
                updateData({ allergies: [...data.allergies, newAllergy] });
            }
            setInputValue('');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProgressBar currentStep={3} totalSteps={6} />
            <View style={styles.container}>
                <Text style={styles.title}>Allergien & No-Gos</Text>
                <Text style={styles.subtitle}>Gibt es Zutaten, die du überhaupt nicht magst oder verträgst?</Text>

                <ScrollView style={styles.scrollArea}>
                    <View style={styles.tagsContainer}>
                        {commonAllergies.map((allergy) => {
                            const isSelected = data.allergies.includes(allergy);
                            return (
                                <TouchableOpacity
                                    key={allergy}
                                    style={[styles.tag, isSelected && styles.tagSelected]}
                                    onPress={() => toggleAllergy(allergy)}
                                >
                                    <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{allergy}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Eigene Zutat hinzufügen..."
                            placeholderTextColor="#999"
                            value={inputValue}
                            onChangeText={setInputValue}
                            onSubmitEditing={overrideCustom}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={overrideCustom}>
                            <Text style={styles.addButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {data.allergies.length > 0 && (
                        <View style={styles.selectedList}>
                            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Gewählte Ausschlüsse:</Text>
                            {data.allergies.map((a) => (
                                <Text key={a} style={styles.listItem}>• {a}</Text>
                            ))}
                        </View>
                    )}

                </ScrollView>
                <TouchableOpacity style={styles.nextButton} onPress={() => navigation.navigate('OnboardingTime')}>
                    <Text style={styles.nextButtonText}>Weiter</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Zurück</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#0A0A0A' },
    container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
    title: { fontSize: 32, fontWeight: '800', color: '#FA4A0C', marginBottom: 12 },
    subtitle: { fontSize: 16, color: '#9A9A9A', lineHeight: 24, marginBottom: 20 },
    scrollArea: { flex: 1 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
    tag: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#1F1F1F', borderWidth: 1, borderColor: '#262626' },
    tagSelected: { backgroundColor: '#FA4A0C' },
    tagText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
    tagTextSelected: { color: '#FFF' },
    inputContainer: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 20 },
    input: { flex: 1, backgroundColor: '#161616', padding: 16, borderRadius: 14, fontSize: 16, color: '#FFFFFF', borderWidth: 1, borderColor: '#262626' },
    addButton: { backgroundColor: '#1F1F1F', padding: 16, borderRadius: 14, width: 56, alignItems: 'center' },
    addButtonText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    selectedList: { marginTop: 10, backgroundColor: '#161616', padding: 16, borderRadius: 12 },
    listItem: { fontSize: 14, color: '#E5E5E5', marginBottom: 4 },
    nextButton: { backgroundColor: '#FA4A0C', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 16 },
    nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    backButton: { padding: 20, alignItems: 'center' },
    backButtonText: { color: '#9A9A9A', fontSize: 16, fontWeight: '600' },
});
