import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ── Unified brand colours ───────────────────────────────────────────────────
const BLUE   = '#4A8CFF';
const YELLOW = '#FFD166';
const GREEN  = '#43B97F';

// ── Mock data ───────────────────────────────────────────────────────────────
const GOAL_KCAL = 2000;

const MEALS = [
    { name: 'Haferflocken mit Beeren', time: '08:00', kcal: 340, type: 'Frühstück',   dot: YELLOW },
    { name: 'Hähnchen-Quinoa-Bowl',    time: '12:30', kcal: 520, type: 'Mittagessen', dot: GREEN  },
    { name: 'Apfel & Mandeln',         time: '15:00', kcal: 180, type: 'Snack',       dot: BLUE   },
];

const EATEN_KCAL = MEALS.reduce((s, m) => s + m.kcal, 0);
const REMAINING  = GOAL_KCAL - EATEN_KCAL;

const MACROS = [
    { label: 'Protein',        value: 87,  goal: 120, color: BLUE,   unit: 'g' },
    { label: 'Kohlenhydrate',  value: 165, goal: 250, color: YELLOW, unit: 'g' },
    { label: 'Fett',           value: 42,  goal: 65,  color: GREEN,  unit: 'g' },
];

// ── Daily Challenge data (three boxes: yellow · green · blue) ───────────────
interface Challenge {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    textColor: string;
    progress: number;
    total: number;
    unit: string;
}

const CHALLENGES: Challenge[] = [
    {
        id: 'steps',
        title: '10.000 Schritte',
        subtitle: 'Bewegung',
        icon: '🚶',
        color: YELLOW,
        textColor: '#1A1A1A',
        progress: 6400,
        total: 10000,
        unit: '',
    },
    {
        id: 'veggie',
        title: '5 Portionen Gemüse',
        subtitle: 'Ernährung',
        icon: '🥦',
        color: GREEN,
        textColor: '#FFFFFF',
        progress: 3,
        total: 5,
        unit: 'Port.',
    },
    {
        id: 'water',
        title: '2 L Wasser',
        subtitle: 'Hydration',
        icon: '💧',
        color: BLUE,
        textColor: '#FFFFFF',
        progress: 1.2,
        total: 2,
        unit: 'L',
    },
];

