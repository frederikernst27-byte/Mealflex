import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressBar } from '../../components/ProgressBar';
import { useOnboarding } from '../../context/OnboardingContext';
import { supabase } from '../../../lib/supabase';

export default function OnboardingFinishScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { data } = useOnboarding();
    const [loading, setLoading] = useState(false);

    const finishOnboarding = async () => {
        setLoading(true);

        try {
            // Get current user session
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                throw new Error('Nicht eingeloggt.');
            }

            // Save data to Supabase profiles table (assuming auth.users -> profiles logic setup later)
            // Here we just simulate an API call for now or try an upsert if profiles exists
            /*
            const { error } = await supabase.from('profiles').upsert({
              id: session.user.id,
              goal: data.goal,
              cooking_style: data.cookingStyle,
              allergies: data.allergies,
              max_time: data.maxTime,
              language: data.language,
              onboarding_completed: true,
            });
            if (error) throw error;
            */

            // Simulate network request to trigger the generating mealplan cloud function
            await new Promise((res) => setTimeout(res, 2000));

            // App.tsx and Navigation will handle redirecting when onboarding flag goes true.
            Alert.alert('Erfolg!', 'Dein persönlicher Mealplan wird erstellt!');

            // Actually navigate to Home
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainHome' as never }],
            });

        } catch (error: any) {
            Alert.alert('Fehler', error.message || 'Ein Fehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProgressBar currentStep={6} totalSteps={6} />
            <View style={styles.container}>
                <Text style={styles.emoji}>🚀</Text>
                <Text style={styles.title}>Fast geschafft!</Text>
                <Text style={styles.subtitle}>Wir haben all deine Präferenzen gespeichert:{'\n'}
                    • Ziel: {data.goal}{'\n'}
                    • Stil: {data.cookingStyle}{'\n'}
                    • Zeit: max {data.maxTime} Min.
                </Text>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={finishOnboarding}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.primaryButtonText}>Plan generieren</Text>
                    )}
                </TouchableOpacity>

                {!loading && (
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.backButtonText}>Zurück</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF' },
    container: { flex: 1, paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
    emoji: { fontSize: 64, marginBottom: 20 },
    title: { fontSize: 32, fontWeight: '800', color: '#4A8CFF', marginBottom: 16, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#555', lineHeight: 26, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 },
    primaryButton: {
        backgroundColor: '#4A8CFF',
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#4A8CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
    backButton: { marginTop: 20, padding: 20 },
    backButtonText: { color: '#999', fontSize: 16, fontWeight: '600' },
});
