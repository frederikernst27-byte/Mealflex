import React, { createContext, useContext, useState } from 'react';
import { WeeklyPlan, DayPlan, MealSlot } from '../types/mealplan';
import { OnboardingData } from './OnboardingContext';
import { generateMealPlan } from '../services/mealplanGenerator';
import { supabase } from '../../lib/supabase';
import { mockRecipes } from '../data/mockRecipes';
import { Recipe } from '../types/recipe';

interface MealplanContextType {
    activePlan: WeeklyPlan | null;
    planDbId: string | null;
    checkedIngredients: string[];
    likedRecipes: string[];
    dislikedRecipes: string[];
    favoriteRecipes: string[];
    isLoadingPlan: boolean;
    createNewPlan: (onboardingPrefs: OnboardingData) => Promise<WeeklyPlan>;
    loadPlanFromDb: (userId: string) => Promise<void>;
    toggleCookedStatus: (dayIndex: number, mealSlotId: string, cooked: boolean) => void;
    toggleShoppingItem: (ingredientKey: string) => void;
    swapMeal: (dayIndex: number, mealSlotId: string, communitySwapPool?: Recipe[]) => void;
    swapMealWithRecipe: (dayIndex: number, mealSlotId: string, recipe: Recipe) => void;
    toggleLike: (recipeId: string) => void;
    toggleDislike: (recipeId: string) => void;
    toggleFavorite: (recipeId: string) => void;
}

const MealplanContext = createContext<MealplanContextType | undefined>(undefined);

