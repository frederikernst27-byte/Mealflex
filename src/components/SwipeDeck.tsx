import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue, useAnimatedStyle, withSpring, withTiming,
    interpolate, Extrapolation, runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../types/recipe';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;
const ORANGE = '#FA4A0C';

// ── Recipe Card Content ────────────────────────────────────────────────────────
function RecipeCardContent({ recipe }: { recipe: Recipe }) {
    return (
        <View style={cardStyles.card}>
            {/* Image */}
            {recipe.imageUrl ? (
                <Image source={{ uri: recipe.imageUrl }} style={cardStyles.image} />
            ) : (
                <View style={cardStyles.imagePlaceholder}>
                    <Text style={cardStyles.imagePlaceholderEmoji}>🍽️</Text>
                    <Text style={cardStyles.imagePlaceholderText}>{recipe.cuisine ?? 'Rezept'}</Text>
                </View>
            )}

            {/* Content */}
            <View style={cardStyles.content}>
                {recipe.cuisine && (
                    <View style={cardStyles.cuisineTag}>
                        <Text style={cardStyles.cuisineText}>{recipe.cuisine}</Text>
                    </View>
                )}
                <Text style={cardStyles.title} numberOfLines={2}>{recipe.title}</Text>
                <Text style={cardStyles.description} numberOfLines={2}>{recipe.description}</Text>

                {/* Macro Pills */}
                <View style={cardStyles.macroRow}>
                    <View style={[cardStyles.macroPill, { backgroundColor: '#FFF3EE' }]}>
                        <Text style={[cardStyles.macroValue, { color: ORANGE }]}>{recipe.calories}</Text>
                        <Text style={cardStyles.macroUnit}>kcal</Text>
                    </View>
                    <View style={[cardStyles.macroPill, { backgroundColor: '#EEF9F0' }]}>
                        <Text style={[cardStyles.macroValue, { color: '#34C759' }]}>{recipe.macros.protein}g</Text>
                        <Text style={cardStyles.macroUnit}>Protein</Text>
                    </View>
                    <View style={[cardStyles.macroPill, { backgroundColor: '#EEF0FF' }]}>
                        <Text style={[cardStyles.macroValue, { color: '#5856D6' }]}>{recipe.prepTime} min</Text>
                        <Text style={cardStyles.macroUnit}>Zeit</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

// ── Single Swipe Card ─────────────────────────────────────────────────────────
function SwipeCard({
    recipe, onSwipeRight, onSwipeLeft, isTop, stackOffset,
}: {
    recipe: Recipe;
    onSwipeRight: (r: Recipe) => void;
    onSwipeLeft: (r: Recipe) => void;
    isTop: boolean;
    stackOffset: number;
}) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    // Reset when recipe changes (new top card)
    useEffect(() => {
        translateX.value = 0;
        translateY.value = 0;
    }, [recipe.id]);

    const handleRight = () => onSwipeRight(recipe);
    const handleLeft = () => onSwipeLeft(recipe);

    const panGesture = Gesture.Pan()
        .enabled(isTop)
        .onUpdate(e => {
            translateX.value = e.translationX;
            translateY.value = e.translationY * 0.3;
        })
        .onEnd(e => {
            if (e.translationX > SWIPE_THRESHOLD) {
                translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 280 }, () => {
                    runOnJS(handleRight)();
                });
            } else if (e.translationX < -SWIPE_THRESHOLD) {
                translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 280 }, () => {
                    runOnJS(handleLeft)();
                });
            } else {
                translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
                translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
            }
        });

    const cardStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateX.value,
            [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            [-15, 0, 15],
            Extrapolation.CLAMP
        );
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value + stackOffset * 10 },
                { rotate: `${rotate}deg` },
                { scale: 1 - stackOffset * 0.04 },
            ],
        };
    });

    const greenOverlay = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, SCREEN_WIDTH / 4], [0, 1], Extrapolation.CLAMP),
    }));

    const redOverlay = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-SCREEN_WIDTH / 4, 0], [1, 0], Extrapolation.CLAMP),
    }));

    if (isTop) {
        return (
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[cardStyles.cardWrapper, cardStyle, { zIndex: 10 }]}>
                    <RecipeCardContent recipe={recipe} />
                    {/* Overlays */}
                    <Animated.View style={[cardStyles.overlayRight, greenOverlay]}>
                        <Ionicons name="checkmark-circle" size={60} color="#34C759" />
                        <Text style={[cardStyles.overlayText, { color: '#34C759' }]}>Zum Plan!</Text>
                    </Animated.View>
                    <Animated.View style={[cardStyles.overlayLeft, redOverlay]}>
                        <Ionicons name="close-circle" size={60} color="#FF3B30" />
                        <Text style={[cardStyles.overlayText, { color: '#FF3B30' }]}>Weiter</Text>
                    </Animated.View>
                </Animated.View>
            </GestureDetector>
        );
    }

    return (
        <Animated.View style={[cardStyles.cardWrapper, cardStyle, { zIndex: 10 - stackOffset }]}>
            <RecipeCardContent recipe={recipe} />
        </Animated.View>
    );
}

