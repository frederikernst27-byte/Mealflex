import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    FlatList, Image, ScrollView, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCommunity, CommunityRecipe } from '../context/CommunityContext';

const GOAL_FILTERS = [
    { value: 'all', label: 'Alle' },
    { value: 'cut', label: '🔥 Cut' },
    { value: 'muscle', label: '💪 Muskel' },
    { value: 'healthy', label: '🥗 Gesund' },
];

const TAG_FILTERS = [
    { value: 'high-protein', label: 'High Protein' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'keto', label: 'Keto' },
    { value: 'low-carb', label: 'Low Carb' },
    { value: 'quick', label: 'Quick' },
    { value: 'mealprep-friendly', label: 'Mealprep' },
];

function SavedCard({ recipe, isInSwap, onUnsave, onToggleSwap }: {
    recipe: CommunityRecipe;
    isInSwap: boolean;
    onUnsave: () => void;
    onToggleSwap: () => void;
}) {
    const navigation = useNavigation<any>();

    return (
        <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('RecipeDetail', { communityRecipe: recipe })}
        >
            {/* Thumbnail */}
            {recipe.imageUrl ? (
                <Image source={{ uri: recipe.imageUrl }} style={styles.thumb} />
            ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                    <Text style={styles.thumbEmoji}>🍽️</Text>
                </View>
            )}

            {/* Content */}
            <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{recipe.title}</Text>
                    <TouchableOpacity onPress={onUnsave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="bookmark" size={20} color="#FA4A0C" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.cardMeta}>
                    ⏱ {recipe.prepTime} min · 🔥 {recipe.calories} kcal · 💪 {recipe.macros.protein}g P
                </Text>

                {recipe.cuisine && (
                    <Text style={styles.cuisineLabel}>{recipe.cuisine}</Text>
                )}

                {/* Swap Toggle */}
                <TouchableOpacity
                    style={[styles.swapToggle, isInSwap && styles.swapToggleActive]}
                    onPress={onToggleSwap}
                >
                    <Ionicons
                        name={isInSwap ? 'checkmark-circle' : 'add-circle-outline'}
                        size={16}
                        color={isInSwap ? '#FFF' : '#FA4A0C'}
                    />
                    <Text style={[styles.swapToggleText, isInSwap && styles.swapToggleTextActive]}>
                        {isInSwap ? 'Im Swap ✓' : 'Zum Swap hinzufügen'}
                    </Text>
                </TouchableOpacity>
            </View>
        </Pressable>
    );
}

