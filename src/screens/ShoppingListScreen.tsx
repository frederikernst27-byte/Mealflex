import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useMealplan } from '../context/MealplanContext';
import { aggregateShoppingList } from '../utils/ingredientParser';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../context/SubscriptionContext';
import { colors } from '../theme';

export default function ShoppingListScreen() {
    const { activePlan, checkedIngredients, toggleShoppingItem } = useMealplan();
    const navigation = useNavigation<any>();
    const { requirePro } = useSubscription();

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
                        <Ionicons name="cart-outline" size={64} color={colors.border} />
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
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { padding: 24, paddingBottom: 16, backgroundColor: colors.background },
    title: { fontSize: 32, fontWeight: '800', color: colors.primary },
    subtitle: { fontSize: 16, color: colors.muted, marginTop: 4, fontWeight: '500' },
    progressContainer: { backgroundColor: colors.background, paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
    bringBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 20,
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    bringBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
    progressTrack: { height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 4 },
    scrollArea: { flex: 1 },
    scrollContent: { padding: 20 },
    emptyContainer: { padding: 60, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: colors.textSoft, fontSize: 20, fontWeight: '600', marginTop: 16 },
    emptySubText: { color: colors.muted, fontSize: 16, marginTop: 8 },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    itemCardChecked: {
        backgroundColor: colors.surfaceAlt,
        opacity: 0.7,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.muted,
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.success,
        borderColor: colors.success,
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
        color: colors.text,
    },
    itemAmount: {
        fontSize: 16,
        color: colors.muted,
        fontWeight: '500',
    },
    itemTextChecked: {
        textDecorationLine: 'line-through',
        color: colors.muted,
    }
});
