import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Pressable, Share, Alert, Modal } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay } from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import { useMealplan } from '../context/MealplanContext';
import { useCommunity } from '../context/CommunityContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MealSlot } from '../types/mealplan';
import { SwipeDeckModal } from '../components/SwipeDeck';
import { mockRecipes } from '../data/mockRecipes';
import { useCalorie } from '../context/CalorieContext';
import { aggregateShoppingList } from '../utils/ingredientParser';
import { useSubscription } from '../context/SubscriptionContext';
import { colors } from '../theme';

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
    const { activePlan, swapMealWithRecipe, checkedIngredients, toggleShoppingItem } = useMealplan();
    const { getSwapQueueRecipes, swapQueueIds, communityRecipes } = useCommunity();
    const { getDayTotals, goals } = useCalorie();
    const { requirePro, unlockEasterEgg } = useSubscription();
    const navigation = useNavigation<any>();
    const swapPool = getSwapQueueRecipes();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTotals = getDayTotals(todayStr);
    const [swapModal, setSwapModal] = useState<{ dayIndex: number; mealSlotId: string; dayName: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'plan' | 'shopping'>('plan');

    // Easter egg
    const [eggVisible, setEggVisible] = useState(false);
    const [weekTaps, setWeekTaps] = useState(0);
    const lastTapRef = React.useRef(0);
    const eggOpacity = useSharedValue(0);
    const eggScale = useSharedValue(0.2);
    const badgeScale = useSharedValue(0);
    const star1Y = useSharedValue(0);
    const star2Y = useSharedValue(0);
    const star3Y = useSharedValue(0);

    const dismissEgg = () => {
        eggOpacity.value = withTiming(0, { duration: 600 });
        setTimeout(() => setEggVisible(false), 650);
    };

    const triggerEgg = async () => {
        setEggVisible(true);
        eggOpacity.value = withTiming(1, { duration: 400 });
        eggScale.value = withSpring(1, { damping: 7, stiffness: 100 });
        badgeScale.value = withDelay(300, withSpring(1, { damping: 6, stiffness: 120 }));
        star1Y.value = withDelay(200, withSpring(-80, { damping: 8, stiffness: 80 }));
        star2Y.value = withDelay(350, withSpring(-120, { damping: 8, stiffness: 80 }));
        star3Y.value = withDelay(500, withSpring(-60, { damping: 8, stiffness: 80 }));
        await unlockEasterEgg();
        setTimeout(dismissEgg, 4500);
    };

    const handleWeekTap = () => {
        const now = Date.now();
        const newCount = now - lastTapRef.current > 3000 ? 1 : weekTaps + 1;
        lastTapRef.current = now;
        setWeekTaps(newCount);
        if (newCount >= 7) {
            setWeekTaps(0);
            triggerEgg();
        }
    };

    const eggOverlayStyle = useAnimatedStyle(() => ({ opacity: eggOpacity.value }));
    const eggCardStyle = useAnimatedStyle(() => ({ transform: [{ scale: eggScale.value }] }));
    const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: badgeScale.value }] }));
    const star1Style = useAnimatedStyle(() => ({ transform: [{ translateY: star1Y.value }] }));
    const star2Style = useAnimatedStyle(() => ({ transform: [{ translateY: star2Y.value }] }));
    const star3Style = useAnimatedStyle(() => ({ transform: [{ translateY: star3Y.value }] }));

    const shoppingList = useMemo(() => {
        if (!activePlan) return [];
        const allIngredients = activePlan.days.flatMap(day =>
            day.meals.flatMap(meal => meal.recipe.ingredients)
        );
        return aggregateShoppingList(allIngredients);
    }, [activePlan]);
    const shoppingProgress = shoppingList.length === 0 ? 0 :
        (checkedIngredients.length / shoppingList.length) * 100;

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

    const handleBringExport = async () => {
        if (!requirePro('Bring!-Export', () => navigation.navigate('Profile', { screen: 'Pricing' }))) return;
        const unchecked = shoppingList.filter(
            item => !checkedIngredients.includes(`${item.name}-${item.unit}`)
        );
        if (unchecked.length === 0) {
            Alert.alert('Alles erledigt', 'Alle Artikel sind bereits abgehakt.');
            return;
        }
        const text = unchecked
            .map(item => `• ${item.amount} ${item.unit} ${item.name}`)
            .join('\n');
        try {
            await Share.share({
                message: `MealFlex Einkaufsliste\n\n${text}`,
                title: 'MealFlex Einkaufsliste',
            });
        } catch {
            Alert.alert('Fehler', 'Export konnte nicht gestartet werden.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Dein Wochenplan</Text>
                    {activePlan && (
                        <TouchableOpacity onPress={handleWeekTap} activeOpacity={1}>
                            <Text style={styles.weekLabel}>Woche {activePlan.weekNumber}</Text>
                        </TouchableOpacity>
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

            {/* Segment Control */}
            <View style={styles.segmentBar}>
                <TouchableOpacity style={[styles.segBtn, activeTab === 'plan' && styles.segBtnActive]} onPress={() => setActiveTab('plan')}>
                    <Text style={[styles.segBtnText, activeTab === 'plan' && styles.segBtnTextActive]}>Wochenplan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.segBtn, activeTab === 'shopping' && styles.segBtnActive]} onPress={() => setActiveTab('shopping')}>
                    <Text style={[styles.segBtnText, activeTab === 'shopping' && styles.segBtnTextActive]}>Einkauf</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'shopping' ? (
                <ScrollView style={styles.shopScroll} showsVerticalScrollIndicator={false}>
                    {!activePlan || shoppingList.length === 0 ? (
                        <View style={styles.shopEmpty}>
                            <Ionicons name="cart-outline" size={64} color={colors.border} />
                            <Text style={styles.shopEmptyText}>Deine Liste ist leer.</Text>
                            <Text style={[styles.shopEmptyText, { fontSize: 14 }]}>Generiere erst einen Mealplan!</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.shopSubtitle}>
                                Woche {activePlan.weekNumber} • {checkedIngredients.length} / {shoppingList.length} gekauft
                            </Text>
                            <View style={styles.shopProgress}>
                                <View style={[styles.shopProgressFill, { width: `${shoppingProgress}%` as any }]} />
                            </View>
                            <TouchableOpacity style={styles.bringBtn} onPress={handleBringExport}>
                                <Ionicons name="cart" size={16} color="#FFF" />
                                <Text style={styles.bringBtnText}>Zu Bring! exportieren</Text>
                            </TouchableOpacity>
                            {shoppingList.map((item) => {
                                const key = `${item.name}-${item.unit}`;
                                const isChecked = checkedIngredients.includes(key);
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        style={[styles.itemCard, isChecked && styles.itemCardChecked]}
                                        onPress={() => toggleShoppingItem(key)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                                            {isChecked && <Ionicons name="checkmark" size={16} color="#FFF" />}
                                        </View>
                                        <View style={styles.itemInfo}>
                                            <Text style={[styles.itemName, isChecked && styles.itemTextChecked]}>{item.name}</Text>
                                            <Text style={[styles.itemAmount, isChecked && styles.itemTextChecked]}>{item.amount} {item.unit}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                            <View style={{ height: 32 }} />
                        </>
                    )}
                </ScrollView>
            ) : (
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={true} alwaysBounceVertical={true}>

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
                    <Ionicons name="chevron-forward" size={16} color={colors.muted} />
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
            )}

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

            {/* Easter Egg Overlay */}
            <Modal visible={eggVisible} transparent animationType="none" onRequestClose={dismissEgg}>
                <Animated.View style={[eggStyles.overlay, eggOverlayStyle]}>
                    {/* Floating stars */}
                    <Animated.Text style={[eggStyles.star, { left: '20%' }, star1Style]}>⭐</Animated.Text>
                    <Animated.Text style={[eggStyles.star, { left: '50%' }, star2Style]}>✨</Animated.Text>
                    <Animated.Text style={[eggStyles.star, { left: '75%' }, star3Style]}>⭐</Animated.Text>

                    <Animated.View style={[eggStyles.card, eggCardStyle]}>
                        <Text style={eggStyles.egg}>🥚</Text>
                        <Text style={eggStyles.title}>Easter Egg gefunden!</Text>
                        <Text style={eggStyles.sub}>Du hast das Geheimnis entdeckt.</Text>
                        <Animated.View style={[eggStyles.badge, badgeStyle]}>
                            <Text style={eggStyles.badgeText}>✦ MEALFLEX PRO – KOSTENLOS ✦</Text>
                        </Animated.View>
                        <Text style={eggStyles.hint}>Pro wurde dauerhaft freigeschaltet 🎉</Text>
                        <TouchableOpacity onPress={dismissEgg} style={eggStyles.closeBtn}>
                            <Text style={eggStyles.closeBtnText}>Weiter</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scrollView: { flex: 1 },
    scroll: { paddingBottom: 32 },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: colors.background,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    greeting: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
    weekLabel: { fontSize: 13, color: colors.muted, marginTop: 2 },
    shareBtn: { padding: 8, borderRadius: 20, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary },
    logoutText: { fontSize: 13, color: colors.primary, fontWeight: '700' },

    progressCard: {
        backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 18,
        padding: 18, gap: 10, borderWidth: 1, borderColor: colors.border,
    },
    progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    progressLabel: { fontSize: 14, fontWeight: '600', color: colors.muted },
    progressCount: { fontSize: 14, fontWeight: '700', color: colors.text },
    progressTrack: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4 },
    progressFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
    swapHint: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    swapHintText: { fontSize: 12, color: colors.primary, fontWeight: '600' },

    macroCard: {
        backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 18,
        padding: 18, borderWidth: 1, borderColor: colors.border,
    },
    macroCardTitle: { fontSize: 12, color: colors.muted, fontWeight: '600', marginBottom: 12 },
    macroRow: { flexDirection: 'row', alignItems: 'center' },
    macroItem: { flex: 1, alignItems: 'center', gap: 2 },
    macroValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
    macroUnit: { fontSize: 11, color: colors.muted, fontWeight: '500' },
    macroDivider: { width: 1, height: 36, backgroundColor: colors.border },

    emptyCard: {
        backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 32,
        alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border,
    },
    emptyEmoji: { fontSize: 56, marginBottom: 4 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
    emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21 },
    ctaBtn: {
        marginTop: 8, backgroundColor: colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16,
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    ctaBtnText: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },

    daySection: { marginTop: 20, paddingHorizontal: 16 },
    dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    dayTag: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    dayTagText: { color: colors.onPrimary, fontWeight: '800', fontSize: 12 },
    dayDate: { fontSize: 13, color: colors.muted },
    dayLine: { flex: 1, height: 1, backgroundColor: colors.border },

    mealsContainer: { gap: 8 },
    mealCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
        borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border,
    },
    mealCardCooked: { backgroundColor: colors.successSoft, borderColor: 'transparent' },
    mealCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    mealDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
    cookedCheck: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
    mealTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
    mealTitleCooked: { color: colors.success, textDecorationLine: 'line-through' },
    mealMeta: { flexDirection: 'row', gap: 10 },
    mealMetaText: { fontSize: 12, color: colors.muted },
    swapBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: colors.primary,
    },

    macroDot: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    macroDotCircle: { width: 8, height: 8, borderRadius: 4 },
    macroDotText: { fontSize: 11, color: colors.muted },

    // Kalorien-Widget
    kcalWidget: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16,
        borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border,
    },
    kcalWidgetLeft: { alignItems: 'center', gap: 2 },
    kcalWidgetLabel: { fontSize: 10, color: colors.muted, fontWeight: '600' },
    kcalWidgetCenter: { flex: 1 },
    kcalWidgetValue: { fontSize: 16, fontWeight: '800', color: colors.text },
    kcalWidgetGoal: { fontSize: 12, fontWeight: '400', color: colors.muted },
    kcalWidgetTrack: { height: 4, backgroundColor: colors.surfaceAlt, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
    kcalWidgetFill: { height: 4, borderRadius: 2 },

    segmentBar: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, marginBottom: 4, backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 3 },
    segBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
    segBtnActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 },
    segBtnText: { fontSize: 14, fontWeight: '600', color: colors.muted },
    segBtnTextActive: { color: colors.text, fontWeight: '700' },

    shopSubtitle: { fontSize: 13, color: colors.muted, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
    shopProgress: { height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3, marginHorizontal: 20, marginBottom: 12, overflow: 'hidden' },
    shopProgressFill: { height: 6, backgroundColor: colors.success, borderRadius: 3 },
    bringBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, marginHorizontal: 20, paddingVertical: 12, borderRadius: 16, marginBottom: 16 },
    bringBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
    shopScroll: { flex: 1 },
    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 10, marginHorizontal: 20, borderWidth: 1, borderColor: colors.border },
    itemCardChecked: { backgroundColor: colors.surfaceAlt, opacity: 0.7 },
    checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.muted, marginRight: 16, alignItems: 'center', justifyContent: 'center' },
    checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
    itemInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemName: { fontSize: 16, fontWeight: '600', color: colors.text },
    itemAmount: { fontSize: 16, color: colors.muted, fontWeight: '500' },
    itemTextChecked: { textDecorationLine: 'line-through', color: colors.muted },
    shopEmpty: { alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12 },
    shopEmptyText: { fontSize: 18, fontWeight: '600', color: colors.muted },
});

const eggStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    star: {
        position: 'absolute',
        bottom: '45%',
        fontSize: 28,
    },
    card: {
        backgroundColor: '#1A1A2E',
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 24,
        borderWidth: 1.5,
        borderColor: '#FFD700',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 20,
    },
    egg: { fontSize: 64 },
    title: { fontSize: 24, fontWeight: '800', color: '#FFD700', textAlign: 'center' },
    sub: { fontSize: 15, color: '#AAA', textAlign: 'center' },
    badge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 4,
    },
    badgeText: { fontSize: 13, fontWeight: '800', color: '#000', letterSpacing: 1 },
    hint: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 4 },
    closeBtn: {
        marginTop: 8,
        backgroundColor: '#FFD700',
        paddingHorizontal: 36,
        paddingVertical: 14,
        borderRadius: 16,
    },
    closeBtnText: { color: '#000', fontWeight: '800', fontSize: 16 },
});