// ── Swipe Deck ────────────────────────────────────────────────────────────────
interface SwipeDeckProps {
    recipes: Recipe[];
    onSwipeRight: (recipe: Recipe) => void;
    onSwipeLeft: (recipe: Recipe) => void;
    onEmpty: () => void;
}

export function SwipeDeck({ recipes, onSwipeRight, onSwipeLeft, onEmpty }: SwipeDeckProps) {
    const [index, setIndex] = useState(0);

    const handleRight = (recipe: Recipe) => {
        onSwipeRight(recipe);
        const next = index + 1;
        if (next >= recipes.length) onEmpty();
        else setIndex(next);
    };

    const handleLeft = (recipe: Recipe) => {
        onSwipeLeft(recipe);
        const next = index + 1;
        if (next >= recipes.length) onEmpty();
        else setIndex(next);
    };

    if (index >= recipes.length) {
        return (
            <View style={deckStyles.emptyState}>
                <Text style={deckStyles.emptyEmoji}>🎉</Text>
                <Text style={deckStyles.emptyTitle}>Alle Rezepte gesehen!</Text>
                <Text style={deckStyles.emptyText}>Kein passendes dabei? Schau in der Community vorbei.</Text>
            </View>
        );
    }

    // Show up to 3 cards, stacked
    const visibleRecipes = recipes.slice(index, index + 3);

    return (
        <View style={deckStyles.deck}>
            {visibleRecipes.map((recipe, i) => (
                <SwipeCard
                    key={`${recipe.id}-${index + i}`}
                    recipe={recipe}
                    isTop={i === 0}
                    stackOffset={i}
                    onSwipeRight={handleRight}
                    onSwipeLeft={handleLeft}
                />
            ))}
        </View>
    );
}

// ── SwipeDeck Modal ───────────────────────────────────────────────────────────
interface SwipeDeckModalProps {
    visible: boolean;
    onClose: () => void;
    recipes: Recipe[];
    onAccept: (recipe: Recipe) => void;
    dayName?: string;
}

