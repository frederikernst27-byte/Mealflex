import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Pressable, Share } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useMealplan } from '../context/MealplanContext';
import { useCommunity } from '../context/CommunityContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MealSlot } from '../types/mealplan';
import { SwipeDeckModal } from '../components/SwipeDeck';
import { mockRecipes } from '../data/mockRecipes';
import { useCalorie } from '../context/CalorieContext';

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function MacroDot({ color, label }: { color: string; label: string }) {
    return (
        <View style={styles.macroDot}>
            <View style={[styles.macroDotCircle, { backgroundColor: color }]} />
            <Text style={styles.macroDotText}>{label}</Text>
        </View>
    );
}

function MealCard({ meal, dayIndex, onSwap, onPress }: {
    meal: MealSlot;
    dayIndex: number;
    onSwap: () => void;
    onPress: () => void;
}) {
    return (
        <Pressable style={[styles.mealCard, meal.cooked && styles.mealCardCooked]} onPress={onPress}>
            <View style={styles.mealCardLeft}>
                {meal.cooked ? (
                    <View style={styles.cookedCheck}>
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                    </View>
                ) : (
                    <View style={styles.mealDot} />
                )}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.mealTitle, meal.cooked && styles.mealTitleCooked]} numberOfLines={1}>
                        {meal.recipe.title}
                    </Text>
                    <View style={styles.mealMeta}>
                        <Text style={styles.mealMetaText}>⏱ {meal.recipe.prepTime} min</Text>
                        <Text style={styles.mealMetaText}>🔥 {meal.recipe.calories} kcal</Text>
                        <Text style={styles.mealMetaText}>💪 {meal.recipe.macros.protein}g</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.swapBtn} onPress={onSwap} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="swap-horizontal" size={18} color="#FA4A0C" />
            </TouchableOpacity>
        </Pressable>
    );
}

