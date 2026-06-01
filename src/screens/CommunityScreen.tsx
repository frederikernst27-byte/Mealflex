import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    TextInput, Image, FlatList, Pressable, ActivityIndicator, RefreshControl,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCommunity, CommunityRecipe } from '../context/CommunityContext';
import { colors } from '../theme';

const FILTERS = [
    { id: 'high-protein', label: '💪 High Protein' },
    { id: 'vegan', label: '🌱 Vegan' },
    { id: 'keto', label: '⚡ Keto' },
    { id: 'low-carb', label: '✂️ Low Carb' },
    { id: 'quick', label: '⏱ Quick' },
    { id: 'bulk', label: '🏋️ Bulk' },
    { id: 'breakfast', label: '🌅 Frühstück' },
    { id: 'mealprep-friendly', label: '📦 Mealprep' },
    { id: 'asiatisch', label: '🍜 Asiatisch' },
    { id: 'italienisch', label: '🍝 Italienisch' },
    { id: 'mediterran', label: '🫒 Mediterran' },
];

function MacroPill({ icon, value, color }: { icon: string; value: string; color: string }) {
    return (
        <View style={[styles.macroPill, { backgroundColor: color + '18' }]}>
            <Text style={[styles.macroPillText, { color }]}>{icon} {value}</Text>
        </View>
    );
}

