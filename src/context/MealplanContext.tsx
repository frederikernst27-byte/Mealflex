import React, { createContext, useContext, useState } from 'react';
import { WeeklyPlan } from '../types/mealplan';
import { OnboardingData } from './OnboardingContext';
import { generateMealPlan } from '../services/mealplanGenerator';
import { supabase } from '../../lib/supabase';

interface MealplanContextType {
    activePlan: WeeklyPlan | null;
    createNewPlan: (onboardingPrefs: OnboardingData) => Promise<WeeklyPlan>;
    toggleCookedStatus: (dayIndex: number, mealSlotId: string, cooked: boolean) => void;
}

const MealplanContext = createContext<MealplanContextType | undefined>(undefined);

export function MealplanProvider({ children }: { children: React.ReactNode }) {
    const [activePlan, setActivePlan] = useState<WeeklyPlan | null>(null);

    const createNewPlan = async (prefs: OnboardingData) => {
        // Hole User ID aus Supabase (falls vorhanden) - mock für MVP falls ausgeloggt
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || 'guest-user';

        const newPlan = generateMealPlan(userId, prefs);
        setActivePlan(newPlan);
        return newPlan;
    };

    const toggleCookedStatus = (dayIndex: number, mealSlotId: string, cooked: boolean) => {
        if (!activePlan) return;

        // T22 - Cooked Status togglen. (Fließt schon in Epic 7 rein)
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

    return (
        <MealplanContext.Provider value={{ activePlan, createNewPlan, toggleCookedStatus }}>
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
