import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Recipe, NutritionGoal, CookingStyle } from '../types/recipe';
import { mockRecipes } from '../data/mockRecipes';
import { supabase } from '../../lib/supabase';
import {
    fetchApprovedRecipes,
    fetchMyRecipes,
    fetchSavedRecipeIds,
    toggleSaveDb,
    toggleLikeDb,
    saveRecipeToDb,
    uploadRecipePhoto,
} from '../services/communityService';

export type RecipeStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type SourceType = 'official' | 'community';

export interface CommunityRecipe extends Recipe {
    status: RecipeStatus;
    authorId: string;
    authorName: string;
    uploadedAt: string;
    saveCount: number;
    likeCount: number;
    ratingAvg: number;
    ratingCount: number;
    sourceType: SourceType;   // 'official' = von MealFlex kuratiert, 'community' = von Usern
}

export interface UploadDraft {
    title: string;
    description: string;
    cuisine: string;
    prepTime: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: { name: string; amount: string; unit: string }[];
    steps: string[];
    tags: string[];
    suitableGoals: NutritionGoal[];
    suitableStyles: CookingStyle[];
    imageUri?: string;        // lokale URI (vor Upload)
    addToSwap: boolean;
}

interface CommunityContextType {
    communityRecipes: CommunityRecipe[];
    savedRecipeIds: string[];
    likedRecipeIds: string[];
    swapQueueIds: string[];
    uploadDraft: UploadDraft;
    searchQuery: string;
    activeFilters: string[];
    isLoading: boolean;
    setSearchQuery: (q: string) => void;
    setActiveFilters: (f: string[]) => void;
    toggleSave: (recipeId: string) => void;
    toggleLikeCommunity: (recipeId: string) => void;
    addToSwapQueue: (recipeId: string) => void;
    removeFromSwapQueue: (recipeId: string) => void;
    submitRecipe: (draft: UploadDraft, imageUri?: string) => Promise<void>;
    updateUploadDraft: (partial: Partial<UploadDraft>) => void;
    resetUploadDraft: () => void;
    getSavedRecipes: () => CommunityRecipe[];
    getSwapQueueRecipes: () => Recipe[];
    getFilteredFeed: () => CommunityRecipe[];
    getAutosuggestions: (query: string) => string[];
    refreshFeed: () => Promise<void>;
}

// ── Offizielle Rezepte (kuratiert von MealFlex) ───────────────────
const OFFICIAL_RECIPES: CommunityRecipe[] = mockRecipes.map((r, i) => ({
    ...r,
    status: 'approved' as RecipeStatus,
    authorId: 'mealflex-official',
    authorName: 'MealFlex',
    uploadedAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    saveCount: Math.floor(Math.random() * 200) + 50,
    likeCount: Math.floor(Math.random() * 300) + 80,
    ratingAvg: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
    ratingCount: Math.floor(Math.random() * 100) + 20,
    sourceType: 'official' as SourceType,
    source: 'mock' as const,
}));

const AUTOSUGGEST_CHIPS = [
    'cut', 'bulk', 'healthy', 'keto', 'vegan', 'high-protein',
    'low-carb', 'quick', 'mealprep-friendly', 'breakfast',
    'asiatisch', 'italienisch', 'mediterran', 'amerikanisch',
    'skandinavisch', 'indisch', 'mexikanisch', 'griechisch', 'fish', 'bowl',
];