export default function SavedRecipesScreen() {
    const navigation = useNavigation<any>();
    const { getSavedRecipes, swapQueueIds, addToSwapQueue, removeFromSwapQueue, toggleSave } = useCommunity();

    const [goalFilter, setGoalFilter] = useState('all');
    const [activeTags, setActiveTags] = useState<string[]>([]);

    const all = getSavedRecipes();
    const filtered = all.filter(r => {
        if (goalFilter !== 'all' && !r.suitableGoals.includes(goalFilter as any)) return false;
        if (activeTags.length > 0 && !activeTags.every(t => r.tags.includes(t))) return false;
        return true;
    });

    const toggleTag = (t: string) =>
        setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

    const swapCount = swapQueueIds.filter(id => all.some(r => r.id === id)).length;

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View>
                        {/* Header */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.title}>Gespeichert</Text>
                                <Text style={styles.subtitle}>{all.length} Rezepte</Text>
                            </View>
                            {swapCount > 0 && (
                                <View style={styles.swapBadge}>
                                    <Ionicons name="swap-horizontal" size={14} color="#FA4A0C" />
                                    <Text style={styles.swapBadgeText}>{swapCount} im Swap</Text>
                                </View>
                            )}
                        </View>

                        {/* Swap Banner */}
                        {swapCount > 0 && (
                            <View style={styles.swapBanner}>
                                <Ionicons name="information-circle-outline" size={18} color="#FA4A0C" />
                                <Text style={styles.swapBannerText}>
                                    {swapCount} Rezept{swapCount > 1 ? 'e werden' : ' wird'} beim nächsten Swap priorisiert!
                                </Text>
                            </View>
                        )}

                        {/* Goal Filter */}
                        <View style={styles.filterSection}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                                {GOAL_FILTERS.map(f => (
                                    <TouchableOpacity
                                        key={f.value}
                                        style={[styles.filterChip, goalFilter === f.value && styles.filterChipOn]}
                                        onPress={() => setGoalFilter(f.value)}
                                    >
                                        <Text style={[styles.filterChipText, goalFilter === f.value && styles.filterChipTextOn]}>
                                            {f.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterRow, { marginTop: 6 }]}>
                                {TAG_FILTERS.map(t => (
                                    <TouchableOpacity
                                        key={t.value}
                                        style={[styles.tagChip, activeTags.includes(t.value) && styles.tagChipOn]}
                                        onPress={() => toggleTag(t.value)}
                                    >
                                        <Text style={[styles.tagChipText, activeTags.includes(t.value) && styles.tagChipTextOn]}>
                                            #{t.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <SavedCard
                        recipe={item}
                        isInSwap={swapQueueIds.includes(item.id)}
                        onUnsave={() => toggleSave(item.id)}
                        onToggleSwap={() =>
                            swapQueueIds.includes(item.id)
                                ? removeFromSwapQueue(item.id)
                                : addToSwapQueue(item.id)
                        }
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyEmoji}>🔖</Text>
                        <Text style={styles.emptyTitle}>
                            {all.length === 0 ? 'Noch nichts gespeichert' : 'Keine Treffer'}
                        </Text>
                        <Text style={styles.emptyText}>
                            {all.length === 0
                                ? 'Tippe auf das Lesezeichen in der Community, um Rezepte zu speichern.'
                                : 'Passe die Filter an.'}
                        </Text>
                        {all.length === 0 && (
                            <TouchableOpacity
                                style={styles.discoverBtn}
                                onPress={() => navigation.navigate('Community')}
                            >
                                <Text style={styles.discoverBtnText}>Community entdecken</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F7F7F7' },
    listContent: { paddingBottom: 32 },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, backgroundColor: '#FFF',
    },
    title: { fontSize: 30, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: '#999', marginTop: 2 },
    swapBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: '#FFF5F2', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
        borderWidth: 1, borderColor: '#FFD5C8',
    },
    swapBadgeText: { fontSize: 12, color: '#FA4A0C', fontWeight: '700' },

    swapBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#FFF5F2', marginHorizontal: 16, marginTop: 8, marginBottom: 4,
        padding: 12, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#FA4A0C',
    },
    swapBannerText: { flex: 1, fontSize: 13, color: '#FA4A0C', fontWeight: '600' },

    filterSection: { backgroundColor: '#FFF', paddingBottom: 14, paddingTop: 8 },
    filterRow: { paddingHorizontal: 16, gap: 8 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F4F4F6' },
    filterChipOn: { backgroundColor: '#1A1A1A' },
    filterChipText: { fontSize: 13, color: '#555', fontWeight: '500' },
    filterChipTextOn: { color: '#FFF', fontWeight: '600' },
    tagChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F4F4F6', borderWidth: 1, borderColor: '#EBEBEB' },
    tagChipOn: { backgroundColor: '#FFF5F2', borderColor: '#FA4A0C' },
    tagChipText: { fontSize: 12, color: '#777' },
    tagChipTextOn: { color: '#FA4A0C', fontWeight: '600' },

    // Card
    card: {
        flexDirection: 'row', backgroundColor: '#FFF',
        borderRadius: 18, marginHorizontal: 16, marginTop: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        overflow: 'hidden',
    },
    thumb: { width: 110, height: 130 },
    thumbPlaceholder: { backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
    thumbEmoji: { fontSize: 36 },
    cardBody: { flex: 1, padding: 14, gap: 5 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1A1A1A', lineHeight: 21 },
    cardMeta: { fontSize: 12, color: '#888' },
    cuisineLabel: { fontSize: 11, color: '#FA4A0C', fontWeight: '600' },
    swapToggle: {
        flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4,
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
        backgroundColor: '#F4F4F6', borderWidth: 1, borderColor: '#E8E8E8', alignSelf: 'flex-start',
    },
    swapToggleActive: { backgroundColor: '#FA4A0C', borderColor: '#FA4A0C' },
    swapToggleText: { fontSize: 12, color: '#555', fontWeight: '600' },
    swapToggleTextActive: { color: '#FFF' },

    empty: { alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12 },
    emptyEmoji: { fontSize: 56 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
    emptyText: { fontSize: 14, color: '#999', textAlign: 'center', lineHeight: 20 },
    discoverBtn: {
        marginTop: 8, paddingHorizontal: 24, paddingVertical: 13,
        backgroundColor: '#FA4A0C', borderRadius: 16,
    },
    discoverBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
