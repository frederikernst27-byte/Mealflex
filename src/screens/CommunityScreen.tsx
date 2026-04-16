import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ── Unified brand colours ───────────────────────────────────────────────────
const BLUE   = '#4A8CFF';
const YELLOW = '#FFD166';
const GREEN  = '#43B97F';

type FeedTab = 'Neu' | 'Beliebt' | 'Challenge';

interface Post {
    id: string;
    author: string;
    initial: string;
    recipe: string;
    likes: number;
    tags: string[];
    color: string;
}

const FEED: Post[] = [
    { id: '1', author: 'Sarah K.',  initial: 'S', recipe: 'Avocado Toast mit Ei',     likes: 42,  tags: ['Frühstück', 'Gesund'],   color: GREEN },
    { id: '2', author: 'Max M.',    initial: 'M', recipe: 'Protein-Pancakes',          likes: 89,  tags: ['Frühstück', 'Protein'],  color: BLUE },
    { id: '3', author: 'Lena B.',   initial: 'L', recipe: 'Buddha Bowl',               likes: 134, tags: ['Vegan', 'Lunch'],        color: YELLOW },
    { id: '4', author: 'Tim R.',    initial: 'T', recipe: 'Lachs mit Quinoa',           likes: 67,  tags: ['Abendessen', 'Omega-3'], color: BLUE },
    { id: '5', author: 'Anna W.',   initial: 'A', recipe: 'Smoothie Bowl',             likes: 210, tags: ['Frühstück', 'Vegan'],    color: GREEN },
    { id: '6', author: 'Jonas F.',  initial: 'J', recipe: 'Hähnchen-Gemüse-Suppe',    likes: 55,  tags: ['Mittagessen', 'Low-Carb'], color: YELLOW },
];

const FOOD_ICONS: (keyof typeof import('@expo/vector-icons').Ionicons.glyphMap)[] = [
    'leaf-outline',
    'pizza-outline',
    'nutrition-outline',
    'fish-outline',
    'cafe-outline',
    'restaurant-outline',
];

export default function CommunityScreen() {
    const [activeTab, setActiveTab] = useState<FeedTab>('Beliebt');
    const [searchText, setSearchText] = useState('');
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

    const toggleLike = (id: string) => {
        setLikedPosts(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const visibleFeed = FEED.filter(p =>
        !searchText || p.recipe.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        // No borderBottomWidth on this SafeAreaView – prevents the separator bar
        <SafeAreaView style={styles.container}>

            {/* ── Header – flat, no bottom border ──────────────────────── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Community</Text>
                <TouchableOpacity style={styles.headerAdd} activeOpacity={0.8}>
                    <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* ── Search row ───────────────────────────────────────────── */}
            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={17} color="#ADADAD" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rezepte suchen…"
                        placeholderTextColor="#ADADAD"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
                <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
                    <Ionicons name="options-outline" size={20} color={BLUE} />
                </TouchableOpacity>
            </View>

            {/* ── Tab bar ──────────────────────────────────────────────── */}
            <View style={styles.tabsRow}>
                {(['Neu', 'Beliebt', 'Challenge'] as FeedTab[]).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.tabActive]}
                        onPress={() => setActiveTab(tab)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Feed ─────────────────────────────────────────────────── */}
            <ScrollView
                style={styles.feed}
                contentContainerStyle={styles.feedContent}
                showsVerticalScrollIndicator={false}
            >
                {visibleFeed.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={48} color="#DDD" />
                        <Text style={styles.emptyText}>Keine Rezepte gefunden</Text>
                    </View>
                ) : (
                    visibleFeed.map((post, idx) => (
                        <View key={post.id} style={styles.card}>
                            {/* Coloured illustration area */}
                            <View style={[styles.cardIllustration, { backgroundColor: post.color + '22' }]}>
                                <Ionicons
                                    name={FOOD_ICONS[idx % FOOD_ICONS.length]}
                                    size={44}
                                    color={post.color}
                                />
                            </View>

                            <View style={styles.cardBody}>
                                {/* Author */}
                                <View style={styles.authorRow}>
                                    <View style={[styles.avatar, { backgroundColor: post.color }]}>
                                        <Text style={styles.avatarText}>{post.initial}</Text>
                                    </View>
                                    <Text style={styles.authorName}>{post.author}</Text>
                                </View>

                                {/* Recipe title */}
                                <Text style={styles.recipeTitle}>{post.recipe}</Text>

                                {/* Tags */}
                                <View style={styles.tagsRow}>
                                    {post.tags.map(tag => (
                                        <View key={tag} style={[styles.tag, { backgroundColor: post.color + '22' }]}>
                                            <Text style={[styles.tagText, { color: post.color }]}>{tag}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Footer */}
                                <View style={styles.cardFooter}>
                                    <TouchableOpacity
                                        style={styles.likeBtn}
                                        onPress={() => toggleLike(post.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={likedPosts.has(post.id) ? 'heart' : 'heart-outline'}
                                            size={18}
                                            color="#FF6B9D"
                                        />
                                        <Text style={styles.likesCount}>
                                            {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveBtn} activeOpacity={0.7}>
                                        <Ionicons name="bookmark-outline" size={18} color={BLUE} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
                <View style={{ height: 24 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F5F9',
        // No border here – prevents the "Balken" (separator bar) between tab bar and content
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 14,
        backgroundColor: '#F2F5F9',
        // NO borderBottomWidth / elevation that would create a visible bar
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: BLUE,
    },
    headerAdd: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: BLUE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Search ───────────────────────────────────────────────────────────────
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
        gap: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1A1A1A',
    },
    filterBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Tabs ─────────────────────────────────────────────────────────────────
    tabsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 14,
        gap: 8,
    },
    tab: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
    },
    tabActive: {
        backgroundColor: BLUE,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
    },
    tabTextActive: {
        color: '#FFF',
    },

    // ── Feed ─────────────────────────────────────────────────────────────────
    feed: { flex: 1 },
    feedContent: {
        paddingHorizontal: 16,
        gap: 14,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#ADADAD',
        fontWeight: '500',
    },

    // ── Card ─────────────────────────────────────────────────────────────────
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        overflow: 'hidden',
    },
    cardIllustration: {
        height: 130,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBody: {
        padding: 14,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    authorName: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    recipeTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 10,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    likeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    likesCount: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    saveBtn: {
        padding: 4,
    },
});
