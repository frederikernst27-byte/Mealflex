import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Modal, TextInput, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay, withSequence } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useCalorie, MealType, ParsedFood, CalorieLog } from '../context/CalorieContext';
import { colors } from '../theme';

const ORANGE = colors.primary;

const MEAL_LABELS: Record<MealType, string> = {
    breakfast: '🌅 Frühstück',
    lunch: '☀️ Mittagessen',
    dinner: '🌙 Abendessen',
    snack: '🍎 Snack',
};

const MEAL_COLORS: Record<MealType, string> = {
    breakfast: '#FF9500',
    lunch: '#34C759',
    dinner: '#5856D6',
    snack: '#FF6B6B',
};

// ── Ring Chart (pure RN, no SVG) ───────────────────────────────────────────────
// Uses two half-circles via border radius trick
function RingChart({ value, max, color, size = 120 }: { value: number; max: number; color: string; size?: number }) {
    // We render this as a visual percentage arc via View transforms
    // Simple: just show a thick colored border ring with a partial overlay
    return null; // rendered inline in ringCard
}

// ── Macro Bar ─────────────────────────────────────────────────────────────────
function MacroBar({ label, value, goal, color, unit = 'g' }: { label: string; value: number; goal: number; color: string; unit?: string }) {
    const pct = Math.min(value / Math.max(goal, 1), 1);
    return (
        <View style={styles.macroBar}>
            <View style={styles.macroBarHeader}>
                <Text style={styles.macroLabel}>{label}</Text>
                <Text style={[styles.macroValue, { color }]}>{Math.round(value)}{unit} / {goal}{unit}</Text>
            </View>
            <View style={styles.macroTrack}>
                <View style={[styles.macroFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
            </View>
        </View>
    );
}

// ── Week Bar Chart ────────────────────────────────────────────────────────────
function WeekChart({ data, goal }: { data: { date: string; kcal: number }[]; goal: number }) {
    const max = Math.max(goal * 1.2, ...data.map(d => d.kcal));
    const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    return (
        <View style={styles.weekChart}>
            {data.map((d, i) => {
                const h = Math.max(4, (d.kcal / max) * 80);
                const isToday = d.date === new Date().toISOString().split('T')[0];
                const isOver = d.kcal > goal;
                return (
                    <View key={d.date} style={styles.weekBar}>
                        <View style={[styles.weekBarFill, {
                            height: h,
                            backgroundColor: isToday ? ORANGE : (isOver ? '#FF3B30' : '#34C759'),
                            opacity: d.kcal === 0 ? 0.2 : 1,
                        }]} />
                        <Text style={[styles.weekBarLabel, { fontWeight: isToday ? '700' : '400' }]}>
                            {DAY_NAMES[i]}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

// ── Meal Input Modal ───────────────────────────────────────────────────────────
function MealInputModal({ visible, onClose, onAdd }: {
    visible: boolean;
    onClose: () => void;
    onAdd: (mealType: MealType, text: string, parsed: ParsedFood[]) => void;
}) {
    const { parseFoodText } = useCalorie();
    const [text, setText] = useState('');
    const [mealType, setMealType] = useState<MealType>('lunch');
    const [parsed, setParsed] = useState<ParsedFood[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [step, setStep] = useState<'input' | 'confirm'>('input');

    const handleParse = async () => {
        if (!text.trim()) return;
        setIsParsing(true);
        try {
            const foods = await parseFoodText(text);
            setParsed(foods);
            setStep('confirm');
        } finally {
            setIsParsing(false);
        }
    };

    const handleAdd = () => {
        onAdd(mealType, text, parsed);
        setText('');
        setParsed([]);
        setStep('input');
        onClose();
    };

    const totalKcal = parsed.reduce((s, f) => s + f.kcal, 0);
    const totalProtein = parsed.reduce((s, f) => s + f.protein, 0);

    const reset = () => {
        setText('');
        setParsed([]);
        setStep('input');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={reset}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={reset}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Mahlzeit eintragen</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
                        {step === 'input' ? (
                            <>
                                {/* Mahlzeit-Typ */}
                                <Text style={styles.inputLabel}>Mahlzeit</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                                    {(Object.keys(MEAL_LABELS) as MealType[]).map(m => (
                                        <TouchableOpacity
                                            key={m}
                                            style={[styles.mealTypeChip, mealType === m && { backgroundColor: MEAL_COLORS[m] }]}
                                            onPress={() => setMealType(m)}
                                        >
                                            <Text style={[styles.mealTypeChipText, mealType === m && { color: '#fff' }]}>
                                                {MEAL_LABELS[m]}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Text-Eingabe */}
                                <Text style={styles.inputLabel}>Was hast du gegessen?</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="z.B. 200g Hähnchenbrust, 150g Reis, Brokkoli"
                                    placeholderTextColor="#C0C0C0"
                                    multiline
                                    numberOfLines={5}
                                    value={text}
                                    onChangeText={setText}
                                    autoFocus
                                />
                                <Text style={styles.inputHint}>
                                    Tipp: Gib Mengen an wie „200g Hähnchen", „2 Eier", „1 EL Olivenöl"
                                </Text>

                                <TouchableOpacity
                                    style={[styles.primaryBtn, !text.trim() && { opacity: 0.4 }]}
                                    onPress={handleParse}
                                    disabled={!text.trim() || isParsing}
                                >
                                    {isParsing
                                        ? <ActivityIndicator color="#fff" />
                                        : <Text style={styles.primaryBtnText}>Analysieren →</Text>
                                    }
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                {/* Bestätigung */}
                                <View style={styles.confirmSummary}>
                                    <Text style={styles.confirmTitle}>Erkannte Lebensmittel</Text>
                                    <Text style={styles.confirmKcal}>{totalKcal} kcal · {Math.round(totalProtein)}g Protein</Text>
                                </View>

                                {parsed.map((f, i) => (
                                    <View key={i} style={styles.parsedItem}>
                                        <View style={styles.parsedItemLeft}>
                                            <Text style={styles.parsedFoodName}>{f.name}</Text>
                                            <Text style={styles.parsedFoodAmount}>{f.amount_g}g</Text>
                                        </View>
                                        <View style={styles.parsedItemRight}>
                                            <Text style={styles.parsedKcal}>{f.kcal} kcal</Text>
                                            <Text style={styles.parsedMacros}>P {f.protein}g · K {f.carbs}g · F {f.fat}g</Text>
                                        </View>
                                    </View>
                                ))}

                                {parsed.length === 0 && (
                                    <Text style={styles.noFoodsText}>
                                        Kein Lebensmittel erkannt. Versuche genauere Angaben.
                                    </Text>
                                )}

                                <View style={styles.confirmButtons}>
                                    <TouchableOpacity style={styles.backBtn} onPress={() => setStep('input')}>
                                        <Text style={styles.backBtnText}>← Ändern</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.primaryBtn, { flex: 1, marginLeft: 12 }, parsed.length === 0 && { opacity: 0.4 }]}
                                        onPress={handleAdd}
                                        disabled={parsed.length === 0}
                                    >
                                        <Text style={styles.primaryBtnText}>Hinzufügen ✓</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ── Log Entry Card ─────────────────────────────────────────────────────────────
function LogCard({ log, onDelete }: { log: CalorieLog; onDelete: () => void }) {
    const color = MEAL_COLORS[log.meal_type];
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(14);
    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));
    useEffect(() => {
        opacity.value = withTiming(1, { duration: 300 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 180 });
    }, []);

    return (
        <Animated.View style={[styles.logCard, animStyle]}>
            <View style={[styles.logCardAccent, { backgroundColor: color }]} />
            <View style={styles.logCardContent}>
                <View style={styles.logCardHeader}>
                    <Text style={styles.logMealType}>{MEAL_LABELS[log.meal_type]}</Text>
                    <TouchableOpacity onPress={onDelete}>
                        <Ionicons name="trash-outline" size={16} color={colors.muted} />
                    </TouchableOpacity>
                </View>
                {log.raw_text && (
                    <Text style={styles.logRawText} numberOfLines={1}>{log.raw_text}</Text>
                )}
                <View style={styles.logMacros}>
                    <Text style={styles.logKcal}>{Math.round(log.total_kcal)} kcal</Text>
                    <Text style={styles.logMacroDetail}>P {Math.round(log.total_protein_g)}g</Text>
                    <Text style={styles.logMacroDetail}>K {Math.round(log.total_carbs_g)}g</Text>
                    <Text style={styles.logMacroDetail}>F {Math.round(log.total_fat_g)}g</Text>
                    {log.total_iron_mg > 0 && (
                        <View style={styles.ironPill}>
                            <Ionicons name="shield-checkmark" size={10} color="#FF9500" />
                            <Text style={styles.ironText}>{log.total_iron_mg.toFixed(1)}mg Fe</Text>
                        </View>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function CalorieTrackerScreen() {
    const { goals, currentDate, setCurrentDate, getDayTotals, getLogsForDate, getWeekData, addLog, deleteLog } = useCalorie();
    const [showModal, setShowModal] = useState(false);

    // FAB entrance animation
    const fabScale = useSharedValue(0);
    const fabStyle = useAnimatedStyle(() => ({ transform: [{ scale: fabScale.value }] }));
    useEffect(() => {
        fabScale.value = withDelay(400, withSpring(1, { damping: 10, stiffness: 180 }));
    }, []);

    const totals = getDayTotals(currentDate);
    const dayLogs = getLogsForDate(currentDate);
    const weekData = getWeekData();

    const isToday = currentDate === new Date().toISOString().split('T')[0];

    const changeDate = (delta: number) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + delta);
        // Nicht in die Zukunft
        if (d > new Date()) return;
        setCurrentDate(d.toISOString().split('T')[0]);
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
        if (dateStr === today.toISOString().split('T')[0]) return 'Heute';
        if (dateStr === yesterday.toISOString().split('T')[0]) return 'Gestern';
        return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const handleAdd = async (mealType: MealType, text: string, parsed: ParsedFood[]) => {
        const totalKcal = parsed.reduce((s, f) => s + f.kcal, 0);
        const totalProtein = parsed.reduce((s, f) => s + f.protein, 0);
        const totalCarbs = parsed.reduce((s, f) => s + f.carbs, 0);
        const totalFat = parsed.reduce((s, f) => s + f.fat, 0);
        const totalIron = parsed.reduce((s, f) => s + f.iron, 0);

        await addLog({
            log_date: currentDate,
            meal_type: mealType,
            raw_text: text,
            parsed_foods: parsed,
            total_kcal: totalKcal,
            total_protein_g: totalProtein,
            total_carbs_g: totalCarbs,
            total_fat_g: totalFat,
            total_iron_mg: totalIron,
        });
    };

    const kcalPct = Math.min(totals.kcal / Math.max(goals.daily_kcal_goal, 1), 1);
    const kcalColor = kcalPct > 1.1 ? '#FF3B30' : kcalPct > 0.9 ? '#34C759' : ORANGE;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Kalorien-Tracker</Text>
                </View>

                {/* Datumsnavigation */}
                <View style={styles.dateNav}>
                    <TouchableOpacity style={styles.dateArrow} onPress={() => changeDate(-1)}>
                        <Ionicons name="chevron-back" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
                    <TouchableOpacity
                        style={[styles.dateArrow, isToday && { opacity: 0.3 }]}
                        onPress={() => changeDate(1)}
                        disabled={isToday}
                    >
                        <Ionicons name="chevron-forward" size={22} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Kalorien-Übersicht */}
                <View style={styles.ringCard}>
                    <View style={styles.ringRow}>
                        <View style={styles.ringCenter}>
                            {/* Kalorien-Box statt Ring */}
                            <View style={[styles.kcalBox, { borderColor: kcalColor }]}>
                                <Text style={[styles.ringKcal, { color: kcalColor }]}>
                                    {Math.round(totals.kcal)}
                                </Text>
                                <Text style={styles.ringKcalSub}>kcal</Text>
                                <View style={styles.kcalProgressTrack}>
                                    <View style={[styles.kcalProgressFill, { width: `${kcalPct * 100}%` as any, backgroundColor: kcalColor }]} />
                                </View>
                                <Text style={styles.kcalGoalText}>Ziel: {goals.daily_kcal_goal}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, paddingLeft: 20 }}>
                            <MacroBar label="Protein" value={totals.protein} goal={goals.protein_goal_g} color="#FA4A0C" />
                            <MacroBar label="Kohlenhydrate" value={totals.carbs} goal={goals.carbs_goal_g} color="#FF9500" />
                            <MacroBar label="Fett" value={totals.fat} goal={goals.fat_goal_g} color="#5856D6" />
                        </View>
                    </View>

                </View>

                {/* Wochendiagramm */}
                <View style={styles.weekCard}>
                    <Text style={styles.cardTitle}>7-Tage-Verlauf</Text>
                    <WeekChart data={weekData} goal={goals.daily_kcal_goal} />
                    <View style={styles.weekLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: ORANGE }]} />
                            <Text style={styles.legendText}>Heute</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
                            <Text style={styles.legendText}>Im Ziel</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
                            <Text style={styles.legendText}>Über Ziel</Text>
                        </View>
                    </View>
                </View>

                {/* Einträge des Tages */}
                <View style={styles.logsSection}>
                    <Text style={styles.cardTitle}>
                        {formatDate(currentDate)} · {dayLogs.length} Einträge
                    </Text>

                    {dayLogs.length === 0 ? (
                        <View style={styles.emptyLogs}>
                            <Ionicons name="restaurant-outline" size={48} color={colors.border} />
                            <Text style={styles.emptyLogsText}>Noch nichts eingetragen</Text>
                            <Text style={styles.emptyLogsSub}>Tippe auf + um deine erste Mahlzeit zu loggen</Text>
                        </View>
                    ) : (
                        dayLogs.map(log => (
                            <LogCard
                                key={log.id}
                                log={log}
                                onDelete={() => {
                                    Alert.alert('Eintrag löschen?', 'Dieser Eintrag wird entfernt.', [
                                        { text: 'Abbrechen', style: 'cancel' },
                                        { text: 'Löschen', style: 'destructive', onPress: () => deleteLog(log.id) },
                                    ]);
                                }}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* FAB with entrance animation */}
            <Animated.View style={[styles.fabWrapper, fabStyle]}>
                <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            </Animated.View>

            <MealInputModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onAdd={handleAdd}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 28, fontWeight: '800', color: colors.text },
    // Date Nav
    dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 16 },
    dateArrow: { padding: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    dateText: { fontSize: 18, fontWeight: '700', color: colors.text, minWidth: 120, textAlign: 'center' },

    // Kcal Card
    ringCard: { margin: 16, backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border },
    ringRow: { flexDirection: 'row', alignItems: 'center' },
    ringCenter: { alignItems: 'center', justifyContent: 'center', width: 110 },
    kcalBox: { width: 110, padding: 12, borderRadius: 16, borderWidth: 3, alignItems: 'center', backgroundColor: colors.surfaceAlt },
    kcalProgressTrack: { width: '100%', height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden', marginTop: 6 },
    kcalProgressFill: { height: 5, borderRadius: 3 },
    kcalGoalText: { fontSize: 10, color: colors.muted, marginTop: 4 },
    ringKcal: { fontSize: 22, fontWeight: '900' },
    ringKcalSub: { fontSize: 11, color: colors.muted, marginTop: 1 },

    // Macro Bars
    macroBar: { marginBottom: 10 },
    macroBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    macroLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
    macroValue: { fontSize: 12, fontWeight: '700' },
    macroTrack: { height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3, overflow: 'hidden' },
    macroFill: { height: 6, borderRadius: 3 },

    // Week Chart
    weekCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border },
    cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 16 },
    weekChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 100 },
    weekBar: { alignItems: 'center', flex: 1 },
    weekBarFill: { width: 24, borderRadius: 6, marginBottom: 6 },
    weekBarLabel: { fontSize: 11, color: colors.muted },
    weekLegend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11, color: colors.muted },

    // Logs
    logsSection: { marginHorizontal: 16 },
    emptyLogs: { alignItems: 'center', paddingVertical: 40 },
    emptyLogsText: { fontSize: 16, fontWeight: '600', color: colors.muted, marginTop: 12 },
    emptyLogsSub: { fontSize: 13, color: colors.mutedSoft, marginTop: 6, textAlign: 'center' },

    // Log Card
    logCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
    logCardAccent: { width: 4 },
    logCardContent: { flex: 1, padding: 14 },
    logCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    logMealType: { fontSize: 14, fontWeight: '700', color: colors.text },
    logRawText: { fontSize: 12, color: colors.muted, marginBottom: 6 },
    logMacros: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    logKcal: { fontSize: 15, fontWeight: '800', color: ORANGE },
    logMacroDetail: { fontSize: 12, color: colors.muted },
    ironPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.warningSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    ironText: { fontSize: 11, color: colors.warning, fontWeight: '600' },

    // FAB
    fabWrapper: { position: 'absolute', bottom: 30, right: 24 },
    fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center', shadowColor: ORANGE, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },

    // Modal
    modalContainer: { flex: 1, backgroundColor: colors.background },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
    modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },

    inputLabel: { fontSize: 13, fontWeight: '700', color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    textInput: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, fontSize: 16, color: colors.text, minHeight: 130, textAlignVertical: 'top', borderWidth: 1, borderColor: colors.border, marginBottom: 8, lineHeight: 24 },
    inputHint: { fontSize: 12, color: colors.mutedSoft, marginBottom: 24, lineHeight: 18 },

    mealTypeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
    mealTypeChipText: { fontSize: 14, fontWeight: '600', color: colors.muted },

    primaryBtn: { backgroundColor: ORANGE, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

    // Confirm
    confirmSummary: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    confirmTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
    confirmKcal: { fontSize: 14, color: ORANGE, fontWeight: '700' },
    parsedItem: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border },
    parsedItemLeft: {},
    parsedFoodName: { fontSize: 15, fontWeight: '700', color: colors.text },
    parsedFoodAmount: { fontSize: 13, color: colors.muted, marginTop: 2 },
    parsedItemRight: { alignItems: 'flex-end' },
    parsedKcal: { fontSize: 15, fontWeight: '800', color: ORANGE },
    parsedMacros: { fontSize: 12, color: colors.muted, marginTop: 2 },
    noFoodsText: { textAlign: 'center', color: colors.muted, marginVertical: 20 },
    confirmButtons: { flexDirection: 'row', marginTop: 16 },
    backBtn: { backgroundColor: colors.surfaceAlt, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    backBtnText: { color: colors.textSoft, fontSize: 15, fontWeight: '700' },
});