const DAY_NAMES = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export function MealplanProvider({ children }: { children: React.ReactNode }) {
    const [activePlan, setActivePlan] = useState<WeeklyPlan | null>(null);
    const [planDbId, setPlanDbId] = useState<string | null>(null);
    const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
    const [likedRecipes, setLikedRecipes] = useState<string[]>([]);
    const [dislikedRecipes, setDislikedRecipes] = useState<string[]>([]);
    const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);

    // ── Lade bestehenden Plan aus Supabase ──────────────────────
    const loadPlanFromDb = async (userId: string) => {
        setIsLoadingPlan(true);
        try {
            // Aktiven Plan laden
            const { data: planRow, error: planErr } = await supabase
                .from('meal_plans')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (planErr || !planRow) return;

            // Plan-Items laden
            const { data: items, error: itemsErr } = await supabase
                .from('meal_plan_items')
                .select('*')
                .eq('meal_plan_id', planRow.id)
                .order('day_index', { ascending: true });

            if (itemsErr || !items) return;

            // Plan aus DB rekonstruieren
            const daysMap: Record<number, MealSlot[]> = {};
            for (const item of items) {
                const recipe = mockRecipes.find(r => r.id === item.recipe_id);
                if (!recipe) continue;
                if (!daysMap[item.day_index]) daysMap[item.day_index] = [];
                daysMap[item.day_index].push({
                    id: item.id,          // DB-UUID als Slot-ID – für cooked-Update
                    recipe,
                    cooked: item.cooked,
                });
            }

            const days: DayPlan[] = Object.entries(daysMap).map(([idx, meals]) => ({
                date: DAY_NAMES[parseInt(idx)] ?? `Tag ${idx}`,
                dayIndex: parseInt(idx),
                meals,
            })).sort((a, b) => a.dayIndex - b.dayIndex);

            const plan: WeeklyPlan = {
                id: planRow.id,
                userId,
                weekNumber: planRow.week_number,
                year: planRow.year,
                days,
                createdAt: planRow.created_at,
            };

            setActivePlan(plan);
            setPlanDbId(planRow.id);
        } catch (e) {
            console.error('loadPlanFromDb error:', e);
        } finally {
            setIsLoadingPlan(false);
        }
    };

    // ── Neuen Plan erstellen + in DB speichern ──────────────────
    const createNewPlan = async (prefs: OnboardingData) => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id ?? 'guest-user';

        const newPlan = generateMealPlan(userId, prefs);
        setActivePlan(newPlan);
        setCheckedIngredients([]);

        // Alten aktiven Plan archivieren
        await supabase
            .from('meal_plans')
            .update({ status: 'archived' })
            .eq('user_id', userId)
            .eq('status', 'active');

        // Neuen Plan in DB anlegen
        const { data: planRow, error: planErr } = await supabase
            .from('meal_plans')
            .insert({
                user_id: userId,
                week_number: newPlan.weekNumber,
                year: newPlan.year,
                status: 'active',
            })
            .select()
            .single();

        if (planErr || !planRow) {
            console.error('Fehler beim Speichern des Plans:', planErr);
            return newPlan;
        }

        setPlanDbId(planRow.id);

        // Plan-Items speichern
        const items = newPlan.days.flatMap(day =>
            day.meals.map(meal => ({
                meal_plan_id: planRow.id,
                day_index: day.dayIndex,
                recipe_id: meal.recipe.id,
                cooked: false,
                source: 'generated',
            }))
        );

        const { error: itemsErr } = await supabase.from('meal_plan_items').insert(items);
        if (itemsErr) console.error('Fehler beim Speichern der Mahlzeiten:', itemsErr);

        return newPlan;
    };

    // ── Cooked-Status togglen + in DB sync ─────────────────────
    const toggleCookedStatus = async (dayIndex: number, mealSlotId: string, cooked: boolean) => {
        if (!activePlan) return;

        const updatedPlan = { ...activePlan };
        const day = updatedPlan.days.find(d => d.dayIndex === dayIndex);
        if (day) {
            const meal = day.meals.find(m => m.id === mealSlotId);
            if (meal) {
                meal.cooked = cooked;
                // Sync zu DB (mealSlotId ist die DB-UUID wenn Plan aus DB geladen)
                if (mealSlotId.includes('-') && mealSlotId.length > 20) {
                    await supabase
                        .from('meal_plan_items')
                        .update({ cooked })
                        .eq('id', mealSlotId);
                } else if (planDbId) {
                    await supabase
                        .from('meal_plan_items')
                        .update({ cooked })
                        .eq('meal_plan_id', planDbId)
                        .eq('day_index', dayIndex)
                        .eq('recipe_id', meal.recipe.id);
                }
            }
        }
        setActivePlan({ ...updatedPlan });
    };

    const toggleShoppingItem = (ingredientKey: string) => {
        setCheckedIngredients(prev =>
            prev.includes(ingredientKey) ? prev.filter(k => k !== ingredientKey) : [...prev, ingredientKey]
        );
    };

    const swapMeal = (dayIndex: number, mealSlotId: string, communitySwapPool: Recipe[] = []) => {
        if (!activePlan) return;

        const updatedPlan = { ...activePlan };
        const day = updatedPlan.days.find(d => d.dayIndex === dayIndex);
        if (day) {
            const meal = day.meals.find(m => m.id === mealSlotId);
            if (meal) {
                const currentId = meal.recipe.id;
                const communityAlts = communitySwapPool.filter(r => r.id !== currentId && !dislikedRecipes.includes(r.id));
                const mockAlts = mockRecipes.filter(r => r.id !== currentId && !dislikedRecipes.includes(r.id));
                const pool = communityAlts.length > 0 ? communityAlts : mockAlts;
                if (pool.length > 0) {
                    const pick = pool[Math.floor(Math.random() * pool.length)];
                    meal.recipe = pick;
                    meal.cooked = false;
                    // DB sync
                    if (planDbId) {
                        supabase.from('meal_plan_items')
                            .update({ recipe_id: pick.id, cooked: false, source: 'swapped' })
                            .eq('meal_plan_id', planDbId)
                            .eq('day_index', dayIndex)
                            .then(({ error }) => { if (error) console.error('Swap-DB-Fehler:', error); });
                    }
                }
            }
        }
        setActivePlan({ ...updatedPlan });
    };

    const swapMealWithRecipe = (dayIndex: number, mealSlotId: string, recipe: Recipe) => {
        if (!activePlan) return;
        const updatedPlan = { ...activePlan };
        const day = updatedPlan.days.find(d => d.dayIndex === dayIndex);
        if (day) {
            const meal = day.meals.find(m => m.id === mealSlotId);
            if (meal) {
                meal.recipe = recipe;
                meal.cooked = false;
                if (planDbId) {
                    supabase.from('meal_plan_items')
                        .update({ recipe_id: recipe.id, cooked: false, source: 'swapped' })
                        .eq('meal_plan_id', planDbId)
                        .eq('day_index', dayIndex)
                        .then(({ error }) => { if (error) console.error('SwapWithRecipe-DB-Fehler:', error); });
                }
            }
        }
        setActivePlan({ ...updatedPlan });
    };

    const toggleLike = (recipeId: string) => {
        setLikedRecipes(prev => {
            if (prev.includes(recipeId)) return prev.filter(id => id !== recipeId);
            setDislikedRecipes(dis => dis.filter(id => id !== recipeId));
            return [...prev, recipeId];
        });
    };

    const toggleDislike = (recipeId: string) => {
        setDislikedRecipes(prev => {
            if (prev.includes(recipeId)) return prev.filter(id => id !== recipeId);
            setLikedRecipes(lik => lik.filter(id => id !== recipeId));
            return [...prev, recipeId];
        });
    };

    const toggleFavorite = (recipeId: string) => {
        setFavoriteRecipes(prev =>
            prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
        );
    };

    return (
        <MealplanContext.Provider value={{
            activePlan,
            planDbId,
            checkedIngredients,
            likedRecipes,
            dislikedRecipes,
            favoriteRecipes,
            isLoadingPlan,
            createNewPlan,
            loadPlanFromDb,
            toggleCookedStatus,
            toggleShoppingItem,
            swapMeal,
            swapMealWithRecipe,
            toggleLike,
            toggleDislike,
            toggleFavorite,
        }}>
            {children}
        </MealplanContext.Provider>
    );
}

export function useMealplan() {
    const context = useContext(MealplanContext);
    if (context === undefined) throw new Error('useMealplan must be used within a MealplanProvider');
    return context;
}
