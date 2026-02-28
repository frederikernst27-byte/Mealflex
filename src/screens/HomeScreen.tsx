import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useMealplan } from '../context/MealplanContext';

export default function HomeScreen() {
    const { activePlan } = useMealplan();

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
                                <View key={meal.id} style={styles.mealContainer}>
                                    <Text style={styles.recipeTitle}>{meal.recipe.title}</Text>
                                    <Text style={styles.recipeMeta}>
                                        ⏱ {meal.recipe.prepTime} Min  •  🔥 {meal.recipe.calories} kcal
                                    </Text>
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
    },
    recipeTitle: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 6 },
    recipeMeta: { fontSize: 14, color: '#666' },
    logoutContainer: { marginTop: 30, alignItems: 'center', paddingBottom: 40 },
    logoutButton: { padding: 16 },
    logoutText: { color: '#FA4A0C', fontWeight: '600', fontSize: 16 },
});
