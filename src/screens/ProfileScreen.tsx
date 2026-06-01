import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { colors, radius, shadow, spacing, typography } from '../theme';
import { ProBadge } from '../components/ScreenState';
import { useSubscription } from '../context/SubscriptionContext';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { isPro, status, refreshSubscription } = useSubscription();
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [goal, setGoal] = useState('');
    const [cookingStyle, setCookingStyle] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            setEmail(session.user.email ?? '');
            const { data } = await supabase
                .from('profiles')
                .select('display_name, name, goal, cooking_style')
                .eq('id', session.user.id)
                .maybeSingle();
            setDisplayName(data?.display_name ?? data?.name ?? session.user.email?.split('@')[0] ?? '');
            setGoal(data?.goal ?? '');
            setCookingStyle(data?.cooking_style ?? '');
        })();
    }, []);

    const saveProfile = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            const { error } = await supabase.from('profiles').upsert({
                id: session.user.id,
                display_name: displayName.trim(),
                goal,
                cooking_style: cookingStyle,
                updated_at: new Date().toISOString(),
            });
            if (error) throw error;
            await refreshSubscription();
            Alert.alert('Gespeichert', 'Dein Profil wurde aktualisiert.');
        } catch (e: any) {
            Alert.alert('Profil nicht gespeichert', e?.message ?? 'Bitte später erneut versuchen.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Profil</Text>
                        <Text style={styles.subtitle}>{email || 'MealFlex Account'}</Text>
                    </View>
                    {isPro ? <ProBadge /> : (
                        <TouchableOpacity style={styles.proButton} onPress={() => navigation.navigate('Pricing')}>
                            <Text style={styles.proButtonText}>Pro ansehen</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <Text style={styles.label}>Display-Name</Text>
                    <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholder="Dein Name" placeholderTextColor={colors.mutedSoft} />
                    <Text style={styles.label}>E-Mail</Text>
                    <Text style={styles.readonly}>{email}</Text>
                    <Text style={styles.label}>Subscription</Text>
                    <Text style={styles.readonly}>{status === 'free' ? 'Free' : status === 'trialing' ? 'Pro Testphase' : 'Pro'}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Ernährungsprofil</Text>
                    <View style={styles.choiceRow}>
                        {['cut', 'muscle', 'healthy'].map(item => (
                            <TouchableOpacity key={item} style={[styles.choice, goal === item && styles.choiceActive]} onPress={() => setGoal(item)}>
                                <Text style={[styles.choiceText, goal === item && styles.choiceTextActive]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.choiceRow}>
                        {['mealprep', 'daily'].map(item => (
                            <TouchableOpacity key={item} style={[styles.choice, cookingStyle === item && styles.choiceActive]} onPress={() => setCookingStyle(item)}>
                                <Text style={[styles.choiceText, cookingStyle === item && styles.choiceTextActive]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={loading}>
                        <Text style={styles.saveButtonText}>{loading ? 'Speichern…' : 'Profil speichern'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Rechtliches & App</Text>
                    {['Datenschutz', 'Impressum', 'Version 1.0.0'].map(row => (
                        <View key={row} style={styles.infoRow}>
                            <Text style={styles.infoText}>{row}</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.logout} onPress={() => supabase.auth.signOut()}>
                    <Ionicons name="log-out-outline" size={18} color={colors.danger} />
                    <Text style={styles.logoutText}>Ausloggen</Text>
                </TouchableOpacity>

                <Text style={styles.footer}>Entwickelt von Frederik Ernst & Janis Nacke</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { ...typography.title },
    subtitle: { ...typography.caption, marginTop: 3 },
    proButton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10 },
    proButtonText: { color: '#FFF', fontWeight: '800' },
    card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, ...shadow },
    sectionTitle: { ...typography.sectionTitle },
    label: { fontSize: 12, color: colors.muted, fontWeight: '800', textTransform: 'uppercase' },
    input: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: spacing.md, fontSize: 15, color: colors.text },
    readonly: { fontSize: 15, color: colors.text, fontWeight: '600' },
    choiceRow: { flexDirection: 'row', gap: spacing.sm },
    choice: { flex: 1, paddingVertical: 11, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    choiceActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
    choiceText: { color: colors.muted, fontWeight: '800' },
    choiceTextActive: { color: colors.primary },
    saveButton: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
    saveButtonText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
    infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
    infoText: { fontSize: 15, color: colors.text, fontWeight: '600' },
    logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md },
    logoutText: { color: colors.danger, fontWeight: '800' },
    footer: { textAlign: 'center', color: colors.muted, fontSize: 12 },
});