export default function HomeScreen() {
    const { activePlan, swapMealWithRecipe } = useMealplan();
    const { getSwapQueueRecipes, swapQueueIds, communityRecipes } = useCommunity();
    const { getDayTotals, goals } = useCalorie();
    const navigation = useNavigation<any>();
    const swapPool = getSwapQueueRecipes();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTotals = getDayTotals(todayStr);
    const [swapModal, setSwapModal] = useState<{ dayIndex: number; mealSlotId: string; dayName: string } | null>(null);

    const handleSharePlan = async () => {
        if (!activePlan) return;
        const lines = activePlan.days.map(day =>
            `${DAY_NAMES[day.dayIndex]}:\n` +
            day.meals.map(m => `  • ${m.recipe.title} (${m.recipe.calories} kcal)`).join('\n')
        ).join('\n\n');
        await Share.share({
            message: `📅 MealFlex Wochenplan – Woche ${activePlan.weekNumber}\n\n${lines}`,
            title: `Mealplan Woche ${activePlan.weekNumber}`,
        });
    };

    // Swap-Kandidaten: gespeicherte Community-Rezepte, dann alle, dann Fallback auf mockRecipes
    const swapCandidates = swapPool.length > 0
        ? swapPool
        : (communityRecipes?.length > 0 ? communityRecipes : mockRecipes);

    const totalMeals = activePlan?.days.reduce((sum, d) => sum + d.meals.length, 0) ?? 0;
    const cookedMeals = activePlan?.days.reduce((sum, d) => sum + d.meals.filter(m => m.cooked).length, 0) ?? 0;
    const progress = totalMeals > 0 ? cookedMeals / totalMeals : 0;

    // Macro-Summary (Tagesdurchschnitt aus allen Rezepten im Plan)
    const allMeals = activePlan?.days.flatMap(d => d.meals) ?? [];
    const avgKcal = allMeals.length > 0
        ? Math.round(allMeals.reduce((s, m) => s + m.recipe.calories, 0) / activePlan!.days.length)
        : 0;
    const avgProtein = allMeals.length > 0
        ? Math.round(allMeals.reduce((s, m) => s + m.recipe.macros.protein, 0) / activePlan!.days.length)
        : 0;
    const avgCarbs = allMeals.length > 0
        ? Math.round(allMeals.reduce((s, m) => s + m.recipe.macros.carbs, 0) / activePlan!.days.length)
        : 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Dein Wochenplan</Text>
                        {activePlan && (
                            <Text style={styles.weekLabel}>Woche {activePlan.weekNumber}</Text>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        {activePlan && (
                            <TouchableOpacity onPress={handleSharePlan} style={styles.shareBtn}>
                                <Ionicons name="share-outline" size={18} color="#FA4A0C" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => supabase.auth.signOut()} style={styles.logoutBtn}>
                            <Ionicons name="log-out-outline" size={16} color="#FA4A0C" />
                            <Text style={styles.logoutText}>Ausloggen</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Cards */}
                {activePlan && (
                    <>
                        {/* Macro Summary */}
                        <View style={styles.macroCard}>
                            <Text style={styles.macroCardTitle}>⌀ pro Tag diese Woche</Text>
                            <View style={styles.macroRow}>
                                <View style={styles.macroItem}>
                                    <Text style={styles.macroValue}>{avgKcal}</Text>
                                    <Text style={styles.macroUnit}>kcal</Text>
                                </View>
                                <View style={styles.macroDivider} />
                                <View style={styles.macroItem}>
                                    <Text style={[styles.macroValue, { color: '#4CAF50' }]}>{avgProtein}g</Text>
                                    <Text style={styles.macroUnit}>Protein</Text>
                                </View>
                                <View style={styles.macroDivider} />
                                <View style={styles.macroItem}>
                                    <Text style={[styles.macroValue, { color: '#2196F3' }]}>{avgCarbs}g</Text>
                                    <Text style={styles.macroUnit}>Carbs</Text>
                                </View>
                            </View>
                        </View>

                        {/* Progress Card */}
                        <View style={styles.progressCard}>
                            <View style={styles.progressTop}>
                                <Text style={styles.progressLabel}>Wochenfortschritt</Text>
                                <Text style={styles.progressCount}>{cookedMeals} / {totalMeals} Mahlzeiten</Text>
                            </View>
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                            </View>
                            {swapQueueIds.length > 0 && (
                                <View style={styles.swapHint}>
                                    <Ionicons name="swap-horizontal" size={13} color="#FA4A0C" />
                                    <Text style={styles.swapHintText}>
                                        {swapQueueIds.length} Community-Rezept{swapQueueIds.length > 1 ? 'e' : ''} für Swap priorisiert
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                )}

                {/* Kalorien-Widget (E14-T13) */}
                <TouchableOpacity
                    style={styles.kcalWidget}
                    onPress={() => navigation.navigate('Tracker')}
                    activeOpacity={0.8}
                >
                    <View style={styles.kcalWidgetLeft}>
                        <Ionicons name="flame" size={20} color="#FA4A0C" />
                        <Text style={styles.kcalWidgetLabel}>Heute</Text>
                    </View>
                    <View style={styles.kcalWidgetCenter}>
                        <Text style={styles.kcalWidgetValue}>
                            {Math.round(todayTotals.kcal).toLocaleString('de-DE')}
                            <Text style={styles.kcalWidgetGoal}> / {goals.daily_kcal_goal} kcal</Text>
                        </Text>
                        <View style={styles.kcalWidgetTrack}>
                            <View style={[styles.kcalWidgetFill, {
                                width: `${Math.min(todayTotals.kcal / Math.max(goals.daily_kcal_goal, 1) * 100, 100)}%` as any,
                                backgroundColor: todayTotals.kcal > goals.daily_kcal_goal ? '#FF3B30' : '#FA4A0C',
                            }]} />
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CCC" />
                </TouchableOpacity>

                {/* Empty State */}
                {!activePlan && (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyEmoji}>📋</Text>
                        <Text style={styles.emptyTitle}>Noch kein Mealplan</Text>
                        <Text style={styles.emptyText}>Starte das Onboarding, um deinen personalisierten Wochenplan zu erstellen.</Text>
                        <TouchableOpacity
                            style={styles.ctaBtn}
                            onPress={() => navigation.navigate('Onboarding')}
                        >
                            <Text style={styles.ctaBtnText}>Onboarding starten</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Days */}
                {activePlan?.days.map((day) => (
                    <View key={day.date} style={styles.daySection}>
                        {/* Day Header */}
                        <View style={styles.dayHeader}>
                            <View style={styles.dayTag}>
                                <Text style={styles.dayTagText}>{DAY_NAMES[day.dayIndex]}</Text>
                            </View>
                            <Text style={styles.dayDate}>{day.date}</Text>
                            <View style={styles.dayLine} />
                        </View>

                        {/* Meals */}
                        <View style={styles.mealsContainer}>
                            {day.meals.map((meal) => (
                                <MealCard
                                    key={meal.id}
                                    meal={meal}
                                    dayIndex={day.dayIndex}
                                    onPress={() => navigation.navigate('RecipeDetail', { dayIndex: day.dayIndex, mealSlot: meal })}
                                    onSwap={() => setSwapModal({ dayIndex: day.dayIndex, mealSlotId: meal.id, dayName: DAY_NAMES[day.dayIndex] })}
                                />
                            ))}
                        </View>
                    </View>
                ))}

                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Tinder Swipe Deck für Rezept-Swap */}
            {swapModal && (
                <SwipeDeckModal
                    visible={true}
                    recipes={swapCandidates}
                    dayName={swapModal.dayName}
                    onClose={() => setSwapModal(null)}
                    onAccept={(recipe) => {
                        swapMealWithRecipe(swapModal.dayIndex, swapModal.mealSlotId, recipe);
                        setSwapModal(null);
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F7F7F7' },
    scroll: { paddingBottom: 32 },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: '#FFF',
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    greeting: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5 },
    weekLabel: { fontSize: 13, color: '#999', marginTop: 2 },
    shareBtn: { padding: 8, borderRadius: 20, backgroundColor: '#FFF5F2', borderWidth: 1, borderColor: '#FFD5C8' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#FFF5F2', borderWidth: 1, borderColor: '#FFD5C8' },
    logoutText: { fontSize: 13, color: '#FA4A0C', fontWeight: '700' },

    progressCard: {
        backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16, borderRadius: 18,
        padding: 18, gap: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    progressLabel: { fontSize: 14, fontWeight: '600', color: '#555' },
    progressCount: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
    progressTrack: { height: 8, backgroundColor: '#F0F0F0', borderRadius: 4 },
    progressFill: { height: 8, backgroundColor: '#FA4A0C', borderRadius: 4 },
    swapHint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    swapHintText: { fontSize: 12, color: '#FA4A0C', fontWeight: '600' },

    macroCard: {
        backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16, borderRadius: 18,
        padding: 18,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    macroCardTitle: { fontSize: 12, color: '#999', fontWeight: '600', marginBottom: 12 },
    macroRow: { flexDirection: 'row', alignItems: 'center' },
    macroItem: { flex: 1, alignItems: 'center', gap: 2 },
    macroValue: { fontSize: 22, fontWeight: '800', color: '#FF6B35' },
    macroUnit: { fontSize: 11, color: '#AAA', fontWeight: '500' },
    macroDivider: { width: 1, height: 36, backgroundColor: '#F0F0F0' },

    emptyCard: {
        backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 32,
        alignItems: 'center', gap: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    emptyEmoji: { fontSize: 56, marginBottom: 4 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
    emptyText: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 21 },
    ctaBtn: {
        marginTop: 8, backgroundColor: '#FA4A0C', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16,
        shadowColor: '#FA4A0C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    ctaBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

    daySection: { marginTop: 20, paddingHorizontal: 16 },
    dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    dayTag: { backgroundColor: '#1A1A1A', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    dayTagText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
    dayDate: { fontSize: 13, color: '#999' },
    dayLine: { flex: 1, height: 1, backgroundColor: '#EBEBEB' },

    mealsContainer: { gap: 8 },
    mealCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
        borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    },
    mealCardCooked: { backgroundColor: '#F0FAF1' },
    mealCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    mealDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FA4A0C' },
    cookedCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
    mealTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
    mealTitleCooked: { color: '#4CAF50', textDecorationLine: 'line-through' },
    mealMeta: { flexDirection: 'row', gap: 10 },
    mealMetaText: { fontSize: 12, color: '#999' },
    swapBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#FFF5F2', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#FFD5C8',
    },

    macroDot: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    macroDotCircle: { width: 8, height: 8, borderRadius: 4 },
    macroDotText: { fontSize: 11, color: '#666' },

    // Kalorien-Widget
    kcalWidget: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16,
        borderRadius: 18, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    kcalWidgetLeft: { alignItems: 'center', gap: 2 },
    kcalWidgetLabel: { fontSize: 10, color: '#999', fontWeight: '600' },
    kcalWidgetCenter: { flex: 1 },
    kcalWidgetValue: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
    kcalWidgetGoal: { fontSize: 12, fontWeight: '400', color: '#AAA' },
    kcalWidgetTrack: { height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
    kcalWidgetFill: { height: 4, borderRadius: 2 },
});
