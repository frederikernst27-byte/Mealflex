import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMealplan } from '../context/MealplanContext';
import { Ionicons } from '@expo/vector-icons';
import { MealSlot } from '../types/mealplan';

export default function RecipeDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const {
        toggleCookedStatus,
        likedRecipes,
        dislikedRecipes,
        favoriteRecipes,
        toggleLike,
        toggleDislike,
        toggleFavorite
    } = useMealplan();

    const { dayIndex, mealSlot }: { dayIndex: number, mealSlot: MealSlot } = route.params;
    const { recipe } = mealSlot;

    const isLiked = likedRecipes.includes(recipe.id);
    const isDisliked = dislikedRecipes.includes(recipe.id);
    const isFavorite = favoriteRecipes.includes(recipe.id);

    const handleToggleCooked = () => {
        toggleCookedStatus(dayIndex, mealSlot.id, !mealSlot.cooked);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rezept</Text>
                <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(recipe.id)}>
                    <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#4A8CFF" : "#333"} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollArea}>
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{recipe.title}</Text>
                        <View style={styles.feedbackContainer}>
                            <TouchableOpacity style={[styles.feedbackButton, isLiked && styles.feedbackActiveLike]} onPress={() => toggleLike(recipe.id)}>
                                <Ionicons name={isLiked ? "thumbs-up" : "thumbs-up-outline"} size={20} color={isLiked ? "#FFF" : "#666"} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.feedbackButton, isDisliked && styles.feedbackActiveDislike]} onPress={() => toggleDislike(recipe.id)}>
                                <Ionicons name={isDisliked ? "thumbs-down" : "thumbs-down-outline"} size={20} color={isDisliked ? "#FFF" : "#666"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.description}>{recipe.description}</Text>

                    <View style={styles.metaContainer}>
                        <View style={styles.metaBadge}>
                            <Ionicons name="time-outline" size={16} color="#4A8CFF" />
                            <Text style={styles.metaText}>{recipe.prepTime} Min</Text>
                        </View>
                        <View style={styles.metaBadge}>
                            <Ionicons name="flame-outline" size={16} color="#4A8CFF" />
                            <Text style={styles.metaText}>{recipe.calories} kcal</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Zutaten ({recipe.portions} Portion)</Text>
                    <View style={styles.ingredientsBox}>
                        {recipe.ingredients.map((ing, idx) => (
                            <View key={idx} style={styles.ingredientRow}>
                                <Text style={styles.ingredientName}>• {ing.name}</Text>
                                <Text style={styles.ingredientAmount}>{ing.amount} {ing.unit}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Zubereitung</Text>
                    {recipe.steps.map((step, idx) => (
                        <View key={idx} style={styles.stepRow}>
                            <View style={styles.stepNumberBadge}>
                                <Text style={styles.stepNumberText}>{idx + 1}</Text>
                            </View>
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))}

                    <View style={styles.macrosContainer}>
                        <Text style={styles.sectionTitle}>Makros</Text>
                        <View style={styles.macrosRow}>
                            <View style={styles.macroCard}><Text style={styles.macroValue}>{recipe.macros.protein}g</Text><Text style={styles.macroLabel}>Protein</Text></View>
                            <View style={styles.macroCard}><Text style={styles.macroValue}>{recipe.macros.carbs}g</Text><Text style={styles.macroLabel}>Carbs</Text></View>
                            <View style={styles.macroCard}><Text style={styles.macroValue}>{recipe.macros.fat}g</Text><Text style={styles.macroLabel}>Fat</Text></View>
                        </View>
                    </View>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.footerAction}>
                <TouchableOpacity
                    style={[styles.primaryButton, mealSlot.cooked && styles.cookedButton]}
                    onPress={handleToggleCooked}
                >
                    <Ionicons name={mealSlot.cooked ? "checkmark-done-circle" : "checkmark-circle-outline"} size={22} color="#FFF" />
                    <Text style={styles.primaryButtonText}>
                        {mealSlot.cooked ? 'Als ungekocht markieren' : 'Als gekocht markieren'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
    favoriteButton: { padding: 8 },
    scrollArea: { flex: 1 },
    content: { padding: 24 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    title: { flex: 1, fontSize: 32, fontWeight: '800', color: '#111', marginRight: 16 },
    feedbackContainer: { flexDirection: 'row', gap: 8 },
    feedbackButton: { padding: 10, backgroundColor: '#F0F0F0', borderRadius: 20 },
    feedbackActiveLike: { backgroundColor: '#4CAF50' },
    feedbackActiveDislike: { backgroundColor: '#F44336' },
    description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 16 },
    metaContainer: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    metaBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF3FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    metaText: { color: '#4A8CFF', fontWeight: 'bold', marginLeft: 6, fontSize: 14 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 16, marginTop: 12 },
    ingredientsBox: { backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20, marginBottom: 24 },
    ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    ingredientName: { fontSize: 16, color: '#444' },
    ingredientAmount: { fontSize: 16, fontWeight: '600', color: '#111' },
    stepRow: { flexDirection: 'row', marginBottom: 16 },
    stepNumberBadge: { backgroundColor: '#4A8CFF', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16, marginTop: 2 },
    stepNumberText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    stepText: { flex: 1, fontSize: 16, color: '#333', lineHeight: 24 },
    macrosContainer: { marginTop: 20, padding: 20, backgroundColor: '#FAFAFA', borderRadius: 16, borderWidth: 1, borderColor: '#EEE' },
    macrosRow: { flexDirection: 'row', justifyContent: 'space-around' },
    macroCard: { alignItems: 'center' },
    macroValue: { fontSize: 20, fontWeight: '800', color: '#333' },
    macroLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase', marginTop: 4 },
    footerAction: { padding: 24, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    primaryButton: { backgroundColor: '#4A8CFF', flexDirection: 'row', borderRadius: 14, padding: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#4A8CFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    cookedButton: { backgroundColor: '#4CAF50', shadowColor: '#4CAF50' },
    primaryButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700', marginLeft: 10 },
});
