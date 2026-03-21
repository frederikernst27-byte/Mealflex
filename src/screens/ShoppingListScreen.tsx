import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useMealplan } from '../context/MealplanContext';
import { aggregateShoppingList } from '../utils/ingredientParser';
import { Ionicons } from '@expo/vector-icons';

export default function ShoppingListScreen() {
    const { activePlan, checkedIngredients, toggleShoppingItem } = useMealplan();

    const shoppingList = useMemo(() => {
        if (!activePlan) return [];
        // Extract all ingredients from all meals in the active plan
        const allIngredients = activePlan.days.flatMap(day =>
            day.meals.flatMap(meal => meal.recipe.ingredients)
        );
        return aggregateShoppingList(allIngredients);
    }, [activePlan]);

    const progress = shoppingList.length === 0 ? 0 :
        (checkedIngredients.length / shoppingList.length) * 100;

    const handleBringExport = async () => {
        const unchecked = shoppingList.filter(
            item => !checkedIngredients.includes(`${item.name}-${item.unit}`)
        );
        if (unchecked.length === 0) {
            Alert.alert('Alles erledigt! ✅', 'Alle Artikel sind bereits abgehakt.');
            return;
        }
        const text = unchecked
            .map(item => `• ${item.amount} ${item.unit} ${item.name}`)
            .join('\n');
        try {
            await Share.share({
                message: `🛒 MealFlex Einkaufsliste\n\n${text}`,
                title: 'MealFlex Einkaufsliste',
            });
        } catch {
            Alert.alert('Fehler', 'Export konnte nicht gestartet werden.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.title}>Einkaufsliste</Text>
                {activePlan && (
                    <Text style={styles.subtitle}>
                        Woche {activePlan.weekNumber} • {checkedIngredients.length} / {shoppingList.length} gekauft
                    </Text>
                )}
            </View>

            {shoppingList.length > 0 && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <TouchableOpacity style={styles.bringBtn} onPress={handleBringExport}>
                        <Ionicons name="cart" size={16} color="#FFF" />
                        <Text style={styles.bringBtnText}>Zu Bring! exportieren</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
                {!activePlan || shoppingList.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={64} color="#DDD" />
                        <Text style={styles.emptyText}>Deine Liste ist leer.</Text>
                        <Text style={styles.emptySubText}>Generiere erst einen Mealplan!</Text>
                    </View>
                ) : (
                    shoppingList.map((item) => {
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
                                    <Text style={[styles.itemName, isChecked && styles.itemTextChecked]}>
                                        {item.name}
                                    </Text>
                                    <Text style={[styles.itemAmount, isChecked && styles.itemTextChecked]}>
                                        {item.amount} {item.unit}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { padding: 24, paddingBottom: 16, backgroundColor: '#FFF' },
    title: { fontSize: 32, fontWeight: '800', color: '#FA4A0C' },
    subtitle: { fontSize: 16, color: '#666', marginTop: 4, fontWeight: '500' },
    progressContainer: { backgroundColor: '#FFF', paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', gap: 12 },
    bringBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#FA4A0C', paddingVertical: 12, borderRadius: 20,
        shadowColor: '#FA4A0C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    bringBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
    progressTrack: { height: 8, backgroundColor: '#EFEFEF', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 4 },
    scrollArea: { flex: 1 },
    scrollContent: { padding: 20 },
    emptyContainer: { padding: 60, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#555', fontSize: 20, fontWeight: '600', marginTop: 16 },
    emptySubText: { color: '#888', fontSize: 16, marginTop: 8 },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    itemCardChecked: {
        backgroundColor: '#F0F0F0',
        opacity: 0.7,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#CCC',
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    itemInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    itemAmount: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    itemTextChecked: {
        textDecorationLine: 'line-through',
        color: '#999',
    }
});