export default function CalorieTrackerScreen() {
    const [checkedChallenges, setCheckedChallenges] = useState<Set<string>>(new Set());

    const toggleChallenge = (id: string) =>
        setCheckedChallenges(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const progress = Math.min(EATEN_KCAL / GOAL_KCAL, 1);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Header ──────────────────────────────────────────── */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Kalorien-Tracker</Text>
                        <Text style={styles.headerDate}>Heute, 16. April</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
                        <Ionicons name="add" size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* ── Main calorie card ────────────────────────────────── */}
                <View style={styles.calorieCard}>
                    <View style={styles.calorieTop}>
                        <View>
                            <Text style={styles.calorieNumber}>{EATEN_KCAL}</Text>
                            <Text style={styles.calorieLabel}>kcal gegessen</Text>
                        </View>
                        <View style={styles.calorieCircle}>
                            <Text style={styles.caloriePercent}>
                                {Math.round(progress * 100)}%
                            </Text>
                            <Text style={styles.calorieGoalSmall}>von Ziel</Text>
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                    </View>

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{GOAL_KCAL}</Text>
                            <Text style={styles.statLabel}>Ziel</Text>
                        </View>
                        <View style={[styles.statBox, styles.statBoxBlue]}>
                            <Text style={[styles.statValue, { color: BLUE }]}>{REMAINING}</Text>
                            <Text style={styles.statLabel}>Verbleibend</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{EATEN_KCAL}</Text>
                            <Text style={styles.statLabel}>Gegessen</Text>
                        </View>
                    </View>
                </View>

                {/* ── Makros ──────────────────────────────────────────── */}
                <View style={styles.macrosRow}>
                    {MACROS.map(m => (
                        <View key={m.label} style={styles.macroCard}>
                            <Text style={[styles.macroValue, { color: m.color }]}>{m.value}</Text>
                            <Text style={styles.macroUnit}>{m.unit}</Text>
                            <Text style={styles.macroLabel}>{m.label}</Text>
                            <View style={styles.macroBarBg}>
                                <View
                                    style={[
                                        styles.macroBarFill,
                                        {
                                            backgroundColor: m.color,
                                            width: `${Math.min((m.value / m.goal) * 100, 100)}%`,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.macroGoal}>/ {m.goal}{m.unit}</Text>
                        </View>
                    ))}
                </View>

                {/* ── Daily Challenge Widget ───────────────────────────── */}
                {/* Three boxes in yellow / green / blue – same colours as AIME chips */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="trophy-outline" size={20} color={YELLOW} />
                    <Text style={styles.sectionTitle}>Daily Challenges</Text>
                </View>

                <View style={styles.challengesRow}>
                    {CHALLENGES.map(ch => {
                        const done = checkedChallenges.has(ch.id);
                        const pct  = Math.min(ch.progress / ch.total, 1);

                        return (
                            <TouchableOpacity
                                key={ch.id}
                                style={[
                                    styles.challengeBox,
                                    { backgroundColor: ch.color },
                                    done && styles.challengeDone,
                                ]}
                                onPress={() => toggleChallenge(ch.id)}
                                activeOpacity={0.85}
                            >
                                {done && (
                                    <View style={styles.doneCheck}>
                                        <Ionicons name="checkmark" size={13} color={ch.color} />
                                    </View>
                                )}
                                <Text style={styles.challengeIcon}>{ch.icon}</Text>
                                <Text style={[styles.challengeTitle, { color: ch.textColor }]}>
                                    {ch.title}
                                </Text>
                                <Text style={[styles.challengeSub, { color: ch.textColor + 'CC' }]}>
                                    {ch.subtitle}
                                </Text>

                                {/* Mini progress bar inside the box */}
                                <View
                                    style={[
                                        styles.chBarBg,
                                        {
                                            backgroundColor:
                                                ch.textColor === '#FFFFFF'
                                                    ? '#FFFFFF33'
                                                    : '#00000020',
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.chBarFill,
                                            { backgroundColor: ch.textColor, width: `${pct * 100}%` },
                                        ]}
                                    />
                                </View>

                                <Text
                                    style={[styles.challengeProgress, { color: ch.textColor }]}
                                >
                                    {ch.progress}
                                    {ch.unit ? ` ${ch.unit}` : ''} / {ch.total}
                                    {ch.unit ? ` ${ch.unit}` : ''}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* ── Today's meals ────────────────────────────────────── */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="restaurant-outline" size={20} color={BLUE} />
                    <Text style={styles.sectionTitle}>Heutige Mahlzeiten</Text>
                </View>

                {MEALS.map((meal, i) => (
                    <View key={i} style={styles.mealRow}>
                        <View style={[styles.mealDot, { backgroundColor: meal.dot }]} />
                        <View style={styles.mealInfo}>
                            <Text style={styles.mealName}>{meal.name}</Text>
                            <Text style={styles.mealMeta}>
                                {meal.type} · {meal.time}
                            </Text>
                        </View>
                        <Text style={styles.mealKcal}>{meal.kcal} kcal</Text>
                    </View>
                ))}

                <TouchableOpacity style={styles.addMealBtn} activeOpacity={0.8}>
                    <Ionicons name="add-circle-outline" size={20} color={BLUE} />
                    <Text style={styles.addMealText}>Mahlzeit hinzufügen</Text>
                </TouchableOpacity>

                <View style={{ height: 24 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F5F9' },
    scrollContent: { paddingBottom: 20 },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
    },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
    headerDate:  { fontSize: 14, color: '#888', marginTop: 2 },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: BLUE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Calorie card ─────────────────────────────────────────────────────────
    calorieCard: {
        marginHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    calorieTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    calorieNumber: { fontSize: 40, fontWeight: '800', color: '#1A1A1A' },
    calorieLabel:  { fontSize: 13, color: '#888', marginTop: 2 },
    calorieCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: BLUE + '18',
        alignItems: 'center',
        justifyContent: 'center',
    },
    caloriePercent:  { fontSize: 18, fontWeight: '800', color: BLUE },
    calorieGoalSmall: { fontSize: 10, color: '#888' },

    progressBg: {
        height: 10,
        backgroundColor: '#F0F0F0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressFill: {
        height: '100%',
        backgroundColor: BLUE,
        borderRadius: 5,
    },

    statsRow: { flexDirection: 'row', gap: 8 },
    statBox: {
        flex: 1,
        backgroundColor: '#F2F5F9',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
    },
    statBoxBlue: { backgroundColor: BLUE + '18' },
    statValue: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    statLabel: { fontSize: 11, color: '#888', marginTop: 2 },

    // ── Macros ───────────────────────────────────────────────────────────────
    macrosRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 20,
    },
    macroCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 12,
        alignItems: 'center',
    },
    macroValue: { fontSize: 20, fontWeight: '800' },
    macroUnit:  { fontSize: 11, color: '#888' },
    macroLabel: {
        fontSize: 11,
        color: '#555',
        fontWeight: '500',
        marginTop: 6,
        marginBottom: 6,
        textAlign: 'center',
    },
    macroBarBg: {
        width: '100%',
        height: 4,
        backgroundColor: '#F0F0F0',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 4,
    },
    macroBarFill: { height: 4, borderRadius: 2 },
    macroGoal: { fontSize: 10, color: '#ADADAD' },

    // ── Section header ───────────────────────────────────────────────────────
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },

    // ── Daily Challenge Widget ────────────────────────────────────────────────
    // Three boxes: yellow / green / blue (same colours as AIME suggestion chips)
    challengesRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 24,
    },
    challengeBox: {
        flex: 1,
        borderRadius: 16,
        padding: 12,
        position: 'relative',
    },
    challengeDone: { opacity: 0.72 },
    doneCheck: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    challengeIcon:     { fontSize: 24, marginBottom: 6 },
    challengeTitle:    { fontSize: 12, fontWeight: '700', marginBottom: 2 },
    challengeSub:      { fontSize: 10, marginBottom: 8 },
    chBarBg: {
        width: '100%',
        height: 3,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 4,
    },
    chBarFill:         { height: 3, borderRadius: 2 },
    challengeProgress: { fontSize: 10, fontWeight: '600' },

    // ── Meals ────────────────────────────────────────────────────────────────
    mealRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
        gap: 12,
    },
    mealDot:  { width: 10, height: 10, borderRadius: 5 },
    mealInfo: { flex: 1 },
    mealName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    mealMeta: { fontSize: 13, color: '#888', marginTop: 2 },
    mealKcal: { fontSize: 15, fontWeight: '700', color: BLUE },

    addMealBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginTop: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        gap: 8,
        borderWidth: 1.5,
        borderColor: BLUE + '55',
        borderStyle: 'dashed',
    },
    addMealText: { fontSize: 15, color: BLUE, fontWeight: '600' },
});
