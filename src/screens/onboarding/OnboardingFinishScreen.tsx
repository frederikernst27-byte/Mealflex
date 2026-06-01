import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressBar } from '../../components/ProgressBar';
import { useOnboarding } from '../../context/OnboardingContext';
import { useMealplan } from '../../context/MealplanContext';
import { supabase } from '../../../lib/supabase';

const GOAL_LABELS: Record<string, string> = {
    cut: '🔥 Cut / Abnehmen',
    muscle: '💪 Muskelaufbau',
    healthy: '🥗 Gesund & Ausgewogen',
};
const STYLE_LABELS: Record<string, string> = {
    mealprep: '📦 Meal Prep',
    daily: '🍳 Täglich kochen',
};

export default function OnboardingFinishScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { data } = useOnboarding();
    const { createNewPlan } = useMealplan();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'idle' | 'saving' | 'generating' | 'done'>('idle');

    const finishOnboarding = async () => {
        setLoading(true);

        try {
            // 1. Session holen
            setStep('saving');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) throw new Error('Nicht eingeloggt.');

            // 2. Profil in Supabase speichern
            const { error: profileErr } = await supabase
                .from('profiles')
                .upsert({
                    id: session.user.id,
                    goal: data.goal,
                    cooking_style: data.cookingStyle,
                    allergies: data.allergies,
                    max_time: data.maxTime,
                    language: data.language,
                    onboarding_completed: true,
                    updated_at: new Date().toISOString(),
                });

            if (profileErr) throw profileErr;

            // 3. Mealplan generieren + in DB speichern
            setStep('generating');
            await createNewPlan(data);

            setStep('done');

            // 4. Direkt zu MainHome navigieren – Plan ist bereits geladen
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainHome' }],
            });

        } catch (error: any) {
            console.error('finishOnboarding error:', error);
            Alert.alert('Fehler', error.message || 'Bitte versuche es erneut.');
            setStep('idle');
        } finally {
            setLoading(false);
        }
    };

    const loadingLabel =
        step === 'saving' ? 'Profil wird gespeichert…' :
        step === 'generating' ? 'Dein Plan wird erstellt…' :
        'Plan generieren';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProgressBar currentStep={6} totalSteps={6} />

            <View style={styles.container}>
                {/* Emoji */}
                <Text style={styles.emoji}>{loading ? '⏳' : '🚀'}</Text>

                <Text style={styles.title}>
                    {loading ? loadingLabel : 'Alles bereit!'}
                </Text>
                <Text style={styles.subtitle}>
                    Deine Präferenzen auf einen Blick:
                </Text>

                {/* Summary Cards */}
                <View style={styles.summaryGrid}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Ziel</Text>
                        <Text style={styles.summaryValue}>{GOAL_LABELS[data.goal] ?? data.goal}</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Kochstil</Text>
                        <Text style={styles.summaryValue}>{STYLE_LABELS[data.cookingStyle] ?? data.cookingStyle}</Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Zeit</Text>
                        <Text style={styles.summaryValue}>max. {data.maxTime} Minuten</Text>
                    </View>
                    {data.allergies.length > 0 && (
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Ausschlüsse</Text>
                            <Text style={styles.summaryValue}>{data.allergies.join(', ')}</Text>
                        </View>
                    )}
                </View>

                {/* CTA */}
                <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                    onPress={finishOnboarding}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator color="#FFF" />
                            <Text style={styles.primaryButtonText}>{loadingLabel}</Text>
                        </View>
                    ) : (
                        <Text style={styles.primaryButtonText}>Plan erstellen →</Text>
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
    safeArea: { flex: 1, backgroundColor: '#0A0A0A' },
    container: {
        flex: 1, paddingHorizontal: 24, paddingTop: 32,
        alignItems: 'center',
    },
    emoji: { fontSize: 72, marginBottom: 16 },
    title: {
        fontSize: 28, fontWeight: '800', color: '#FFFFFF',
        marginBottom: 6, textAlign: 'center', letterSpacing: -0.5,
    },
    subtitle: { fontSize: 15, color: '#9A9A9A', marginBottom: 28, textAlign: 'center' },

    summaryGrid: { width: '100%', gap: 10, marginBottom: 36 },
    summaryCard: {
        backgroundColor: '#161616', borderRadius: 14,
        paddingHorizontal: 18, paddingVertical: 14,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    summaryLabel: { fontSize: 13, color: '#9A9A9A', fontWeight: '600' },
    summaryValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '700', flexShrink: 1, textAlign: 'right', marginLeft: 12 },

    primaryButton: {
        backgroundColor: '#FA4A0C', borderRadius: 16,
        paddingVertical: 18, paddingHorizontal: 32,
        width: '100%', alignItems: 'center',
        shadowColor: '#FA4A0C', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
    },
    primaryButtonDisabled: { opacity: 0.7, shadowOpacity: 0 },
    primaryButtonText: { color: '#FFF', fontSize: 17, fontWeight: '800' },
    loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },

    backButton: { marginTop: 20, padding: 16 },
    backButtonText: { color: '#9A9A9A', fontSize: 15, fontWeight: '500' },
});
