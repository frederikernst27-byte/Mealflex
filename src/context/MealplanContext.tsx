import React, { createContext, useContext, useState } from 'react';
import { WeeklyPlan } from '../types/mealplan';
import { OnboardingData } from './OnboardingContext';
import { generateMealPlan } from '../services/mealplanGenerator';
import { supabase } from '../../lib/supabase';
import { mockRecipes } from '../data/mockRecipes';

interface MealplanContextType {
    activePlan: WeeklyPlan | null;
    checkedIngredients: string[];
    createNewPlan: (onboardingPrefs: OnboardingData) => Promise<WeeklyPlan>;
    toggleCookedStatus: (dayIndex: number, mealSlotId: string, cooked: boolean) => void;
    toggleShoppingItem: (ingredientKey: string) => void;
    swapMeal: (dayIndex: number, mealSlotId: string) => void;
}

const MealplanContext = createContext<MealplanContextType | undefined>(undefined);

export function MealplanProvider({ children }: { children: React.ReactNode }) {
    const [activePlan, setActivePlan] = useState<WeeklyPlan | null>(null);
    const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);

    const createNewPlan = async (prefs: OnboardingData) => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || 'guest-user';

        const newPlan = generateMealPlan(userId, prefs);
        setActivePlan(newPlan);
        setCheckedIngredients([]); // Reset shopping list on new plan
        return newPlan;
    };

    const toggleCookedStatus = (dayIndex: number, mealSlotId: string, cooked: boolean) => {
        if (!activePlan) return;
        const updatedPlan = { ...activePlan };
        const day = updatedPlan.days.find(d => d.dayIndex === dayIndex);
        if (day) {
            const meal = day.meals.find(m => m.id === mealSlotId);
            if (meal) {
                meal.cooked = cooked;
            }
        }
        setActivePlan(updatedPlan);
    };

    const toggleShoppingItem = (ingredientKey: string) => {
        setCheckedIngredients((prev) =>
            prev.includes(ingredientKey)
                ? prev.filter((k) => k !== ingredientKey)
                : [...prev, ingredientKey]
        );
    };

    const swapMeal = (dayIndex: number, mealSlotId: string) => {
        if (!activePlan) return;

        const updatedPlan = { ...activePlan };
        const day = updatedPlan.days.find(d => d.dayIndex === dayIndex);
        if (day) {
            const meal = day.meals.find(m => m.id === mealSlotId);
            if (meal) {
                // Simple MVP swap: pick a random recipe that isn't the current one
                const alternatives = mockRecipes.filter(r => r.id !== meal.recipe.id);
                if (alternatives.length > 0) {
                    const randomAlt = alternatives[Math.floor(Math.random() * alternatives.length)];
                    meal.recipe = randomAlt;
                    meal.cooked = false; // reset status
                }
            }
        }
        setActivePlan(updatedPlan);

        // When swapping, the shopping list will automatically re-calculate. 
        // We could selectively uncheck items here, but clearing is easier for MVP.
    };

    return (
        <MealplanContext.Provider value={{
            activePlan,
            checkedIngredients,
            createNewPlan,
            toggleCookedStatus,
            toggleShoppingItem,
            swapMeal
        }}>
            {children}
        </MealplanContext.Provider>
    );
}

export function useMealplan() {
    const context = useContext(MealplanContext);
    if (context === undefined) {
        throw new Error('useMealplan must be used within a MealplanProvider');
    }
    return context;
}