export function SwipeDeckModal({ visible, onClose, recipes, onAccept, dayName }: SwipeDeckModalProps) {
    const [done, setDone] = useState(false);

    const handleSwipeRight = (recipe: Recipe) => {
        onAccept(recipe);
        onClose();
    };

    const handleSwipeLeft = (_recipe: Recipe) => {
        // Skip – continue to next card
    };

    const handleEmpty = () => {
        setDone(true);
    };

    // Reset when modal opens
    React.useEffect(() => {
        if (visible) setDone(false);
    }, [visible]);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={modalStyles.container}>
                {/* Header */}
                <View style={modalStyles.header}>
                    <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
                        <Ionicons name="close" size={22} color="#333" />
                    </TouchableOpacity>
                    <View style={modalStyles.headerCenter}>
                        <Text style={modalStyles.title}>Rezept wählen</Text>
                        {dayName && <Text style={modalStyles.subtitle}>{dayName}</Text>}
                    </View>
                    <View style={{ width: 36 }} />
                </View>

                {/* Hint */}
                <View style={modalStyles.hintRow}>
                    <View style={modalStyles.hintChip}>
                        <Ionicons name="arrow-back" size={14} color="#FF3B30" />
                        <Text style={[modalStyles.hintText, { color: '#FF3B30' }]}>Überspringen</Text>
                    </View>
                    <Text style={modalStyles.hintCenter}>Wische um zu wählen</Text>
                    <View style={modalStyles.hintChip}>
                        <Text style={[modalStyles.hintText, { color: '#34C759' }]}>Zum Plan</Text>
                        <Ionicons name="arrow-forward" size={14} color="#34C759" />
                    </View>
                </View>

                {/* Deck */}
                <View style={modalStyles.deckContainer}>
                    {done ? (
                        <View style={deckStyles.emptyState}>
                            <Text style={deckStyles.emptyEmoji}>🔍</Text>
                            <Text style={deckStyles.emptyTitle}>Alle Optionen gesehen</Text>
                            <TouchableOpacity style={modalStyles.closeAction} onPress={onClose}>
                                <Text style={modalStyles.closeActionText}>Schließen</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <SwipeDeck
                            recipes={recipes}
                            onSwipeRight={handleSwipeRight}
                            onSwipeLeft={handleSwipeLeft}
                            onEmpty={handleEmpty}
                        />
                    )}
                </View>

                {/* Progress */}
                <Text style={modalStyles.counter}>
                    {recipes.length} Rezepte verfügbar
                </Text>
            </View>
        </Modal>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const cardStyles = StyleSheet.create({
    cardWrapper: {
        position: 'absolute',
        width: SCREEN_WIDTH - 40,
        alignSelf: 'center',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
    },
    image: { width: '100%', height: 220 },
    imagePlaceholder: {
        width: '100%', height: 220,
        backgroundColor: '#F5F5F5',
        alignItems: 'center', justifyContent: 'center',
    },
    imagePlaceholderEmoji: { fontSize: 60 },
    imagePlaceholderText: { fontSize: 16, color: '#999', marginTop: 8, fontWeight: '600' },
    content: { padding: 20 },
    cuisineTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF3EE', paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 12, marginBottom: 10,
    },
    cuisineText: { fontSize: 12, color: ORANGE, fontWeight: '700' },
    title: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 6, lineHeight: 28 },
    description: { fontSize: 14, color: '#888', lineHeight: 20, marginBottom: 16 },
    macroRow: { flexDirection: 'row', gap: 8 },
    macroPill: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
    macroValue: { fontSize: 16, fontWeight: '800' },
    macroUnit: { fontSize: 11, color: '#AAA', marginTop: 2 },

    // Overlays
    overlayRight: {
        position: 'absolute', top: 40, left: 20,
        alignItems: 'center', gap: 4,
    },
    overlayLeft: {
        position: 'absolute', top: 40, right: 20,
        alignItems: 'center', gap: 4,
    },
    overlayText: { fontSize: 18, fontWeight: '800' },
});

const deckStyles = StyleSheet.create({
    deck: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
    emptyEmoji: { fontSize: 56 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#333' },
    emptyText: { fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: 30, lineHeight: 20 },
});

const modalStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
        backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
    headerCenter: { alignItems: 'center' },
    title: { fontSize: 18, fontWeight: '800', color: '#111' },
    subtitle: { fontSize: 13, color: '#999', marginTop: 2 },

    hintRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFF',
        borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    },
    hintChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    hintText: { fontSize: 12, fontWeight: '700' },
    hintCenter: { fontSize: 12, color: '#CCC' },

    deckContainer: { flex: 1, paddingTop: 20 },
    counter: { textAlign: 'center', fontSize: 12, color: '#CCC', paddingBottom: 20 },

    closeAction: {
        marginTop: 12, backgroundColor: ORANGE, paddingHorizontal: 28, paddingVertical: 14,
        borderRadius: 16,
    },
    closeActionText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