function RecipeCard({ recipe }: { recipe: CommunityRecipe }) {
    const navigation = useNavigation<any>();
    const {
        savedRecipeIds, likedRecipeIds, swapQueueIds,
        toggleSave, toggleLikeCommunity, addToSwapQueue, removeFromSwapQueue,
    } = useCommunity();

    const isSaved = savedRecipeIds.includes(recipe.id);
    const isLiked = likedRecipeIds.includes(recipe.id);
    const isInSwap = swapQueueIds.includes(recipe.id);

    const likeScale = useSharedValue(1);
    const likeAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: likeScale.value }] }));

    const handleLike = () => {
        likeScale.value = withSequence(
            withTiming(1.4, { duration: 120 }),
            withSpring(1, { damping: 4, stiffness: 300 })
        );
        toggleLikeCommunity(recipe.id);
    };

    return (
        <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('RecipeDetail', { communityRecipe: recipe })}
        >
            {/* Image */}
            <View style={styles.imageContainer}>
                {recipe.imageUrl ? (
                    <Image source={{ uri: recipe.imageUrl }} style={styles.cardImage} />
                ) : (
                    <View style={[styles.cardImage, styles.imagePlaceholder]}>
                        <Text style={styles.placeholderEmoji}>🍽️</Text>
                    </View>
                )}
                    {/* Status & Source Badges */}
                {recipe.sourceType === 'official' ? (
                    <View style={styles.officialBadge}>
                        <Ionicons name="shield-checkmark" size={11} color="#FFF" />
                        <Text style={styles.officialBadgeText}>MealFlex</Text>
                    </View>
                ) : recipe.status === 'pending' ? (
                    <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>⏳ In Prüfung</Text>
                    </View>
                ) : null}
                {/* Save Button overlaid on image */}
                <TouchableOpacity
                    style={[styles.saveOverlay, isSaved && styles.saveOverlayActive]}
                    onPress={() => toggleSave(recipe.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={18} color={isSaved ? '#FA4A0C' : '#FFF'} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
                {/* Author + cuisine */}
                <View style={styles.cardMeta}>
                    <View style={styles.authorRow}>
                        <Ionicons
                            name={recipe.sourceType === 'official' ? 'shield-checkmark' : 'person-circle-outline'}
                            size={13}
                            color={recipe.sourceType === 'official' ? colors.primary : colors.muted}
                        />
                        <Text style={[styles.authorText, recipe.sourceType === 'official' && styles.authorOfficial]}>
                            {recipe.authorName}
                        </Text>
                    </View>
                    {recipe.cuisine && <Text style={styles.cuisineText}>{recipe.cuisine}</Text>}
                </View>

                {/* Title */}
                <Text style={styles.cardTitle} numberOfLines={2}>{recipe.title}</Text>

                {/* Macros */}
                <View style={styles.macroRow}>
                    <MacroPill icon="🔥" value={`${recipe.calories} kcal`} color={colors.primary} />
                    <MacroPill icon="💪" value={`${recipe.macros.protein}g`} color={colors.protein} />
                    <MacroPill icon="⏱" value={`${recipe.prepTime} min`} color={colors.carbs} />
                </View>

                {/* Actions */}
                <View style={styles.actionBar}>
                    {/* Like */}
                    <TouchableOpacity style={styles.likeBtn} onPress={handleLike}>
                        <Animated.View style={likeAnimStyle}>
                            <Ionicons
                                name={isLiked ? 'heart' : 'heart-outline'}
                                size={22}
                                color={isLiked ? '#E53935' : colors.muted}
                            />
                        </Animated.View>
                        <Text style={[styles.likeCount, isLiked && { color: '#E53935' }]}>
                            {recipe.likeCount}
                        </Text>
                    </TouchableOpacity>

                    {/* Swap Button */}
                    <TouchableOpacity
                        style={[styles.swapCTA, isInSwap && styles.swapCTAActive]}
                        onPress={() => isInSwap ? removeFromSwapQueue(recipe.id) : addToSwapQueue(recipe.id)}
                    >
                        <Ionicons
                            name={isInSwap ? 'checkmark' : 'swap-horizontal'}
                            size={15}
                            color={isInSwap ? '#FFF' : '#FA4A0C'}
                        />
                        <Text style={[styles.swapCTAText, isInSwap && styles.swapCTATextActive]}>
                            {isInSwap ? 'Im Swap' : 'Zum Swap'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Pressable>
    );
}

export default function CommunityScreen() {
    const navigation = useNavigation<any>();
    const {
        swapQueueIds,
        searchQuery, setSearchQuery,
        activeFilters, setActiveFilters,
        getFilteredFeed, getAutosuggestions,
        isLoading, refreshFeed,
    } = useCommunity();

    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const feed = getFilteredFeed();

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshFeed();
        setRefreshing(false);
    };
    const suggestions = getAutosuggestions(inputValue);

    const handleSuggestion = (s: string) => {
        setInputValue(s);
        setSearchQuery(s);
        setShowSuggestions(false);
    };

    const clearSearch = () => {
        setInputValue('');
        setSearchQuery('');
        setShowSuggestions(false);
    };

    const toggleFilter = (id: string) => {
        setActiveFilters(
            activeFilters.includes(id) ? activeFilters.filter(f => f !== id) : [...activeFilters, id]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                data={feed}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <View>
                        {/* Header */}
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.title}>Community</Text>
                                <Text style={styles.subtitle}>{feed.length} Rezepte entdecken</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.uploadBtn}
                                onPress={() => navigation.navigate('RecipeUpload')}
                            >
                                <Ionicons name="add" size={22} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View style={styles.searchWrapper}>
                            <View style={styles.searchBar}>
                                <Ionicons name="search-outline" size={18} color={colors.muted} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Suchen: vegan, keto, asiatisch..."
                                    placeholderTextColor={colors.mutedSoft}
                                    value={inputValue}
                                    onChangeText={t => { setInputValue(t); setShowSuggestions(t.length > 0); }}
                                    onSubmitEditing={() => { setSearchQuery(inputValue); setShowSuggestions(false); }}
                                    returnKeyType="search"
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                />
                                {inputValue.length > 0 && (
                                    <TouchableOpacity onPress={clearSearch}>
                                        <Ionicons name="close-circle" size={18} color={colors.muted} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Autosuggest */}
                            {showSuggestions && suggestions.length > 0 && (
                                <View style={styles.suggestions}>
                                    {suggestions.map(s => (
                                        <TouchableOpacity
                                            key={s}
                                            style={styles.suggestionRow}
                                            onPress={() => handleSuggestion(s)}
                                        >
                                            <Ionicons name="trending-up-outline" size={14} color="#FA4A0C" />
                                            <Text style={styles.suggestionText}>{s}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Filter Chips */}
                        <View style={styles.filterArea}>
                            {activeFilters.length > 0 && (
                                <TouchableOpacity
                                    style={styles.clearFiltersBtn}
                                    onPress={() => setActiveFilters([])}
                                >
                                    <Ionicons name="close" size={12} color="#FA4A0C" />
                                    <Text style={styles.clearFiltersText}>Filter löschen</Text>
                                </TouchableOpacity>
                            )}
                            <FlatList
                                horizontal
                                data={FILTERS}
                                keyExtractor={f => f.id}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filterList}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.filterChip, activeFilters.includes(item.id) && styles.filterChipOn]}
                                        onPress={() => toggleFilter(item.id)}
                                    >
                                        <Text style={[styles.filterChipText, activeFilters.includes(item.id) && styles.filterChipTextOn]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>

                        {/* Swap-Queue Info */}
                        {swapQueueIds.length > 0 && (
                            <View style={styles.swapInfoBanner}>
                                <Ionicons name="swap-horizontal" size={16} color="#FA4A0C" />
                                <Text style={styles.swapInfoText}>
                                    {swapQueueIds.length} Rezept{swapQueueIds.length > 1 ? 'e' : ''} für deinen Swap vorgemerkt
                                </Text>
                            </View>
                        )}
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FA4A0C" />
                }
                renderItem={({ item }) => <RecipeCard recipe={item} />}
                ListEmptyComponent={
                    isLoading ? (
                        <View style={styles.empty}>
                            <ActivityIndicator size="large" color="#FA4A0C" />
                            <Text style={styles.emptyTitle}>Rezepte laden…</Text>
                        </View>
                    ) : (
                    <View style={styles.empty}>
                        <Text style={styles.emptyEmoji}>🔍</Text>
                        <Text style={styles.emptyTitle}>Keine Rezepte gefunden</Text>
                        <Text style={styles.emptyText}>Versuche einen anderen Suchbegriff oder entferne Filter.</Text>
                    </View>
                    )
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    listContent: { paddingBottom: 32 },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: colors.background,
    },
    title: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
    subtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
    uploadBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
        shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },

    searchWrapper: { backgroundColor: colors.background, paddingHorizontal: 16, paddingBottom: 12, position: 'relative', zIndex: 10 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: colors.surfaceAlt, borderRadius: 14,
        paddingHorizontal: 14, paddingVertical: 11,
        borderWidth: 1, borderColor: colors.border,
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.text },
    suggestions: {
        position: 'absolute', top: 52, left: 16, right: 16, zIndex: 100,
        backgroundColor: colors.surfaceElevated, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
        overflow: 'hidden',
    },
    suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
    suggestionText: { fontSize: 14, color: colors.textSoft, fontWeight: '500' },

    filterArea: { backgroundColor: colors.background, paddingBottom: 12 },
    clearFiltersBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 16, marginBottom: 8 },
    clearFiltersText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
    filterList: { paddingHorizontal: 16, gap: 8 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
    filterChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterChipText: { fontSize: 13, color: colors.muted, fontWeight: '500' },
    filterChipTextOn: { color: colors.onPrimary, fontWeight: '600' },

    swapInfoBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginHorizontal: 16, marginTop: 12, marginBottom: 4,
        backgroundColor: colors.primarySoft, borderRadius: 12, padding: 12,
        borderLeftWidth: 3, borderLeftColor: colors.primary,
    },
    swapInfoText: { fontSize: 13, color: colors.primary, fontWeight: '600', flex: 1 },

    // Card
    card: {
        backgroundColor: colors.surface, borderRadius: 20, marginHorizontal: 16, marginTop: 14,
        borderWidth: 1, borderColor: colors.border,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 3,
        overflow: 'hidden',
    },
    imageContainer: { position: 'relative' },
    cardImage: { width: '100%', height: 200 },
    imagePlaceholder: { backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    placeholderEmoji: { fontSize: 56 },
    pendingBadge: {
        position: 'absolute', top: 12, left: 12,
        backgroundColor: 'rgba(255,150,0,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    },
    pendingBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
    saveOverlay: {
        position: 'absolute', top: 12, right: 12,
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center',
    },
    saveOverlayActive: { backgroundColor: colors.primarySoft },

    cardContent: { padding: 16 },
    cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    authorText: { fontSize: 12, color: colors.muted, fontWeight: '500' },
    authorOfficial: { color: colors.primary, fontWeight: '700' },
    cuisineText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
    officialBadge: {
        position: 'absolute', top: 12, left: 12,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    },
    officialBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
    cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text, lineHeight: 24, marginBottom: 12 },

    macroRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
    macroPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    macroPillText: { fontSize: 12, fontWeight: '700' },

    actionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    likeCount: { fontSize: 14, color: colors.muted, fontWeight: '600' },
    swapCTA: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20,
        backgroundColor: colors.primarySoft, borderWidth: 1.5, borderColor: colors.primary,
    },
    swapCTAActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    swapCTAText: { fontSize: 13, fontWeight: '700', color: colors.primary },
    swapCTATextActive: { color: colors.onPrimary },

    empty: { alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12 },
    emptyEmoji: { fontSize: 52 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 20 },
});
