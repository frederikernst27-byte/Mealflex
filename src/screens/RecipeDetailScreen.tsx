import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, Share, Image, Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMealplan } from '../context/MealplanContext';
import { useCalorie } from '../context/CalorieContext';
import { Ionicons } from '@expo/vector-icons';
import { MealSlot } from '../types/mealplan';
import { Recipe } from '../types/recipe';
import { colors } from '../theme';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = width * 0.75;

export default function RecipeDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const {
        toggleCookedStatus,
        likedRecipes,
        dislikedRecipes,
        favoriteRecipes,
        toggleLike,
        toggleDislike,
        toggleFavorite,
    } = useMealplan();

    const params = route.params ?? {};
    const mealSlot = params.mealSlot as MealSlot | undefined;
    const dayIndex = typeof params.dayIndex === 'number' ? params.dayIndex : 0;
    const communityRecipe = params.communityRecipe as Recipe | undefined;
    const recipe = mealSlot?.recipe ?? communityRecipe;

    if (!recipe) {
        return (
            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.overlayBtn, { top: insets.top + 12 }]}>
                    <Ionicons name="arrow-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.center}>
                    <Text style={styles.sectionTitle}>Rezept konnte nicht geladen werden.</Text>
                </View>
            </View>
        );
    }

    const isLiked = likedRecipes.includes(recipe.id);
    const isDisliked = dislikedRecipes.includes(recipe.id);
    const isFavorite = favoriteRecipes.includes(recipe.id);

    const { addLog } = useCalorie();

    const handleShareIngredients = async () => {
        const lines = recipe.ingredients.map(ing => `• ${ing.amount} ${ing.unit} ${ing.name}`).join('\n');
        await Share.share({
            message: `🛒 Zutaten für „${recipe.title}" (${recipe.portions} Portion)\n\n${lines}`,
            title: recipe.title,
        });
    };

    const handleToggleCooked = () => {
        if (!mealSlot) return;
        const newCooked = !mealSlot.cooked;
        toggleCookedStatus(dayIndex, mealSlot.id, newCooked);

        if (newCooked && recipe.calories > 0) {
            Alert.alert(
                '🍽️ In Tracker übernehmen?',
                `Möchtest du "${recipe.title}" (${recipe.calories} kcal) automatisch in deinen Kalorien-Tracker eintragen?`,
                [
                    { text: 'Nein', style: 'cancel', onPress: () => navigation.goBack() },
                    {
                        text: 'Ja, eintragen',
                        onPress: () => {
                            addLog({
                                log_date: new Date().toISOString().split('T')[0],
                                meal_type: 'lunch',
                                raw_text: recipe.title,
                                parsed_foods: [{
                                    name: recipe.title,
                                    amount_g: 0,
                                    kcal: recipe.calories,
                                    protein: recipe.macros.protein,
                                    carbs: recipe.macros.carbs,
                                    fat: recipe.macros.fat,
                                    iron: 0,
                                }],
                                total_kcal: recipe.calories,
                                total_protein_g: recipe.macros.protein,
                                total_carbs_g: recipe.macros.carbs,
                                total_fat_g: recipe.macros.fat,
                                total_iron_mg: 0,
                            });
                            navigation.goBack();
                        },
                    },
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    const topOffset = insets.top + 12;

    return (
        <View style={styles.safeArea}>
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    {recipe.imageUrl ? (
                        <Image source={{ uri: recipe.imageUrl }} style={styles.heroImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.heroImage, styles.heroPlaceholder]}>
                            <Text style={styles.heroEmoji}>🍽️</Text>
                        </View>
                    )}
                    {/* Gradient-like dark overlay at bottom of image */}
                    <View style={styles.heroGradient} pointerEvents="none" />
                </View>

                {/* Content Card */}
                <View style={styles.card}>
                    {/* Title + Like/Dislike */}
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{recipe.title}</Text>
                        <View style={styles.feedbackRow}>
                            <TouchableOpacity
                                style={[styles.feedbackBtn, isLiked && styles.feedbackLiked]}
                                onPress={() => toggleLike(recipe.id)}
                            >
                                <Ionicons name={isLiked ? 'thumbs-up' : 'thumbs-up-outline'} size={18} color={isLiked ? '#FFF' : colors.muted} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.feedbackBtn, isDisliked && styles.feedbackDisliked]}
                                onPress={() => toggleDislike(recipe.id)}
                            >
                                <Ionicons name={isDisliked ? 'thumbs-down' : 'thumbs-down-outline'} size={18} color={isDisliked ? '#FFF' : colors.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Cuisine / Tags */}
                    {(recipe.cuisine || recipe.prepTime) && (
                        <View style={styles.subtitleRow}>
                            {recipe.cuisine && (
                                <View style={styles.subtitleChip}>
                                    <Ionicons name="location-outline" size={13} color={colors.muted} />
                                    <Text style={styles.subtitleText}>{recipe.cuisine}</Text>
                                </View>
                            )}
                            <View style={styles.subtitleChip}>
                                <Ionicons name="time-outline" size={13} color={colors.muted} />
                                <Text style={styles.subtitleText}>{recipe.prepTime} Min</Text>
                            </View>
                        </View>
                    )}

                    {/* Macro Row */}
                    <View style={styles.macroRow}>
                        <View style={styles.macroItem}>
                            <Text style={styles.macroValue}>{recipe.calories}</Text>
                            <Text style={styles.macroLabel}>kcal</Text>
                        </View>
                        <View style={styles.macroDivider} />
                        <View style={styles.macroItem}>
                            <Text style={styles.macroValue}>{recipe.macros.protein}</Text>
                            <Text style={styles.macroLabel}>Protein</Text>
                        </View>
                        <View style={styles.macroDivider} />
                        <View style={styles.macroItem}>
                            <Text style={styles.macroValue}>{recipe.macros.fat}</Text>
                            <Text style={styles.macroLabel}>Fett</Text>
                        </View>
                        <View style={styles.macroDivider} />
                        <View style={styles.macroItem}>
                            <Text style={styles.macroValue}>{recipe.macros.carbs}</Text>
                            <Text style={styles.macroLabel}>Carbs</Text>
                        </View>
                    </View>

                    {/* Description */}
                    {recipe.description ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Beschreibung</Text>
                            <Text style={styles.description}>{recipe.description}</Text>
                        </View>
                    ) : null}

                    {/* Ingredients */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Zutaten ({recipe.portions} Portion)</Text>
                        <View style={styles.ingredientsBox}>
                            {recipe.ingredients.map((ing, idx) => (
                                <View key={idx} style={[styles.ingredientRow, idx < recipe.ingredients.length - 1 && styles.ingredientRowBorder]}>
                                    <Text style={styles.ingredientName}>{ing.name}</Text>
                                    <Text style={styles.ingredientAmount}>{ing.amount} {ing.unit}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Steps */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Zubereitung</Text>
                        {recipe.steps.map((step, idx) => (
                            <View key={idx} style={styles.stepRow}>
                                <View style={styles.stepBadge}>
                                    <Text style={styles.stepBadgeText}>{idx + 1}</Text>
                                </View>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>

            {/* Overlay Buttons (back + favorite) */}
            <TouchableOpacity style={[styles.overlayBtn, { top: topOffset, left: 16 }]} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.overlayBtn, { top: topOffset, right: 16 }]} onPress={() => toggleFavorite(recipe.id)}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? colors.primary : colors.text} />
            </TouchableOpacity>

            {/* Fixed Bottom Action */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
                <TouchableOpacity style={styles.cartBtn} onPress={handleShareIngredients}>
                    <Ionicons name="cart-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
                {mealSlot ? (
                    <TouchableOpacity
                        style={[styles.primaryBtn, mealSlot.cooked && styles.cookedBtn]}
                        onPress={handleToggleCooked}
                    >
                        <Ionicons name={mealSlot.cooked ? 'checkmark-done-circle' : 'checkmark-circle-outline'} size={20} color="#FFF" />
                        <Text style={styles.primaryBtnText}>
                            {mealSlot.cooked ? 'Als ungekocht markieren' : 'Als gekocht markieren'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back-circle-outline" size={20} color="#FFF" />
                        <Text style={styles.primaryBtnText}>Zurück</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scroll: { flex: 1 },

    heroContainer: { width, height: HERO_HEIGHT, position: 'relative' },
    heroImage: { width, height: HERO_HEIGHT },
    heroPlaceholder: { backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    heroEmoji: { fontSize: 72 },
    heroGradient: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
        backgroundColor: 'transparent',
        // fades image into card below via background — subtle shadow effect
    },

    overlayBtn: {
        position: 'absolute',
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.92)',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
        zIndex: 10,
    },

    card: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        marginTop: -24,
        paddingHorizontal: 20,
        paddingTop: 24,
    },

    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    title: { flex: 1, fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginRight: 12 },
    feedbackRow: { flexDirection: 'row', gap: 8 },
    feedbackBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    feedbackLiked: { backgroundColor: colors.success },
    feedbackDisliked: { backgroundColor: colors.danger },

    subtitleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    subtitleChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    subtitleText: { fontSize: 13, color: colors.muted },

    macroRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.surface, borderRadius: 18,
        paddingVertical: 16, marginBottom: 24,
        borderWidth: 1, borderColor: colors.border,
    },
    macroItem: { flex: 1, alignItems: 'center', gap: 3 },
    macroValue: { fontSize: 20, fontWeight: '800', color: colors.text },
    macroLabel: { fontSize: 11, color: colors.muted, fontWeight: '500' },
    macroDivider: { width: 1, height: 32, backgroundColor: colors.border },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
    description: { fontSize: 15, color: colors.muted, lineHeight: 23 },

    ingredientsBox: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
    ingredientRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    ingredientName: { fontSize: 15, color: colors.textSoft },
    ingredientAmount: { fontSize: 15, fontWeight: '600', color: colors.text },

    stepRow: { flexDirection: 'row', gap: 14, marginBottom: 14 },
    stepBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
    stepBadgeText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
    stepText: { flex: 1, fontSize: 15, color: colors.textSoft, lineHeight: 23 },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: colors.background,
        paddingHorizontal: 20, paddingTop: 14,
        borderTopWidth: 1, borderTopColor: colors.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
    },
    cartBtn: {
        width: 52, height: 52, borderRadius: 16,
        backgroundColor: colors.primarySoft,
        borderWidth: 1.5, borderColor: colors.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    primaryBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: colors.primary, borderRadius: 16, height: 52,
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    cookedBtn: { backgroundColor: colors.success, shadowColor: colors.success },
    primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
