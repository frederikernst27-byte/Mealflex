import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, shadow, spacing, typography } from '../theme';
import { useSubscription } from '../context/SubscriptionContext';

const FEATURES = [
    { label: 'KI-Coach mit Wochenanalyse', free: false, pro: true },
    { label: 'Bring!-Export und Teilen', free: false, pro: true },
    { label: 'Unbegrenzte Community-Uploads', free: false, pro: true },
    { label: 'Foto-Upload für Rezepte', free: false, pro: true },
    { label: 'Erweiterte Historie, Streaks und Badges', free: false, pro: true },
    { label: '7 Tage Basis-Tracking', free: true, pro: true },
];

function Check({ enabled }: { enabled: boolean }) {
    return (
        <Ionicons
            name={enabled ? 'checkmark-circle' : 'remove-circle-outline'}
            size={20}
            color={enabled ? colors.success : colors.mutedSoft}
        />
    );
}

export default function PricingScreen() {
    const navigation = useNavigation<any>();
    const { status, startCheckout } = useSubscription();

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>MealFlex Pro</Text>
                <View style={styles.iconBtn} />
            </View>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="sparkles" size={28} color={colors.primary} />
                    </View>
                    <Text style={styles.title}>Mehr Klarheit beim Essen</Text>
                    <Text style={styles.subtitle}>
                        Pro schaltet Coach, Exporte, Foto-Uploads und tiefere Auswertungen frei. 3 Tage kostenlos testen.
                    </Text>
                    <Text style={styles.status}>Aktueller Status: {status === 'free' ? 'Free' : 'Pro'}</Text>
                </View>

                <View style={styles.planRow}>
                    <TouchableOpacity style={styles.planCard} onPress={() => startCheckout('monthly')}>
                        <Text style={styles.planName}>Monatlich</Text>
                        <Text style={styles.price}>9,99 EUR</Text>
                        <Text style={styles.planMeta}>pro Monat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.planCard, styles.planFeatured]} onPress={() => startCheckout('yearly')}>
                        <View style={styles.savePill}><Text style={styles.saveText}>17% sparen</Text></View>
                        <Text style={styles.planName}>Jährlich</Text>
                        <Text style={styles.price}>99,99 EUR</Text>
                        <Text style={styles.planMeta}>pro Jahr</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, { flex: 1.8 }]}>Feature</Text>
                        <Text style={styles.tableCell}>Free</Text>
                        <Text style={styles.tableCell}>Pro</Text>
                    </View>
                    {FEATURES.map(feature => (
                        <View key={feature.label} style={styles.tableRow}>
                            <Text style={[styles.featureName, { flex: 1.8 }]}>{feature.label}</Text>
                            <View style={styles.tableCell}><Check enabled={feature.free} /></View>
                            <View style={styles.tableCell}><Check enabled={feature.pro} /></View>
                        </View>
                    ))}
                </View>

                <View style={styles.transparency}>
                    <Ionicons name="shield-checkmark-outline" size={22} color={colors.success} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.transparencyTitle}>Transparent und ohne Werbung</Text>
                        <Text style={styles.transparencyText}>
                            MealFlex nutzt KI-Modelle und Datenbank-Services. Wir zeigen keine Werbung und verkaufen keine Daten.
                        </Text>
                    </View>
                </View>

                <Text style={styles.footer}>Entwickelt von Frederik Ernst & Janis Nacke</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, backgroundColor: colors.surface },
    iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
    content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 40 },
    hero: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md, ...shadow },
    heroIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
    title: { ...typography.title },
    subtitle: { ...typography.body, color: colors.muted },
    status: { fontSize: 13, fontWeight: '800', color: colors.primary },
    planRow: { flexDirection: 'row', gap: spacing.md },
    planCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, minHeight: 132, ...shadow },
    planFeatured: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    savePill: { alignSelf: 'flex-start', backgroundColor: colors.successSoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
    saveText: { color: colors.success, fontSize: 11, fontWeight: '800' },
    planName: { fontSize: 15, fontWeight: '800', color: colors.text },
    price: { fontSize: 24, fontWeight: '900', color: colors.primary, marginTop: 8 },
    planMeta: { fontSize: 12, color: colors.muted, marginTop: 4 },
    table: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
    tableHeader: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, padding: spacing.md },
    tableRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
    tableCell: { flex: 1, fontSize: 13, fontWeight: '800', color: colors.muted, alignItems: 'center', textAlign: 'center' },
    featureName: { fontSize: 13, color: colors.text, fontWeight: '600' },
    transparency: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
    transparencyTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
    transparencyText: { ...typography.caption, lineHeight: 19, marginTop: 4 },
    footer: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: spacing.md },
});
