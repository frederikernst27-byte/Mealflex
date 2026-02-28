import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useMealplan } from '../context/MealplanContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const { activePlan, swapMeal } = useMealplan();
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.title}>Dein Mealplan</Text>
                <Text style={styles.subtitle}>
                    {activePlan ? `Woche ${activePlan.weekNumber}` : 'Kein aktiver Plan'}
                </Text>
            </View>

            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
                {!activePlan ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Es wurde noch kein Plan generiert.</Text>
                    </View>
                ) : (
                    activePlan.days.map((day) => (
                        <View key={day.date} style={styles.dayCard}>
                            <Text style={styles.dayTitle}>{day.date}</Text>
                            {day.meals.map((meal) => (
                                <View key={meal.id}>
                                    <TouchableOpacity
                                        style={[styles.mealContainer, meal.cooked && styles.mealCooked]}
                                        onPress={() => navigation.navigate('RecipeDetail', { dayIndex: day.dayIndex, mealSlot: meal })}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.mealInfo}>
                                            <View style={styles.titleRow}>
                                                {meal.cooked && <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={{ marginRight: 6 }} />}
                                                <Text style={[styles.recipeTitle, meal.cooked && styles.textCooked]}>{meal.recipe.title}</Text>
                                            </View>
                                            <Text style={styles.recipeMeta}>
                                                ⏱ {meal.recipe.prepTime} Min  •  🔥 {meal.recipe.calories} kcal
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.swapButton}
                                            onPress={() => swapMeal(day.dayIndex, meal.id)}
                                        >
                                            <Ionicons name="swap-horizontal" size={20} color="#FA4A0C" />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ))
                )}

                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutButton} onPress={() => supabase.auth.signOut()}>
                        <Text style={styles.logoutText}>Ausloggen</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { padding: 24, paddingBottom: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    title: { fontSize: 32, fontWeight: '800', color: '#FA4A0C' },
    subtitle: { fontSize: 16, color: '#666', marginTop: 4, fontWeight: '500' },
    scrollArea: { flex: 1 },
    scrollContent: { padding: 20 },
    emptyContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#888', fontSize: 16 },
    dayCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    dayTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 },
    mealContainer: {
        backgroundColor: '#F6F6F9',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mealCooked: {
        backgroundColor: '#E8F5E9',
        opacity: 0.8,
    },
    mealInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    recipeTitle: { fontSize: 16, fontWeight: '600', color: '#222' },
    textCooked: { color: '#2E7D32', textDecorationLine: 'line-through' },
    recipeMeta: { fontSize: 14, color: '#666' },
    swapButton: {
        backgroundColor: '#FFF',
        width: 40, height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FA4A0C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1
    },
    logoutContainer: { marginTop: 30, alignItems: 'center', paddingBottom: 40 },
    logoutButton: { padding: 16 },
    logoutText: { color: '#FA4A0C', fontWeight: '600', fontSize: 16 },
});