const emptyDraft: UploadDraft = {
    title: '', description: '', cuisine: '', prepTime: 20,
    calories: 400, protein: 30, carbs: 40, fat: 12,
    ingredients: [{ name: '', amount: '', unit: 'g' }],
    steps: [''], tags: [], suitableGoals: ['healthy'],
    suitableStyles: ['daily'], addToSwap: false,
};

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
    const [dbRecipes, setDbRecipes] = useState<CommunityRecipe[]>([]);
    const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
    const [likedRecipeIds, setLikedRecipeIds] = useState<string[]>([]);
    const [swapQueueIds, setSwapQueueIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [uploadDraft, setUploadDraft] = useState<UploadDraft>(emptyDraft);
    const [isLoading, setIsLoading] = useState(true);

    // Alle Rezepte: offizielle zuerst, dann Community aus DB
    const communityRecipes: CommunityRecipe[] = [...OFFICIAL_RECIPES, ...dbRecipes];

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            // Genehmigte Community-Rezepte aus DB laden
            const approved = await fetchApprovedRecipes();

            // Eigene (auch pending) Rezepte des eingeloggten Users laden
            let mine: CommunityRecipe[] = [];
            if (session?.user) {
                mine = await fetchMyRecipes(session.user.id);
                // Bereits geladene approved nicht doppelt zeigen
                const approvedIds = new Set(approved.map(r => r.id));
                mine = mine.filter(r => !approvedIds.has(r.id));

                // Gespeicherte Rezepte laden
                const savedIds = await fetchSavedRecipeIds(session.user.id);
                setSavedRecipeIds(savedIds);
            }

            setDbRecipes([...approved, ...mine]);
        } catch (e) {
            console.error('CommunityContext loadData error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const refreshFeed = async () => { await loadData(); };

    // ── Save toggeln ──────────────────────────────────────────────
    const toggleSave = async (recipeId: string) => {
        const isSaved = savedRecipeIds.includes(recipeId);
        setSavedRecipeIds(prev =>
            isSaved ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
        );
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            // Nur DB-Rezepte (UUIDs) werden in saved_recipes gespeichert
            if (recipeId.includes('-') && recipeId.length > 20) {
                toggleSaveDb(session.user.id, recipeId, isSaved);
            }
        }
    };

    // ── Like toggeln ──────────────────────────────────────────────
    const toggleLikeCommunity = async (recipeId: string) => {
        const isLiked = likedRecipeIds.includes(recipeId);
        setLikedRecipeIds(prev =>
            isLiked ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
        );
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && recipeId.includes('-') && recipeId.length > 20) {
            toggleLikeDb(session.user.id, recipeId, isLiked);
        }
    };

    const addToSwapQueue = (id: string) =>
        setSwapQueueIds(prev => prev.includes(id) ? prev : [...prev, id]);

    const removeFromSwapQueue = (id: string) =>
        setSwapQueueIds(prev => prev.filter(x => x !== id));

    // ── Rezept einreichen ─────────────────────────────────────────
    const submitRecipe = async (draft: UploadDraft, imageUri?: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Nicht eingeloggt');

        // Display-Name aus Profil holen
        const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, name')
            .eq('id', session.user.id)
            .maybeSingle();
        const displayName = profile?.display_name ?? profile?.name ?? session.user.email?.split('@')[0] ?? 'Anonym';

        // 1. Foto hochladen (falls vorhanden)
        let photoUrl: string | undefined;
        if (imageUri) {
            photoUrl = await uploadRecipePhoto(imageUri, session.user.id);
        }

        // 2. Rezept in DB speichern
        const recipeId = await saveRecipeToDb(draft, photoUrl, session.user.id, displayName);

        // 3. Lokal als pending hinzufügen (sofort im Feed sichtbar für den User)
        const localRecipe: CommunityRecipe = {
            id: recipeId,
            title: draft.title,
            description: draft.description,
            cuisine: draft.cuisine,
            prepTime: draft.prepTime,
            portions: 1,
            calories: draft.calories,
            macros: { protein: draft.protein, carbs: draft.carbs, fat: draft.fat },
            ingredients: draft.ingredients.filter(i => i.name.trim()).map(i => ({
                name: i.name, amount: parseFloat(i.amount) || 0, unit: i.unit as any,
            })),
            steps: draft.steps.filter(s => s.trim()),
            tags: draft.tags,
            suitableGoals: draft.suitableGoals,
            suitableStyles: draft.suitableStyles,
            imageUrl: photoUrl ?? draft.imageUri,
            status: 'pending',
            authorId: session.user.id,
            authorName: displayName,
            uploadedAt: new Date().toISOString(),
            saveCount: 0, likeCount: 0, ratingAvg: 0, ratingCount: 0,
            sourceType: 'community',
            source: 'community',
        };

        setDbRecipes(prev => [localRecipe, ...prev]);

        if (draft.addToSwap) addToSwapQueue(recipeId);
        setUploadDraft(emptyDraft);
    };

    const updateUploadDraft = (partial: Partial<UploadDraft>) =>
        setUploadDraft(prev => ({ ...prev, ...partial }));

    const resetUploadDraft = () => setUploadDraft(emptyDraft);

    const getSavedRecipes = () =>
        communityRecipes.filter(r => savedRecipeIds.includes(r.id));

    const getSwapQueueRecipes = (): Recipe[] =>
        communityRecipes.filter(r => swapQueueIds.includes(r.id));

    const getFilteredFeed = (): CommunityRecipe[] => {
        let results = communityRecipes.filter(
            r => r.status === 'approved' || r.sourceType === 'official'
        );
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            results = results.filter(r =>
                r.title.toLowerCase().includes(q) ||
                r.tags.some(t => t.toLowerCase().includes(q)) ||
                (r.cuisine ?? '').toLowerCase().includes(q) ||
                r.suitableGoals.some(g => g.toLowerCase().includes(q))
            );
        }
        if (activeFilters.length > 0) {
            results = results.filter(r =>
                activeFilters.every(f =>
                    r.tags.includes(f) ||
                    r.suitableGoals.includes(f as NutritionGoal) ||
                    (r.cuisine ?? '').toLowerCase() === f.toLowerCase()
                )
            );
        }
        // Saved first (boost), dann nach saveCount
        return results.sort((a, b) => {
            const aBoost = savedRecipeIds.includes(a.id) ? 1000 : 0;
            const bBoost = savedRecipeIds.includes(b.id) ? 1000 : 0;
            return (bBoost + b.saveCount) - (aBoost + a.saveCount);
        });
    };

    const getAutosuggestions = (query: string): string[] => {
        if (!query.trim()) return AUTOSUGGEST_CHIPS.slice(0, 8);
        const q = query.toLowerCase();
        const exact = AUTOSUGGEST_CHIPS.filter(c => c.startsWith(q));
        const partial = AUTOSUGGEST_CHIPS.filter(c => c.includes(q) && !c.startsWith(q));
        return [...exact, ...partial].slice(0, 6);
    };

    return (
        <CommunityContext.Provider value={{
            communityRecipes, savedRecipeIds, likedRecipeIds, swapQueueIds,
            uploadDraft, searchQuery, activeFilters, isLoading,
            setSearchQuery, setActiveFilters,
            toggleSave, toggleLikeCommunity,
            addToSwapQueue, removeFromSwapQueue,
            submitRecipe, updateUploadDraft, resetUploadDraft,
            getSavedRecipes, getSwapQueueRecipes, getFilteredFeed, getAutosuggestions,
            refreshFeed,
        }}>
            {children}
        </CommunityContext.Provider>
    );
}

export function useCommunity() {
    const ctx = useContext(CommunityContext);
    if (!ctx) throw new Error('useCommunity must be used within CommunityProvider');
    return ctx;
}
